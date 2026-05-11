"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserPublic } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
    user: UserPublic | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isProfileCompleted: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    completeProfile: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        // Always go through a Promise.finally so setIsLoading isn't called
        // synchronously in the effect body (react-hooks/set-state-in-effect).
        const bootstrap = token
            ? api.getMe().then(
                (u) => setUser(u),
                () => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                },
            )
            : Promise.resolve();
        bootstrap.finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.login(email, password);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        setUser(res.user);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const res = await api.register(name, email, password);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        api.logout();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    }, []);

    const completeProfile = useCallback(() => {
        // Optimistic flip; backend will confirm on next getMe()
        setUser((u) => (u ? { ...u, profileCompleted: true } : u));
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const u = await api.getMe();
            setUser(u);
        } catch {
            // ignore — token errors are handled by the fetch helper
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isProfileCompleted: user?.profileCompleted ?? false,
                login,
                register,
                logout,
                completeProfile,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
