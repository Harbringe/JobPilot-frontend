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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileCompleted, setProfileCompleted] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const profileDone = localStorage.getItem("profileCompleted") === "true";
        setProfileCompleted(profileDone);

        if (token) {
            api
                .getMe()
                .then((u) => setUser(u))
                .catch(() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.login(email, password);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        setUser(res.user);

        const profileDone = localStorage.getItem("profileCompleted") === "true";
        setProfileCompleted(profileDone);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const res = await api.register(name, email, password);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.removeItem("profileCompleted");
        setUser(res.user);
        setProfileCompleted(false);
    }, []);

    const logout = useCallback(() => {
        api.logout();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    }, []);

    const completeProfile = useCallback(() => {
        localStorage.setItem("profileCompleted", "true");
        setProfileCompleted(true);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isProfileCompleted: profileCompleted,
                login,
                register,
                logout,
                completeProfile,
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
