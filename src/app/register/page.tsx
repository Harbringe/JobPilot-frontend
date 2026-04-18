"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter");
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one digit");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            router.push("/dashboard/profile");
        } catch {
            setError("Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1D1D1F] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1D1D1F] via-[#2D2D2F] to-[#1D1D1F]" />
                <div className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-[#34C759]/10 blur-[100px]" />
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <Link href="/" className="flex items-center gap-2 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-[#2997FF]" />
                        </div>
                        <span className="text-xl font-semibold">JobPilot</span>
                    </Link>
                    <h1 className="text-5xl font-semibold leading-tight mb-6">
                        Start your<br />journey.
                    </h1>
                    <p className="text-lg text-white/50 max-w-sm">
                        Create your profile once. Apply to thousands of jobs with a single tap.
                    </p>

                    <div className="mt-12 space-y-4">
                        {["Free forever plan", "AI resume tailoring", "Unlimited applications"].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-white/70">
                                <div className="w-5 h-5 rounded-full bg-[#34C759]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                                </div>
                                <span className="text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden mb-10">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-semibold">JobPilot</span>
                        </Link>
                    </div>

                    <h2 className="text-3xl font-semibold mb-2">Create account</h2>
                    <p className="text-[#86868B] mb-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#2997FF] hover:underline">
                            Sign in
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 rounded-xl border-[#E8E8ED] bg-white px-4 focus-visible:ring-[#2997FF]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl border-[#E8E8ED] bg-white px-4 focus-visible:ring-[#2997FF]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl border-[#E8E8ED] bg-white px-4 pr-12 focus-visible:ring-[#2997FF]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="flex gap-1 mt-2">
                                {[
                                    password.length >= 8,
                                    /[A-Z]/.test(password),
                                    /[0-9]/.test(password),
                                ].map((met, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${met ? "bg-[#34C759]" : "bg-[#E8E8ED]"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white text-sm font-medium group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-xs text-[#86868B]">
                        By creating an account, you agree to our Terms & Privacy Policy.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
