"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    User,
    Settings,
    Zap,
    Menu,
    X,
    ChevronRight,
    Lock,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
    { href: "/dashboard/applications", icon: FileText, label: "Applications" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isProfileCompleted, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Guard: redirect to profile if not completed and not already on profile page
    useEffect(() => {
        if (!isLoading && user && !isProfileCompleted && pathname !== "/dashboard/profile") {
            router.replace("/dashboard/profile");
        }
    }, [isLoading, user, isProfileCompleted, pathname, router]);

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "U";

    const isLocked = !isProfileCompleted;

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-64 flex-col border-r border-[#E8E8ED] bg-white fixed inset-y-0 left-0 z-30">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold">JobPilot</span>
                    </Link>
                </div>

                {/* Onboarding Banner */}
                {isLocked && (
                    <div className="mx-3 mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-700 mb-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-semibold">Complete Setup</span>
                        </div>
                        <p className="text-[11px] text-amber-600 leading-relaxed">
                            Fill your profile & upload a resume to unlock all features.
                        </p>
                    </div>
                )}

                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname?.startsWith(item.href);
                        const isDisabled = isLocked && item.href !== "/dashboard/profile";

                        return (
                            <Link
                                key={item.href}
                                href={isDisabled ? "/dashboard/profile" : item.href}
                                onClick={(e) => {
                                    if (isDisabled) {
                                        e.preventDefault();
                                        router.push("/dashboard/profile");
                                    }
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isDisabled
                                        ? "text-[#C7C7CC] cursor-not-allowed"
                                        : isActive
                                            ? "bg-[#1D1D1F] text-white"
                                            : "text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                                    }`}
                            >
                                <item.icon className="w-4.5 h-4.5" />
                                {item.label}
                                {isDisabled && <Lock className="w-3 h-3 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-[#E8E8ED]">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-[#2997FF] text-white text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-[#86868B] truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-[#E8E8ED] flex items-center justify-between px-4">
                <button onClick={() => setSidebarOpen(true)} className="p-2">
                    <Menu className="w-5 h-5" />
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold">JobPilot</span>
                </Link>
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#2997FF] text-white text-xs">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-40 bg-black/20"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold">JobPilot</span>
                                </Link>
                                <button onClick={() => setSidebarOpen(false)} className="p-2">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Onboarding Banner */}
                            {isLocked && (
                                <div className="mx-3 mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <div className="flex items-center gap-2 text-amber-700 mb-1">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span className="text-xs font-semibold">Complete Setup</span>
                                    </div>
                                    <p className="text-[11px] text-amber-600 leading-relaxed">
                                        Fill your profile & upload a resume to unlock all features.
                                    </p>
                                </div>
                            )}

                            <nav className="flex-1 px-3 space-y-1">
                                {navItems.map((item) => {
                                    const isActive =
                                        item.href === "/dashboard"
                                            ? pathname === "/dashboard"
                                            : pathname?.startsWith(item.href);
                                    const isDisabled = isLocked && item.href !== "/dashboard/profile";

                                    return (
                                        <Link
                                            key={item.href}
                                            href={isDisabled ? "/dashboard/profile" : item.href}
                                            onClick={(e) => {
                                                setSidebarOpen(false);
                                                if (isDisabled) {
                                                    e.preventDefault();
                                                    router.push("/dashboard/profile");
                                                }
                                            }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isDisabled
                                                    ? "text-[#C7C7CC] cursor-not-allowed"
                                                    : isActive
                                                        ? "bg-[#1D1D1F] text-white"
                                                        : "text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                                                }`}
                                        >
                                            <item.icon className="w-4.5 h-4.5" />
                                            {item.label}
                                            {isDisabled && <Lock className="w-3 h-3 ml-auto" />}
                                            {isActive && !isDisabled && <ChevronRight className="w-4 h-4 ml-auto" />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
