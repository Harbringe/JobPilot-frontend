"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Portal, PortalProvider, PortalScanProgress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PROVIDERS: PortalProvider[] = ["ASHBY", "GREENHOUSE", "LEVER", "WORKABLE", "WELLFOUND", "CUSTOM"];

export default function PortalsPage() {
    const [portals, setPortals] = useState<Portal[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [company, setCompany] = useState("");
    const [provider, setProvider] = useState<PortalProvider>("GREENHOUSE");
    const [url, setUrl] = useState("");
    const [filterTags, setFilterTags] = useState("");
    const [progress, setProgress] = useState<PortalScanProgress | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    async function load() {
        setLoading(true);
        try {
            setPortals(await api.getPortals());
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    async function handleCreate() {
        await api.createPortal({
            company,
            provider,
            url,
            filterTags: filterTags.split(",").map((t) => t.trim()).filter(Boolean),
        });
        setOpen(false);
        setCompany("");
        setUrl("");
        setFilterTags("");
        await load();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this portal?")) return;
        await api.deletePortal(id);
        await load();
    }

    async function handleSync() {
        const initial = await api.syncPortals({ all: true });
        setProgress(initial);
        if (initial.status === "running") {
            pollRef.current = setInterval(async () => {
                try {
                    const next = await api.getPortalSyncStatus(initial.taskId);
                    setProgress(next);
                    if (next.status !== "running" && pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                        await load();
                    }
                } catch {
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                }
            }, 2000);
        }
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Job portals</h1>
                    <p className="text-sm text-[#86868B]">
                        Configure ATS portals (Ashby / Greenhouse / Lever / Workable / Wellfound) to scan for jobs.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSync} disabled={progress?.status === "running"}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${progress?.status === "running" ? "animate-spin" : ""}`} />
                        Sync portals
                    </Button>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add portal
                    </Button>
                </div>
            </header>

            {progress && (
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                            Scan {progress.status === "running" ? "running" : progress.status} —
                            {" "}{progress.portalsDone}/{progress.portalsTotal} portals
                        </p>
                        <span className="text-xs text-[#86868B]">+{progress.new} new · {progress.updated} updated</span>
                    </div>
                    <Progress value={progress.portalsTotal > 0 ? (progress.portalsDone / progress.portalsTotal) * 100 : 0} />
                    {progress.errors.length > 0 && (
                        <ul className="mt-3 text-xs text-red-600 space-y-1">
                            {progress.errors.map((e, i) => (
                                <li key={i}>{e.company} ({e.provider}): {e.error}</li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            {loading ? (
                <p className="text-sm text-[#86868B]">Loading...</p>
            ) : portals.length === 0 ? (
                <Card className="p-8 text-center text-[#86868B]">
                    No portals yet. Add a Greenhouse / Lever / Ashby / Workable / Wellfound URL.
                </Card>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {portals.map((p) => (
                        <Card key={p.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="font-semibold">{p.company}</p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Badge variant="secondary">{p.provider}</Badge>
                                        {p.userId === null && <Badge variant="outline">global</Badge>}
                                        {!p.enabled && <Badge variant="outline">disabled</Badge>}
                                    </div>
                                    <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-[#0066CC] underline">
                                        {p.url}
                                    </a>
                                    {p.filterTags.length > 0 && (
                                        <p className="text-xs text-[#86868B]">tags: {p.filterTags.join(", ")}</p>
                                    )}
                                    {p.lastScannedAt && (
                                        <p className="text-xs text-[#86868B]">
                                            Last scanned {new Date(p.lastScannedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                {p.userId !== null && (
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add portal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Company</Label>
                            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Anthropic" />
                        </div>
                        <div>
                            <Label>Provider</Label>
                            <Select value={provider} onValueChange={(v) => setProvider(v as PortalProvider)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>URL</Label>
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://jobs.ashbyhq.com/anthropic" />
                        </div>
                        <div>
                            <Label>Filter tags (comma-separated, optional)</Label>
                            <Input value={filterTags} onChange={(e) => setFilterTags(e.target.value)} placeholder="engineering, remote" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button disabled={!company || !url} onClick={handleCreate}>Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
