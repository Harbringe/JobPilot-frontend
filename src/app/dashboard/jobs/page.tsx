"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search,
    MapPin,
    Building2,
    DollarSign,
    Wifi,
    Clock,
    Sparkles,
    ExternalLink,
    Check,
    SlidersHorizontal,
    Target,
    TrendingUp,
    ArrowUpDown,
    X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { JobListing, JobSortMode } from "@/lib/types";
import { DiscoverButton } from "@/components/discover-button";
import { JobDetailDialog } from "@/components/job-detail-dialog";
import { useAuth } from "@/lib/auth-context";

const remoteTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    REMOTE: { label: "Remote", color: "#34C759", bg: "#EDFDF2" },
    HYBRID: { label: "Hybrid", color: "#FF9500", bg: "#FFF5E6" },
    ONSITE: { label: "On-site", color: "#2997FF", bg: "#EBF5FF" },
};

const SORT_OPTIONS: { value: JobSortMode; label: string; description: string; requiresAuth?: boolean }[] = [
    { value: "easy", label: "Easiest to land", description: "Highest chance of acceptance (needs scoring)", requiresAuth: true },
    { value: "match", label: "Best match", description: "Top profile fit", requiresAuth: true },
    { value: "date", label: "Newest first", description: "Recently posted" },
    { value: "salary", label: "Highest salary", description: "Top salary band first" },
    { value: "company", label: "Company A → Z", description: "Alphabetical" },
];

const RECENCY_OPTIONS = [
    { value: 0, label: "Any time" },
    { value: 1, label: "Last 24 hours" },
    { value: 7, label: "Last week" },
    { value: 14, label: "Last 2 weeks" },
    { value: 30, label: "Last month" },
];

function scoreColor(score: number): { color: string; bg: string } {
    if (score >= 80) return { color: "#34C759", bg: "#EDFDF2" };
    if (score >= 60) return { color: "#2997FF", bg: "#EBF5FF" };
    if (score >= 40) return { color: "#FF9500", bg: "#FFF5E6" };
    return { color: "#FF3B30", bg: "#FFF0EF" };
}

export default function JobsPage() {
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [search, setSearch] = useState("");
    const [remoteFilter, setRemoteFilter] = useState("ALL");
    const [sort, setSort] = useState<JobSortMode>(isAuthenticated ? "easy" : "date");
    const [salaryMin, setSalaryMin] = useState<string>("");
    const [salaryMax, setSalaryMax] = useState<string>("");
    const [postedWithinDays, setPostedWithinDays] = useState<number>(0);
    const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
    const [availableSources, setAvailableSources] = useState<string[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [detailJobId, setDetailJobId] = useState<string | null>(null);

    const activeFilterCount = useMemo(() => {
        let n = 0;
        if (remoteFilter !== "ALL") n++;
        if (salaryMin) n++;
        if (salaryMax) n++;
        if (postedWithinDays) n++;
        if (selectedSources.size > 0) n++;
        return n;
    }, [remoteFilter, salaryMin, salaryMax, postedWithinDays, selectedSources]);

    useEffect(() => {
        api.getJobSources().then(setAvailableSources).catch(() => { });
        api.getApplications({ limit: 200 }).then((res) => {
            const ids = new Set(res.items.map((a) => a.jobId));
            setAppliedJobs(ids);
        }).catch(() => { });
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const res = await api.getJobs({
                search: search || undefined,
                remoteType: remoteFilter !== "ALL" ? remoteFilter : undefined,
                sort,
                salaryMin: salaryMin ? Number(salaryMin) : undefined,
                salaryMax: salaryMax ? Number(salaryMax) : undefined,
                postedWithinDays: postedWithinDays || undefined,
                sources: selectedSources.size > 0 ? Array.from(selectedSources) : undefined,
                limit: 50,
            });
            setJobs(res.items);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(loadJobs, 300);
        return () => clearTimeout(debounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, remoteFilter, sort, salaryMin, salaryMax, postedWithinDays, selectedSources]);

    const handleApply = async (jobId: string) => {
        setApplyingId(jobId);
        try {
            await api.createApplication(jobId);
            setAppliedJobs((prev) => new Set(prev).add(jobId));
            toast.success("Application saved — check My Applications to track progress.");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to apply";
            if (msg.toLowerCase().includes("already")) {
                toast.info("You've already applied to this job.");
                setAppliedJobs((prev) => new Set(prev).add(jobId));
            } else {
                toast.error(msg);
            }
        }
        setApplyingId(null);
    };

    const clearFilters = () => {
        setRemoteFilter("ALL");
        setSalaryMin("");
        setSalaryMax("");
        setPostedWithinDays(0);
        setSelectedSources(new Set());
    };

    const formatSalary = (min?: number, max?: number, currency = "USD") => {
        if (!min && !max) return null;
        const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
        const fmt = (n: number) => `${symbol}${(n / 1000).toFixed(0)}K`;
        if (min && max && min !== max) return `${fmt(min)} - ${fmt(max)}`;
        if (min) return `${fmt(min)}+`;
        return `Up to ${fmt(max!)}`;
    };

    return (
        <div className="space-y-8">
            <div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold">
                    Jobs
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#86868B] mt-1">
                    {isAuthenticated
                        ? "Sorted by easiest to land based on your profile. Click any job to see the full posting."
                        : "Find your next role. Sign in to see your match score and ranking."}
                </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
                <DiscoverButton onComplete={() => loadJobs()} />
            </motion.div>

            {/* Search + Sort + Filters */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                    <Input
                        placeholder="Search title, company, keyword..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-xl border-[#E8E8ED] bg-white focus-visible:ring-[#2997FF]"
                    />
                </div>

                <Select value={sort} onValueChange={(v) => setSort(v as JobSortMode)}>
                    <SelectTrigger className="w-full sm:w-52 h-12 rounded-xl border-[#E8E8ED]">
                        <ArrowUpDown className="w-4 h-4 mr-2 text-[#86868B]" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} disabled={!!o.requiresAuth && !isAuthenticated}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{o.label}</span>
                                    <span className="text-[10px] text-[#86868B]">{o.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="h-12 rounded-xl border-[#E8E8ED] relative">
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge className="ml-2 text-[10px] bg-[#1D1D1F] text-white border-0 h-5 min-w-5 rounded-full">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="rounded-l-2xl">
                        <SheetHeader>
                            <SheetTitle>Filter jobs</SheetTitle>
                        </SheetHeader>

                        <div className="space-y-6 mt-6">
                            <div className="space-y-2">
                                <Label className="text-sm">Work type</Label>
                                <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                                    <SelectTrigger className="h-11 rounded-xl border-[#E8E8ED]">
                                        <Wifi className="w-4 h-4 mr-2 text-[#86868B]" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All types</SelectItem>
                                        <SelectItem value="REMOTE">Remote</SelectItem>
                                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                                        <SelectItem value="ONSITE">On-site</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Salary range (USD)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min e.g. 80000"
                                        value={salaryMin}
                                        onChange={(e) => setSalaryMin(e.target.value)}
                                        className="h-11 rounded-xl border-[#E8E8ED]"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max e.g. 200000"
                                        value={salaryMax}
                                        onChange={(e) => setSalaryMax(e.target.value)}
                                        className="h-11 rounded-xl border-[#E8E8ED]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Posted</Label>
                                <Select value={String(postedWithinDays)} onValueChange={(v) => setPostedWithinDays(Number(v))}>
                                    <SelectTrigger className="h-11 rounded-xl border-[#E8E8ED]">
                                        <Clock className="w-4 h-4 mr-2 text-[#86868B]" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RECENCY_OPTIONS.map((o) => (
                                            <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {availableSources.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm">Sources</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableSources.map((s) => {
                                            const active = selectedSources.has(s);
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => {
                                                        const next = new Set(selectedSources);
                                                        if (active) next.delete(s); else next.add(s);
                                                        setSelectedSources(next);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${active
                                                        ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
                                                        : "bg-white text-[#86868B] border-[#E8E8ED] hover:border-[#1D1D1F]"
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <SheetFooter className="mt-8 flex-row gap-2 justify-between sm:justify-between">
                            <Button variant="outline" onClick={clearFilters} className="rounded-xl" disabled={activeFilterCount === 0}>
                                <X className="w-4 h-4 mr-1" /> Clear
                            </Button>
                            <Button onClick={() => setFiltersOpen(false)} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                                Show {jobs.length} jobs
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </motion.div>

            {/* Job Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#E8E8ED] border-t-[#2997FF] rounded-full animate-spin" />
                </div>
            ) : jobs.length === 0 ? (
                <Card className="p-12 border-[#E8E8ED] text-center">
                    <Search className="w-12 h-12 text-[#E8E8ED] mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                    <p className="text-sm text-[#86868B]">
                        {sort === "easy" || sort === "match"
                            ? "No scored jobs yet — run Discover to fetch + score new postings."
                            : "Try adjusting your search or filters."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job, i) => {
                        const isApplied = appliedJobs.has(job.id);
                        const isApplying = applyingId === job.id;
                        const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
                        const remote = job.remoteType ? remoteTypeConfig[job.remoteType] : null;
                        const acceptanceCol = job.acceptanceScore != null ? scoreColor(job.acceptanceScore) : null;
                        const matchCol = job.matchScore != null ? scoreColor(job.matchScore) : null;

                        return (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.02 }}
                            >
                                <Card
                                    onClick={() => setDetailJobId(job.id)}
                                    className="p-6 border-[#E8E8ED] hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-sm font-bold text-[#1D1D1F] shrink-0">
                                                {job.company[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                                                <p className="text-xs text-[#86868B] flex items-center gap-1">
                                                    <Building2 className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{job.company}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {remote && (
                                            <Badge
                                                className="text-[10px] font-medium border-0 rounded-full shrink-0"
                                                style={{ backgroundColor: remote.bg, color: remote.color }}
                                            >
                                                {remote.label}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Score badges */}
                                    {(acceptanceCol || matchCol) && (
                                        <div className="flex gap-2 mb-3">
                                            {acceptanceCol && (
                                                <span
                                                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md"
                                                    style={{ backgroundColor: acceptanceCol.bg, color: acceptanceCol.color }}
                                                    title="Acceptance score — your chance to land this role"
                                                >
                                                    <TrendingUp className="w-3 h-3" />
                                                    {Math.round(job.acceptanceScore!)}% land
                                                </span>
                                            )}
                                            {matchCol && (
                                                <span
                                                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md"
                                                    style={{ backgroundColor: matchCol.bg, color: matchCol.color }}
                                                    title="Match score — profile fit"
                                                >
                                                    <Target className="w-3 h-3" />
                                                    {Math.round(job.matchScore!)}% match
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-sm text-[#86868B] line-clamp-2 mb-4 flex-1">
                                        {job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {job.requirements?.slice(0, 4).map((req) => (
                                            <span
                                                key={req}
                                                className="px-2.5 py-1 rounded-md bg-[#F5F5F7] text-[11px] font-medium text-[#1D1D1F]"
                                            >
                                                {req}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[#F5F5F7]">
                                        <div className="flex items-center gap-3 text-xs text-[#86868B] min-w-0">
                                            {job.location && (
                                                <span className="flex items-center gap-1 truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{job.location}</span>
                                                </span>
                                            )}
                                            {salary && (
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <DollarSign className="w-3 h-3" />
                                                    {salary}
                                                </span>
                                            )}
                                            {job.postedAt && (
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(job.postedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            {job.applyUrl && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[#86868B] hover:text-[#1D1D1F] rounded-lg h-8"
                                                    onClick={() => window.open(job.applyUrl, "_blank")}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                disabled={isApplied || isApplying}
                                                onClick={() => handleApply(job.id)}
                                                className={`rounded-lg h-8 px-4 text-xs font-medium ${isApplied
                                                    ? "bg-[#34C759] hover:bg-[#34C759] text-white"
                                                    : "bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white"
                                                    }`}
                                            >
                                                {isApplying ? (
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : isApplied ? (
                                                    <>
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Applied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        Quick Apply
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <JobDetailDialog
                jobId={detailJobId}
                open={!!detailJobId}
                onClose={() => setDetailJobId(null)}
                onApply={(id) => { handleApply(id); }}
                isApplied={detailJobId ? appliedJobs.has(detailJobId) : false}
                isApplying={detailJobId === applyingId}
            />
        </div>
    );
}
