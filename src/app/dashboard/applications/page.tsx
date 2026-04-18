"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Filter,
    Clock,
    Building2,
    MapPin,
    ChevronDown,
    ChevronRight,
    FileText,
    Trash2,
    Send,
    Search,
    MessageSquare,
    Trophy,
    Bookmark,
    CheckCircle2,
    XCircle,
    X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { ApplicationData, ApplicationStatusType } from "@/lib/types";

const allStatuses: ApplicationStatusType[] = [
    "SAVED",
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "ACCEPTED",
    "DECLINED",
    "REJECTED",
];

const statusConfig: Record<
    string,
    { color: string; bg: string; label: string; icon: React.ReactNode; description: string }
> = {
    SAVED: {
        color: "#86868B",
        bg: "#F5F5F7",
        label: "Saved",
        icon: <Bookmark className="w-4 h-4" />,
        description: "Jobs you want to apply to later",
    },
    APPLIED: {
        color: "#2997FF",
        bg: "#EBF5FF",
        label: "Applied",
        icon: <Send className="w-4 h-4" />,
        description: "Applications submitted",
    },
    SCREENING: {
        color: "#FF9500",
        bg: "#FFF5E6",
        label: "Screening",
        icon: <Search className="w-4 h-4" />,
        description: "Under recruiter review",
    },
    INTERVIEW: {
        color: "#AF52DE",
        bg: "#F6ECFD",
        label: "Interview",
        icon: <MessageSquare className="w-4 h-4" />,
        description: "Interview stage",
    },
    OFFER: {
        color: "#34C759",
        bg: "#EDFDF2",
        label: "Offer",
        icon: <Trophy className="w-4 h-4" />,
        description: "Offers received",
    },
    ACCEPTED: {
        color: "#34C759",
        bg: "#EDFDF2",
        label: "Accepted",
        icon: <CheckCircle2 className="w-4 h-4" />,
        description: "Offers you accepted",
    },
    DECLINED: {
        color: "#FF3B30",
        bg: "#FFF0EF",
        label: "Declined",
        icon: <XCircle className="w-4 h-4" />,
        description: "Offers you declined",
    },
    REJECTED: {
        color: "#FF3B30",
        bg: "#FFF0EF",
        label: "Rejected",
        icon: <X className="w-4 h-4" />,
        description: "Applications not selected",
    },
};

// Group order: active pipeline first, then terminal states
const groupOrder: ApplicationStatusType[] = [
    "INTERVIEW",
    "SCREENING",
    "APPLIED",
    "OFFER",
    "ACCEPTED",
    "SAVED",
    "REJECTED",
    "DECLINED",
];

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [loading, setLoading] = useState(true);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        api.getApplications().then((res) => {
            setApplications(res.items);
            setLoading(false);
        });
    }, []);

    const filtered =
        filterStatus === "ALL"
            ? applications
            : applications.filter((a) => a.status === filterStatus);

    // Group applications by status
    const grouped = groupOrder.reduce(
        (acc, status) => {
            const apps = filtered.filter((a) => a.status === status);
            if (apps.length > 0) {
                acc.push({ status, apps });
            }
            return acc;
        },
        [] as { status: ApplicationStatusType; apps: ApplicationData[] }[]
    );

    const handleStatusChange = async (id: string, newStatus: string) => {
        await api.updateApplicationStatus(id, newStatus);
        setApplications((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: newStatus as ApplicationStatusType } : a
            )
        );
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteApplication(id);
            setApplications((prev) => prev.filter((a) => a.id !== id));
        } catch {
            // Ignore errors
        }
    };

    const toggleGroup = (status: string) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(status)) {
                next.delete(status);
            } else {
                next.add(status);
            }
            return next;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-[#E8E8ED] border-t-[#2997FF] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-semibold"
                    >
                        Applications
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[#86868B] mt-1"
                    >
                        Track and manage all your job applications.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-3"
                >
                    <Filter className="w-4 h-4 text-[#86868B]" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-44 h-10 rounded-xl border-[#E8E8ED]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            {allStatuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {statusConfig[s].label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </motion.div>
            </div>

            {/* Pipeline Summary Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-4 border-[#E8E8ED]">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <button
                            onClick={() => setFilterStatus("ALL")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterStatus === "ALL"
                                ? "bg-[#1D1D1F] text-white shadow-sm"
                                : "bg-[#F5F5F7] text-[#86868B] hover:bg-[#E8E8ED]"
                                }`}
                        >
                            All
                            <span
                                className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${filterStatus === "ALL"
                                    ? "bg-white/20"
                                    : "bg-[#E8E8ED]"
                                    }`}
                            >
                                {applications.length}
                            </span>
                        </button>
                        <div className="w-px h-6 bg-[#E8E8ED] mx-1" />
                        {groupOrder.map((s) => {
                            const count = applications.filter((a) => a.status === s).length;
                            if (count === 0) return null;
                            const config = statusConfig[s];
                            return (
                                <button
                                    key={s}
                                    onClick={() =>
                                        setFilterStatus(filterStatus === s ? "ALL" : s)
                                    }
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterStatus === s
                                        ? "shadow-sm ring-1"
                                        : "hover:opacity-90"
                                        }`}
                                    style={{
                                        backgroundColor:
                                            filterStatus === s ? config.color : config.bg,
                                        color: filterStatus === s ? "white" : config.color,
                                        outlineColor:
                                            filterStatus === s ? config.color : "transparent",
                                    }}
                                >
                                    {config.icon}
                                    {config.label}
                                    <span
                                        className="text-[11px] px-1.5 py-0.5 rounded-md font-bold"
                                        style={{
                                            backgroundColor:
                                                filterStatus === s
                                                    ? "rgba(255,255,255,0.25)"
                                                    : `${config.color}15`,
                                        }}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </motion.div>

            {/* Grouped Applications */}
            {filtered.length === 0 ? (
                <Card className="p-12 border-[#E8E8ED] text-center">
                    <FileText className="w-12 h-12 text-[#E8E8ED] mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications found</h3>
                    <p className="text-sm text-[#86868B]">
                        {filterStatus === "ALL"
                            ? "Start applying to jobs to see them here."
                            : `No applications with "${statusConfig[filterStatus]?.label}" status.`}
                    </p>
                </Card>
            ) : (
                <div className="space-y-5">
                    {grouped.map(({ status, apps }, gi) => {
                        const config = statusConfig[status];
                        const isCollapsed = collapsedGroups.has(status);

                        return (
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + gi * 0.06 }}
                            >
                                {/* Group Header */}
                                <button
                                    onClick={() => toggleGroup(status)}
                                    className="flex items-center gap-3 w-full mb-3 group"
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: config.bg,
                                            color: config.color,
                                        }}
                                    >
                                        {config.icon}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[#1D1D1F]">
                                            {config.label}
                                        </span>
                                        <span
                                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: config.bg,
                                                color: config.color,
                                            }}
                                        >
                                            {apps.length}
                                        </span>
                                        <span className="text-[11px] text-[#86868B] hidden sm:inline">
                                            — {config.description}
                                        </span>
                                    </div>
                                    <div className="ml-auto">
                                        <ChevronDown
                                            className={`w-4 h-4 text-[#86868B] transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""
                                                }`}
                                        />
                                    </div>
                                </button>

                                {/* Group Body */}
                                <AnimatePresence initial={false}>
                                    {!isCollapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <Card
                                                className="border-[#E8E8ED] overflow-hidden"
                                                style={{
                                                    borderLeft: `3px solid ${config.color}`,
                                                }}
                                            >
                                                {apps.map((app, i) => (
                                                    <div
                                                        key={app.id}
                                                        className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAFA] ${i < apps.length - 1
                                                            ? "border-b border-[#F5F5F7]"
                                                            : ""
                                                            }`}
                                                    >
                                                        {/* Company Icon */}
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                                                            style={{
                                                                backgroundColor: config.bg,
                                                                color: config.color,
                                                            }}
                                                        >
                                                            {app.job.company[0]}
                                                        </div>

                                                        {/* Job Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold truncate">
                                                                {app.job.title}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-[#86868B]">
                                                                <span className="flex items-center gap-1">
                                                                    <Building2 className="w-3 h-3" />
                                                                    {app.job.company}
                                                                </span>
                                                                {app.job.location && (
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {app.job.location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Notes (compact) */}
                                                        {app.notes && (
                                                            <div className="hidden lg:block max-w-[200px]">
                                                                <p className="text-[11px] text-[#86868B] truncate italic">
                                                                    &ldquo;{app.notes}&rdquo;
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Match Score */}
                                                        {app.matchScore !== null &&
                                                            app.matchScore !== undefined && (
                                                                <div className="shrink-0">
                                                                    <span
                                                                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${app.matchScore >= 80
                                                                            ? "bg-[#EDFDF2] text-[#34C759]"
                                                                            : app.matchScore >= 60
                                                                                ? "bg-[#FFF5E6] text-[#FF9500]"
                                                                                : "bg-[#FFF0EF] text-[#FF3B30]"
                                                                            }`}
                                                                    >
                                                                        {app.matchScore}% match
                                                                    </span>
                                                                </div>
                                                            )}

                                                        {/* Date */}
                                                        <div className="shrink-0 hidden sm:block">
                                                            <span className="text-[11px] text-[#86868B] flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(
                                                                    app.appliedAt
                                                                ).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                        </div>

                                                        {/* Status Dropdown */}
                                                        <Select
                                                            value={app.status}
                                                            onValueChange={(v) =>
                                                                handleStatusChange(app.id, v)
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                className="w-[120px] h-8 rounded-lg text-[11px] font-semibold border-0 shrink-0"
                                                                style={{
                                                                    backgroundColor: config.bg,
                                                                    color: config.color,
                                                                }}
                                                            >
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {allStatuses.map((s) => (
                                                                    <SelectItem
                                                                        key={s}
                                                                        value={s}
                                                                        className="text-xs"
                                                                    >
                                                                        {statusConfig[s].label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {/* Delete */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(app.id)}
                                                            className="text-[#C7C7CC] hover:text-[#FF3B30] hover:bg-[#FFF0EF] rounded-lg w-8 h-8 p-0 shrink-0"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </Card>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
