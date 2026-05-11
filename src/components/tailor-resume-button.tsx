"use client";

import { useState } from "react";
import { FileText, Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { AtsPdfResult } from "@/lib/types";

interface Props {
    applicationId: string;
    jobTitle?: string;
    company?: string;
}

/**
 * Per-job resume tailoring. Triggers AI rewrite of the user's profile bullets
 * toward the job description, then renders an ATS-friendly PDF. The user can
 * preview the extracted keywords and download the PDF.
 */
export function TailorResumeButton({ applicationId, jobTitle, company }: Props) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<AtsPdfResult | null>(null);

    async function tailor(regenerate: boolean) {
        setBusy(true);
        const toastId = toast.loading(
            regenerate ? "Regenerating tailored resume..." : "Tailoring resume to this job..."
        );
        try {
            const r = await api.generateAtsPdf(applicationId, regenerate);
            setResult(r);
            toast.dismiss(toastId);
            toast.success("Resume tailored — keywords extracted, PDF ready.");
            setOpen(true);
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err instanceof Error ? err.message : "Failed to tailor resume");
        } finally {
            setBusy(false);
        }
    }

    async function download() {
        try {
            const url = await api.fetchAtsPdfBlobUrl(applicationId);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${(company || "resume").replace(/\W+/g, "-")}-${(jobTitle || "ats").replace(/\W+/g, "-")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to download PDF");
        }
    }

    async function preview() {
        try {
            const url = await api.fetchAtsPdfBlobUrl(applicationId);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to open PDF");
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => tailor(false)}
                className="rounded-lg h-8 px-3 text-[11px] font-medium border-[#E8E8ED] text-[#1D1D1F] shrink-0"
                title="Generate an ATS-friendly resume tailored to this job"
            >
                {busy ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                    <FileText className="w-3.5 h-3.5 mr-1" />
                )}
                Tailor resume
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#AF52DE]" />
                            Resume tailored
                        </DialogTitle>
                        <DialogDescription>
                            We rewrote your experience bullets toward{" "}
                            <span className="font-medium text-[#1D1D1F]">
                                {jobTitle || "this role"}
                            </span>
                            {company ? ` at ${company}` : ""} and generated an ATS-friendly PDF.
                        </DialogDescription>
                    </DialogHeader>

                    {result?.keywords && result.keywords.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wider">
                                Keywords surfaced for ATS
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.keywords.map((k) => (
                                    <Badge
                                        key={k}
                                        className="text-[10px] font-medium bg-[#F5F5F7] text-[#1D1D1F] border-0 rounded-full"
                                    >
                                        {k}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2 sm:justify-between">
                        <Button
                            variant="outline"
                            onClick={() => tailor(true)}
                            disabled={busy}
                            className="rounded-xl"
                        >
                            {busy ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Regenerate
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={preview} className="rounded-xl">
                                Preview
                            </Button>
                            <Button onClick={download} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
