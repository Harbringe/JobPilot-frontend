"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Building2,
    MapPin,
    DollarSign,
    Clock,
    Wifi,
    ExternalLink,
    Sparkles,
    Check,
    Target,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import type { JobListing } from "@/lib/types";

interface Props {
    jobId: string | null;
    open: boolean;
    onClose: () => void;
    onApply?: (jobId: string) => void;
    isApplied?: boolean;
    isApplying?: boolean;
}

const remoteTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    REMOTE: { label: "Remote", color: "#34C759", bg: "#EDFDF2" },
    HYBRID: { label: "Hybrid", color: "#FF9500", bg: "#FFF5E6" },
    ONSITE: { label: "On-site", color: "#2997FF", bg: "#EBF5FF" },
};

function scoreColor(score: number): { color: string; bg: string; label: string } {
    if (score >= 80) return { color: "#34C759", bg: "#EDFDF2", label: "Strong fit" };
    if (score >= 60) return { color: "#2997FF", bg: "#EBF5FF", label: "Good fit" };
    if (score >= 40) return { color: "#FF9500", bg: "#FFF5E6", label: "Stretch" };
    return { color: "#FF3B30", bg: "#FFF0EF", label: "Long shot" };
}

function formatSalary(min?: number, max?: number, currency = "USD"): string | null {
    if (!min && !max) return null;
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
    const fmt = (n: number) => `${symbol}${(n / 1000).toFixed(0)}K`;
    if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

export function JobDetailDialog({ jobId, open, onClose, onApply, isApplied, isApplying }: Props) {
    const [job, setJob] = useState<JobListing | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !jobId) {
            setJob(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        api
            .getJob(jobId)
            .then((j) => {
                if (!cancelled) setJob(j);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [jobId, open]);

    const salary = job ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) : null;
    const remote = job?.remoteType ? remoteTypeConfig[job.remoteType] : null;
    const match = job?.matchScore != null ? scoreColor(job.matchScore) : null;
    const acceptance = job?.acceptanceScore != null ? scoreColor(job.acceptanceScore) : null;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
                {loading && (
                    <div className="py-16 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#E8E8ED] border-t-[#2997FF] rounded-full animate-spin" />
                    </div>
                )}
                {!loading && !job && (
                    <div className="py-16 text-center text-sm text-[#86868B]">
                        Job not found.
                    </div>
                )}
                {!loading && job && (
                    <>
                        <DialogHeader>
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-base font-bold text-[#1D1D1F] shrink-0">
                                    {job.company[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-xl text-left">{job.title}</DialogTitle>
                                    <p className="text-sm text-[#86868B] flex items-center gap-1 mt-1">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {job.company}
                                        <span className="text-[#C7C7CC]">·</span>
                                        <span className="text-[11px] uppercase tracking-wider">{job.source}</span>
                                    </p>
                                </div>
                                {remote && (
                                    <Badge
                                        className="text-[10px] font-medium border-0 rounded-full shrink-0"
                                        style={{ backgroundColor: remote.bg, color: remote.color }}
                                    >
                                        <Wifi className="w-3 h-3 mr-1" />
                                        {remote.label}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-4 text-xs text-[#86868B] py-2">
                            {job.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {job.location}
                                </span>
                            )}
                            {salary && (
                                <span className="flex items-center gap-1.5">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {salary}
                                </span>
                            )}
                            {job.postedAt && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Posted {new Date(job.postedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* Personalized scoring (only present when logged in + scored) */}
                        {(match || acceptance) && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-2 gap-3 py-2">
                                    {match && (
                                        <div
                                            className="rounded-xl p-3"
                                            style={{ backgroundColor: match.bg }}
                                        >
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: match.color }}>
                                                <Target className="w-3 h-3" />
                                                Match
                                            </div>
                                            <div className="text-lg font-bold mt-1" style={{ color: match.color }}>
                                                {Math.round(job.matchScore!)}%
                                            </div>
                                            <div className="text-[11px]" style={{ color: match.color }}>
                                                {match.label}
                                            </div>
                                        </div>
                                    )}
                                    {acceptance && (
                                        <div
                                            className="rounded-xl p-3"
                                            style={{ backgroundColor: acceptance.bg }}
                                        >
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: acceptance.color }}>
                                                <TrendingUp className="w-3 h-3" />
                                                Chance to land
                                            </div>
                                            <div className="text-lg font-bold mt-1" style={{ color: acceptance.color }}>
                                                {Math.round(job.acceptanceScore!)}%
                                            </div>
                                            <div className="text-[11px]" style={{ color: acceptance.color }}>
                                                {acceptance.label}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Match reasoning */}
                        {job.matchReason && (
                            <div className="rounded-xl bg-[#F5F5F7] p-3 text-xs text-[#1D1D1F] leading-relaxed">
                                <span className="font-semibold">Why this score: </span>
                                {job.matchReason}
                            </div>
                        )}

                        {/* Strong points */}
                        {job.strongPoints && job.strongPoints.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-[#34C759] uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Your strengths for this role
                                </p>
                                <ul className="space-y-1">
                                    {job.strongPoints.map((p, i) => (
                                        <li key={i} className="text-sm text-[#1D1D1F] flex gap-2">
                                            <span className="text-[#34C759]">✓</span>
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Missing skills */}
                        {job.missingSkills && job.missingSkills.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-[#FF9500] uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Gaps to address
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.missingSkills.map((s, i) => (
                                        <Badge
                                            key={i}
                                            className="text-[11px] font-medium border-0 bg-[#FFF5E6] text-[#FF9500] rounded-full"
                                        >
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                About the role
                            </h4>
                            <div className="prose-job text-sm text-[#1D1D1F] leading-relaxed">
                                {job.description ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{job.description}</ReactMarkdown>
                                ) : (
                                    <p className="text-[#86868B]">No description provided.</p>
                                )}
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                    Requirements
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.requirements.map((r, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 rounded-md bg-[#F5F5F7] text-[11px] font-medium text-[#1D1D1F]"
                                        >
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
                            {job.applyUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(job.applyUrl, "_blank", "noopener,noreferrer")}
                                    className="rounded-xl"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open on {job.source}
                                </Button>
                            )}
                            {onApply && (
                                <Button
                                    disabled={isApplied || isApplying}
                                    onClick={() => { onApply(job.id); }}
                                    className={`rounded-xl ${isApplied ? "bg-[#34C759] hover:bg-[#34C759]" : "bg-[#1D1D1F] hover:bg-[#1D1D1F]/90"} text-white`}
                                >
                                    {isApplying ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : isApplied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Already applied
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Quick Apply
                                        </>
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
