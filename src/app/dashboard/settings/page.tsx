"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Trash2, AlertTriangle, Eye, EyeOff, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // Change password
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState("");

    // Delete account
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePw, setDeletePw] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");
        if (newPw.length < 8 || !/[A-Z]/.test(newPw) || !/[0-9]/.test(newPw)) {
            setPwError("Password: min 8 chars, 1 uppercase, 1 digit");
            return;
        }
        setPwLoading(true);
        try {
            await api.changePassword(currentPw, newPw);
            setPwLoading(false);
            setPwSuccess(true);
            setCurrentPw("");
            setNewPw("");
            setTimeout(() => {
                setPwSuccess(false);
                logout();
                router.push("/login");
            }, 1500);
        } catch (err: unknown) {
            setPwLoading(false);
            const message = err instanceof Error ? err.message : "Failed to change password";
            setPwError(message);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await api.deleteAccount(deletePw);
            setDeleteLoading(false);
            setShowDeleteDialog(false);
            logout();
            router.push("/");
        } catch {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold">Settings</motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#86868B] mt-1">Manage your account.</motion.p>
            </div>

            {/* Account Info */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="p-6 border-[#E8E8ED]">
                    <h3 className="text-lg font-semibold mb-4">Account</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[#86868B]">Email</span>
                            <span className="text-sm font-medium">{user?.email || "demo@jobpilot.dev"}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[#86868B]">Plan</span>
                            <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#EBF5FF] text-[#2997FF]">{user?.plan || "FREE"}</span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Change Password */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6 border-[#E8E8ED]">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-[#2997FF]" />
                        <h3 className="text-lg font-semibold">Change Password</h3>
                    </div>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {pwError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{pwError}</div>}
                        {pwSuccess && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-[#34C759]">Password changed! Redirecting to login...</div>}
                        <div className="space-y-2">
                            <Label className="text-sm">Current Password</Label>
                            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className="h-11 rounded-xl border-[#E8E8ED]" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">New Password</Label>
                            <div className="relative">
                                <Input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 digit" className="h-11 rounded-xl border-[#E8E8ED] pr-12" required />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B]">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" disabled={pwLoading} className="rounded-xl h-11 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white">
                            {pwLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Update Password"}
                        </Button>
                    </form>
                </Card>
            </motion.div>

            {/* Sign Out */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <Card className="p-6 border-[#E8E8ED]">
                    <div className="flex items-center gap-2 mb-2">
                        <LogOut className="w-5 h-5 text-[#86868B]" />
                        <h3 className="text-lg font-semibold">Sign Out</h3>
                    </div>
                    <p className="text-sm text-[#86868B] mb-4">Sign out of your JobPilot account on this device.</p>
                    <Button
                        variant="outline"
                        onClick={() => { logout(); router.push("/login"); }}
                        className="rounded-xl border-[#E8E8ED] text-[#1D1D1F] hover:bg-[#F5F5F7]"
                    >
                        <LogOut className="w-4 h-4 mr-2" />Sign Out
                    </Button>
                </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card className="p-6 border-red-200 bg-red-50/30">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-[#86868B] mb-4">Permanently delete your account and all data. This cannot be undone.</p>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />Delete Account
                    </Button>
                </Card>
            </motion.div>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>This action is permanent. Enter your password to confirm.</DialogDescription>
                    </DialogHeader>
                    <Input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} placeholder="Enter your password" className="h-11 rounded-xl border-[#E8E8ED]" />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleDeleteAccount} disabled={!deletePw || deleteLoading} className="rounded-xl bg-red-500 hover:bg-red-600 text-white">
                            {deleteLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
