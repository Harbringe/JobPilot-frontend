"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Briefcase,
    Eye,
    MessageSquare,
    Gift,
    TrendingUp,
    TrendingDown,
    CalendarDays,
    Building2,
    Check,
    X,
    Send,
    Search,
    Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ApplicationStats, ApplicationData } from "@/lib/types";

const statusConfig: Record<string, { color: string; bg: string }> = {
    SAVED: { color: "#86868B", bg: "#F5F5F7" },
    APPLIED: { color: "#2997FF", bg: "#EBF5FF" },
    SCREENING: { color: "#FF9500", bg: "#FFF5E6" },
    INTERVIEW: { color: "#AF52DE", bg: "#F6ECFD" },
    OFFER: { color: "#34C759", bg: "#EDFDF2" },
    ACCEPTED: { color: "#34C759", bg: "#EDFDF2" },
    DECLINED: { color: "#FF3B30", bg: "#FFF0EF" },
    REJECTED: { color: "#FF3B30", bg: "#FFF0EF" },
};

// Mini area chart component with animated gradient fill
function MiniAreaChart({
    data,
    color,
    width = 180,
    height = 64,
}: {
    data: number[];
    color: string;
    width?: number;
    height?: number;
}) {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const padding = 4;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const points = data.map((v, i) => ({
        x: padding + (i / (data.length - 1)) * chartW,
        y: padding + chartH - ((v - min) / range) * chartH,
    }));

    const linePath = points.map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) * 0.4;
        const cpx2 = prev.x + (p.x - prev.x) * 0.6;
        return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
    }).join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    const gradientId = `grad-${color.replace("#", "")}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
            </defs>
            {/* Area fill */}
            <motion.path
                d={areaPath}
                fill={`url(#${gradientId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            />
            {/* Line */}
            <motion.path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            />
            {/* End dot */}
            <motion.circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={3}
                fill={color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.3 }}
            />
        </svg>
    );
}

// Animated count-up
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => {
            const duration = 800;
            const startTime = Date.now();
            const step = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplay(Math.round(eased * value));
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return <>{display}</>;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ApplicationStats | null>(null);
    const [recentApps, setRecentApps] = useState<ApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);

    useEffect(() => {
        Promise.all([api.getStats(), api.getApplications({ limit: 5 })]).then(
            ([s, a]) => {
                setStats(s);
                setRecentApps(a.items.slice(0, 5));
                setLoading(false);
            }
        );
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-[#E8E8ED] border-t-[#2997FF] rounded-full animate-spin" />
            </div>
        );
    }

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    })();

    const firstName = user?.name?.split(" ")[0] || "there";

    // Status pipeline stages in order
    const statusPipeline = [
        { key: "APPLIED", label: "Applied", icon: <Send className="w-4 h-4" />, color: "#2997FF", bg: "#EBF5FF" },
        { key: "SCREENING", label: "Screening", icon: <Search className="w-4 h-4" />, color: "#FF9500", bg: "#FFF5E6" },
        { key: "INTERVIEW", label: "Interview", icon: <MessageSquare className="w-4 h-4" />, color: "#AF52DE", bg: "#F6ECFD" },
        { key: "OFFER", label: "Offer", icon: <Trophy className="w-4 h-4" />, color: "#34C759", bg: "#EDFDF2" },
    ];

    const getStageIndex = (status: string) => {
        const map: Record<string, number> = {
            SAVED: -1, APPLIED: 0, SCREENING: 1, INTERVIEW: 2,
            OFFER: 3, ACCEPTED: 3, DECLINED: 3, REJECTED: -2,
        };
        return map[status] ?? -1;
    };

    // Mock weekly trend data for each stat block
    const trendData = {
        totalApplied: [3, 5, 4, 7, 6, 8, stats?.total || 12],
        screening: [1, 2, 1, 3, 2, 3, stats?.byStatus?.SCREENING || 3],
        interviews: [0, 1, 1, 2, 1, 2, stats?.byStatus?.INTERVIEW || 2],
        offers: [0, 0, 0, 1, 0, 1, stats?.byStatus?.OFFER || 1],
    };

    const statCards = [
        {
            label: "Total Applied",
            value: stats?.total || 0,
            icon: <Briefcase className="w-5 h-5" />,
            color: "#2997FF",
            bg: "#EBF5FF",
            sub: "All time applications",
            trend: trendData.totalApplied,
            change: 14,
        },
        {
            label: "In Screening",
            value: stats?.byStatus?.SCREENING || 0,
            icon: <Eye className="w-5 h-5" />,
            color: "#FF9500",
            bg: "#FFF5E6",
            sub: "Awaiting response",
            trend: trendData.screening,
            change: 8,
        },
        {
            label: "Interviews",
            value: stats?.byStatus?.INTERVIEW || 0,
            icon: <MessageSquare className="w-5 h-5" />,
            color: "#AF52DE",
            bg: "#F6ECFD",
            sub: "Scheduled / active",
            trend: trendData.interviews,
            change: 25,
        },
        {
            label: "Offers",
            value: stats?.byStatus?.OFFER || 0,
            icon: <Gift className="w-5 h-5" />,
            color: "#34C759",
            bg: "#EDFDF2",
            sub: "Received",
            trend: trendData.offers,
            change: 100,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Greeting */}
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-semibold"
                >
                    {greeting}, {firstName} 👋
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[#86868B] mt-1"
                >
                    Here&apos;s your job search overview.
                </motion.p>
            </div>

            {/* Stat Cards with Inline Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                    >
                        <Card className="p-5 border-[#E8E8ED] hover:shadow-lg hover:-translate-y-0.5 transition-all h-full overflow-hidden">
                            {/* Top: Icon + Change badge */}
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: stat.bg, color: stat.color }}
                                >
                                    {stat.icon}
                                </div>
                                <div
                                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                                    style={{
                                        backgroundColor: stat.change >= 0 ? "#EDFDF2" : "#FFF0EF",
                                        color: stat.change >= 0 ? "#34C759" : "#FF3B30",
                                    }}
                                >
                                    {stat.change >= 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {stat.change >= 0 ? "+" : ""}
                                    {stat.change}%
                                </div>
                            </div>

                            {/* Number + Label */}
                            <div className="mb-1">
                                <div className="text-3xl font-bold" style={{ color: stat.color }}>
                                    <AnimatedNumber value={stat.value} delay={150 + i * 80} />
                                </div>
                                <div className="text-sm font-medium text-[#1D1D1F] mt-0.5">
                                    {stat.label}
                                </div>
                                <div className="text-[11px] text-[#86868B] mt-0.5">
                                    {stat.sub}
                                </div>
                            </div>

                            {/* Inline Area Chart */}
                            <div className="mt-3 -mx-1">
                                <MiniAreaChart
                                    data={stat.trend}
                                    color={stat.color}
                                    width={220}
                                    height={60}
                                />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Applications + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Applications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card className="p-6 border-[#E8E8ED]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold">Recent Applications</h3>
                            <Link
                                href="/dashboard/applications"
                                className="text-xs text-[#2997FF] hover:underline flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-1.5">
                            {recentApps.map((app, i) => {
                                const config = statusConfig[app.status];
                                const isSelected = selectedApp?.id === app.id;
                                return (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.06 }}
                                        onClick={() => setSelectedApp(isSelected ? null : app)}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all ${isSelected
                                            ? "bg-[#2997FF]/[0.07] ring-1 ring-[#2997FF]/30 shadow-sm"
                                            : "hover:bg-[#F5F5F7]/70"
                                            }`}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{ backgroundColor: isSelected ? config.color : config.bg, color: isSelected ? "#fff" : config.color }}
                                        >
                                            {isSelected ? <Check className="w-4 h-4" /> : app.job.company[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium truncate ${isSelected ? "text-[#2997FF]" : ""}`}>{app.job.title}</p>
                                                {app.matchScore && (
                                                    <span className="text-[10px] font-semibold text-[#34C759] bg-[#EDFDF2] px-1.5 py-0.5 rounded-md shrink-0">
                                                        {app.matchScore}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-[#86868B] flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" /> {app.job.company}
                                                </span>
                                                <span className="text-[10px] text-[#86868B]">•</span>
                                                <span className="text-xs text-[#86868B] flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3" /> {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            className="text-[10px] font-medium border-0 rounded-full px-2.5 shrink-0"
                                            style={{ backgroundColor: config.bg, color: config.color }}
                                        >
                                            {app.status}
                                        </Badge>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>

                {/* Activity / Status Tracker */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-6 border-[#E8E8ED] h-full">
                        <AnimatePresence mode="wait">
                            {selectedApp ? (
                                <motion.div
                                    key={`tracker-${selectedApp.id}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-semibold">Application Tracker</h3>
                                        <button
                                            onClick={() => setSelectedApp(null)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F5F5F7] transition-colors text-[#86868B] hover:text-[#1D1D1F]"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Selected app info */}
                                    <div className="flex items-center gap-2.5 mb-6 p-3 rounded-xl bg-[#F5F5F7]/60">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{ backgroundColor: statusConfig[selectedApp.status].bg, color: statusConfig[selectedApp.status].color }}
                                        >
                                            {selectedApp.job.company[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{selectedApp.job.title}</p>
                                            <p className="text-[11px] text-[#86868B]">{selectedApp.job.company}</p>
                                        </div>
                                    </div>

                                    {/* Status Pipeline */}
                                    <div className="space-y-0">
                                        {statusPipeline.map((stage, i) => {
                                            const currentIdx = getStageIndex(selectedApp.status);
                                            const isCompleted = i <= currentIdx;
                                            const isCurrent = i === currentIdx;
                                            const isLast = i === statusPipeline.length - 1;

                                            return (
                                                <div key={stage.key} className="flex gap-3 relative">
                                                    {/* Connector line */}
                                                    {!isLast && (
                                                        <div
                                                            className="absolute left-[15px] top-[32px] bottom-0 w-[2px] transition-colors duration-500"
                                                            style={{
                                                                backgroundColor: isCompleted && i < currentIdx ? stage.color : "#E8E8ED",
                                                            }}
                                                        />
                                                    )}
                                                    {/* Stage dot */}
                                                    <motion.div
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: isCurrent ? 1.05 : 1 }}
                                                        className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isCurrent ? "ring-4 shadow-sm" : ""
                                                            }`}
                                                        style={{
                                                            backgroundColor: isCompleted ? stage.color : "#F5F5F7",
                                                            color: isCompleted ? "#fff" : "#C7C7CC",
                                                            boxShadow: isCurrent ? `0 0 0 4px ${stage.color}30` : "none",
                                                        }}
                                                    >
                                                        {isCompleted ? <Check className="w-4 h-4" /> : stage.icon}
                                                    </motion.div>
                                                    {/* Stage text */}
                                                    <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                                                        <p className={`text-sm font-medium ${isCompleted ? "text-[#1D1D1F]" : "text-[#C7C7CC]"
                                                            }`}>
                                                            {stage.label}
                                                            {isCurrent && (
                                                                <span
                                                                    className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                                    style={{ backgroundColor: stage.bg, color: stage.color }}
                                                                >
                                                                    Current
                                                                </span>
                                                            )}
                                                        </p>
                                                        {isCompleted && (
                                                            <p className="text-[11px] text-[#86868B] mt-0.5">
                                                                {isCurrent
                                                                    ? `Updated ${new Date(selectedApp.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                                                    : `Completed`
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Show rejected banner if applicable */}
                                        {(selectedApp.status === "REJECTED" || selectedApp.status === "DECLINED") && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 p-3 rounded-xl bg-[#FFF0EF] flex items-center gap-2.5"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-[#FF3B30] flex items-center justify-center shrink-0">
                                                    <X className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#FF3B30]">
                                                        {selectedApp.status === "REJECTED" ? "Not Selected" : "Declined"}
                                                    </p>
                                                    <p className="text-[10px] text-[#FF3B30]/70">
                                                        {new Date(selectedApp.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="default-activity"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <h3 className="text-base font-semibold mb-2">Activity</h3>
                                    <p className="text-[11px] text-[#86868B] mb-5">Click a recent application to track its status →</p>
                                    <div className="space-y-0">
                                        {recentApps.slice(0, 4).map((app, i) => {
                                            const config = statusConfig[app.status];
                                            const actionText =
                                                app.status === "INTERVIEW"
                                                    ? "Interview scheduled"
                                                    : app.status === "SCREENING"
                                                        ? "Under review"
                                                        : app.status === "OFFER"
                                                            ? "Received offer 🎉"
                                                            : app.status === "APPLIED"
                                                                ? "Application sent"
                                                                : app.status === "REJECTED"
                                                                    ? "Not selected"
                                                                    : `Status: ${app.status}`;
                                            return (
                                                <div key={app.id} className="flex gap-3 pb-5 last:pb-0 relative">
                                                    {i < 3 && (
                                                        <div className="absolute left-[9px] top-[24px] bottom-0 w-[2px] bg-[#F5F5F7]" />
                                                    )}
                                                    <div
                                                        className="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10"
                                                        style={{ backgroundColor: config.bg }}
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: config.color }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{actionText}</p>
                                                        <p className="text-xs text-[#86868B] mt-0.5">
                                                            {app.job.company} — {app.job.title}
                                                        </p>
                                                        <p className="text-[10px] text-[#86868B]/60 mt-1">
                                                            {new Date(app.appliedAt).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Link href="/dashboard/applications" className="block mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-lg h-9 text-xs border-[#E8E8ED] hover:bg-[#F5F5F7]"
                                        >
                                            View all activity
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
