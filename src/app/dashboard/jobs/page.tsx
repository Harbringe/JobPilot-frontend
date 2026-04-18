"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { JobListing } from "@/lib/types";

const remoteTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    REMOTE: { label: "Remote", color: "#34C759", bg: "#EDFDF2" },
    HYBRID: { label: "Hybrid", color: "#FF9500", bg: "#FFF5E6" },
    ONSITE: { label: "On-site", color: "#2997FF", bg: "#EBF5FF" },
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [search, setSearch] = useState("");
    const [remoteFilter, setRemoteFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
    const [applyingId, setApplyingId] = useState<string | null>(null);

    useEffect(() => {
        loadJobs();
        // Load existing applications to mark already-applied jobs
        api.getApplications({ limit: 200 }).then((res) => {
            const ids = new Set(res.items.map((a) => a.jobId));
            setAppliedJobs(ids);
        }).catch(() => { });
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        const res = await api.getJobs({
            search: search || undefined,
            remoteType: remoteFilter !== "ALL" ? remoteFilter : undefined,
        });
        setJobs(res.items);
        setLoading(false);
    };

    useEffect(() => {
        const debounce = setTimeout(loadJobs, 300);
        return () => clearTimeout(debounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, remoteFilter]);

    const handleApply = async (jobId: string) => {
        setApplyingId(jobId);
        try {
            await api.createApplication(jobId);
            setAppliedJobs((prev) => new Set(prev).add(jobId));
        } catch {
            // Already applied
        }
        setApplyingId(null);
    };

    const formatSalary = (min?: number, max?: number, currency?: string) => {
        if (!min && !max) return null;
        const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
        if (min && max) return `${fmt(min)} - ${fmt(max)}`;
        if (min) return `${fmt(min)}+`;
        return `Up to ${fmt(max!)}`;
    };

    return (
        <div className="space-y-8">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-semibold"
                >
                    Jobs
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[#86868B] mt-1"
                >
                    Find your next role. Apply in one tap.
                </motion.p>
            </div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                    <Input
                        placeholder="Search by title, company, or keyword..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-xl border-[#E8E8ED] bg-white focus-visible:ring-[#2997FF]"
                    />
                </div>
                <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                    <SelectTrigger className="w-full sm:w-40 h-12 rounded-xl border-[#E8E8ED]">
                        <Wifi className="w-4 h-4 mr-2 text-[#86868B]" />
                        <SelectValue placeholder="Work Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ONSITE">On-site</SelectItem>
                    </SelectContent>
                </Select>
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
                        Try adjusting your search or filters.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job, i) => {
                        const isApplied = appliedJobs.has(job.id);
                        const isApplying = applyingId === job.id;
                        const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
                        const remote = job.remoteType ? remoteTypeConfig[job.remoteType] : null;

                        return (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.04 }}
                            >
                                <Card className="p-6 border-[#E8E8ED] hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-sm font-bold text-[#1D1D1F]">
                                                {job.company[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm">{job.title}</h3>
                                                <p className="text-xs text-[#86868B] flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {job.company}
                                                </p>
                                            </div>
                                        </div>
                                        {remote && (
                                            <Badge
                                                className="text-[10px] font-medium border-0 rounded-full"
                                                style={{ backgroundColor: remote.bg, color: remote.color }}
                                            >
                                                {remote.label}
                                            </Badge>
                                        )}
                                    </div>

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
                                        <div className="flex items-center gap-4 text-xs text-[#86868B]">
                                            {job.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {job.location}
                                                </span>
                                            )}
                                            {salary && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {salary}
                                                </span>
                                            )}
                                            {job.postedAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(job.postedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
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
        </div>
    );
}
