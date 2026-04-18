"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isDashboard = pathname?.startsWith("/dashboard");

    if (isDashboard) return null;

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? "glass shadow-sm"
                    : "bg-transparent"
                    }`}
            >
                <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">JobPilot</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                            Features
                        </Link>
                        <Link href="/#how-it-works" className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                            How it Works
                        </Link>
                        <Link href="dashboard/jobs" className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                            Jobs
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link href="/dashboard">
                                <Button className="rounded-full px-6 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-full px-5 text-sm">
                                        Sign in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-full px-6 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white text-sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            <Link href="/#features" onClick={() => setMobileOpen(false)} className="text-2xl font-medium">
                                Features
                            </Link>
                            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)} className="text-2xl font-medium">
                                How it Works
                            </Link>
                            <Link href="/jobs" onClick={() => setMobileOpen(false)} className="text-2xl font-medium">
                                Jobs
                            </Link>
                            <div className="border-t pt-6 mt-4 flex flex-col gap-3">
                                {isAuthenticated ? (
                                    <Link href="/dashboard">
                                        <Button className="w-full rounded-full bg-[#1D1D1F] text-white">
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="outline" className="w-full rounded-full">
                                                Sign in
                                            </Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button className="w-full rounded-full bg-[#1D1D1F] text-white">
                                                Get Started Free
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
