"use client";

import { useEffect, useRef, useState } from "react";
import { Wand2, ExternalLink, Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AutoApplyTask } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const STATUS_LABELS: Record<AutoApplyTask["status"], string> = {
    PENDING: "Queued",
    FILLING: "Filling form...",
    READY_FOR_REVIEW: "Ready for review",
    BLOCKED: "Blocked",
    FAILED: "Failed",
};

const STATUS_VARIANT: Record<AutoApplyTask["status"], "default" | "secondary" | "outline"> = {
    PENDING: "secondary",
    FILLING: "secondary",
    READY_FOR_REVIEW: "default",
    BLOCKED: "outline",
    FAILED: "outline",
};

export function AutoApplyButton({ applicationId, applyUrl }: { applicationId: string; applyUrl: string }) {
    const [open, setOpen] = useState(false);
    const [task, setTask] = useState<AutoApplyTask | null>(null);
    const [error, setError] = useState<string>("");
    const [busy, setBusy] = useState(false);
    const [screenshotBlob, setScreenshotBlob] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (screenshotBlob) URL.revokeObjectURL(screenshotBlob);
    }, [screenshotBlob]);

    // Fetch the screenshot via the auth-gated endpoint and create a blob URL.
    // The raw screenshotUrl on `task` is just a marker that one exists.
    useEffect(() => {
        if (!task?.screenshotUrl || !task.id) return;
        let cancelled = false;
        api.fetchAutoApplyScreenshotBlobUrl(task.id)
            .then((url) => {
                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }
                setScreenshotBlob((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
            })
            .catch(() => { /* ignore — screenshot is optional */ });
        return () => { cancelled = true; };
    }, [task?.id, task?.screenshotUrl]);

    async function start() {
        setError("");
        setBusy(true);
        try {
            const t = await api.startAutoApply(applicationId);
            setTask(t);
            setOpen(true);
            toast.info("Auto-apply started — filling form fields...");
            pollRef.current = setInterval(async () => {
                try {
                    const next = await api.getAutoApply(t.id);
                    setTask(next);
                    if (next.status === "READY_FOR_REVIEW") {
                        toast.success("Form filled! Open the apply page to review and submit.");
                    } else if (next.status === "BLOCKED") {
                        toast.warning(`Auto-apply blocked: ${next.blockedReason || "manual action required"}`);
                    } else if (next.status === "FAILED") {
                        toast.error(next.errors?.message || "Auto-apply failed");
                    }
                    if (next.status !== "PENDING" && next.status !== "FILLING") {
                        if (pollRef.current) {
                            clearInterval(pollRef.current);
                            pollRef.current = null;
                        }
                    }
                } catch {
                    // ignore transient poll errors
                }
            }, 1500);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Auto-apply failed to start";
            setError(msg);
            toast.error(msg);
            setOpen(true);
        } finally {
            setBusy(false);
        }
    }

    function copyKit() {
        if (!task?.filledFields) return;
        const lines = task.filledFields
            .filter((f) => f.value && f.inputType !== "file")
            .map((f) => `${f.label}: ${f.value}`)
            .join("\n");
        navigator.clipboard?.writeText(lines)
            .then(() => toast.success("Values copied to clipboard"))
            .catch(() => toast.error("Could not copy to clipboard"));
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={start} disabled={busy} className="rounded-xl">
                <Wand2 className="w-4 h-4 mr-2" /> Auto-apply
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Auto-apply (fill-and-pause)</DialogTitle>
                    </DialogHeader>

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {task && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                                {task.ats && <Badge variant="secondary">{task.ats}</Badge>}
                                {task.blockedReason && <span className="text-amber-700">{task.blockedReason}</span>}
                                {task.errors?.message && <span className="text-red-600">{task.errors.message}</span>}
                            </div>

                            {task.status === "FILLING" && (
                                <div className="rounded-xl border border-[#E8E8ED] p-4 text-sm text-[#86868B]">
                                    Visiting the apply page and filling fields with your profile + ATS PDF. This usually takes 10-30s.
                                </div>
                            )}

                            {task.filledFields && task.filledFields.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Detected fields ({task.filledFields.filter((f) => f.filled).length}/{task.filledFields.length} filled)</p>
                                        <Button size="sm" variant="outline" onClick={copyKit} className="rounded-xl">
                                            <Copy className="w-3 h-3 mr-2" /> Copy values
                                        </Button>
                                    </div>
                                    <div className="border border-[#E8E8ED] rounded-xl divide-y max-h-60 overflow-y-auto">
                                        {task.filledFields.map((f, i) => (
                                            <div key={i} className="px-3 py-2 text-sm flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">
                                                        {f.label || <span className="italic text-[#86868B]">(no label)</span>}
                                                        {f.required && <span className="ml-1 text-red-500">*</span>}
                                                    </p>
                                                    <p className="text-xs text-[#86868B] truncate">
                                                        {f.inputType === "file"
                                                            ? f.filled ? "✓ Resume uploaded" : "Resume not uploaded"
                                                            : f.value || <span className="italic">no match</span>}
                                                    </p>
                                                </div>
                                                {f.filled
                                                    ? <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
                                                    : <span className="text-xs text-[#86868B] shrink-0">skip</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {task.screenshotUrl && screenshotBlob && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Filled-form preview</p>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={screenshotBlob}
                                        alt="Auto-apply preview"
                                        className="rounded-xl border border-[#E8E8ED] max-h-80 w-full object-contain bg-[#F5F5F7]"
                                    />
                                </div>
                            )}

                            <div className="rounded-xl bg-[#F5F5F7] p-3 text-xs text-[#86868B]">
                                For your safety, JobPilot does <strong>not</strong> click submit. Open the apply page and finish manually.
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Close</Button>
                        <a href={task?.reviewUrl ?? applyUrl} target="_blank" rel="noreferrer">
                            <Button className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                                <ExternalLink className="w-4 h-4 mr-2" /> Open apply page
                            </Button>
                        </a>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
