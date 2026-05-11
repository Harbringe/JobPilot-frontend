"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { DiscoverProgress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PHASE_LABELS: Record<DiscoverProgress["phase"], string> = {
    "syncing-feeds": "Syncing job feeds...",
    "scanning-portals": "Scanning company portals...",
    scoring: "Scoring jobs against your profile...",
    done: "Done",
    failed: "Failed",
};

const PHASE_PCT: Record<DiscoverProgress["phase"], number> = {
    "syncing-feeds": 20,
    "scanning-portals": 50,
    scoring: 80,
    done: 100,
    failed: 100,
};

export function DiscoverButton({ onComplete }: { onComplete?: () => void }) {
    const [progress, setProgress] = useState<DiscoverProgress | null>(null);
    const [error, setError] = useState<string>("");
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    async function start() {
        setError("");
        try {
            const initial = await api.startDiscover({ withPortals: true });
            setProgress(initial);
            toast.info("Job discovery started...");
            pollRef.current = setInterval(async () => {
                try {
                    const next = await api.getDiscoverStatus(initial.taskId);
                    setProgress(next);
                    if (next.phase === "done" || next.phase === "failed") {
                        if (pollRef.current) {
                            clearInterval(pollRef.current);
                            pollRef.current = null;
                        }
                        if (next.phase === "done") {
                            const newCount = next.feeds?.new ?? 0;
                            toast.success(`Discovery complete — ${newCount} new jobs found`);
                            onComplete?.();
                        } else {
                            const errMsg = next.error || "Discovery failed";
                            setError(errMsg);
                            toast.error(errMsg);
                        }
                    }
                } catch (err) {
                    const msg = err instanceof Error ? err.message : "Status check failed";
                    setError(msg);
                }
            }, 2000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to start discovery";
            setError(msg);
            toast.error(msg);
        }
    }

    const running = progress && progress.phase !== "done" && progress.phase !== "failed";

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={start} disabled={!!running} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                    {running ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Discovering...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Find relevant jobs
                        </>
                    )}
                </Button>
                {error && <span className="text-xs text-[#86868B]">Last error: {error}</span>}
            </div>

            {progress && (
                <Card className="p-4 border-[#E8E8ED]">
                    <p className="text-sm font-medium">{PHASE_LABELS[progress.phase]}</p>
                    <Progress value={PHASE_PCT[progress.phase]} className="mt-2" />
                    <div className="text-xs text-[#86868B] mt-2 space-y-0.5">
                        {progress.feeds && (
                            <p>Feeds: +{progress.feeds.new} new, {progress.feeds.updated} updated · sources: {Object.entries(progress.feeds.sources).map(([k, v]) => `${k}=${v}`).join(", ")}</p>
                        )}
                        {progress.portals && (
                            <p>Portals: {progress.portals.portalsDone}/{progress.portals.portalsTotal} · +{progress.portals.new} new</p>
                        )}
                        {progress.scoring && (
                            <p>Scoring: {progress.scoring.scored} scored, {progress.scoring.skipped} skipped (already matched)</p>
                        )}
                        {progress.error && <p className="text-red-600">Error: {progress.error}</p>}
                    </div>
                </Card>
            )}
        </div>
    );
}
