import {
    UserPublic,
    ProfileData,
    JobListing,
    ApplicationData,
    ApplicationStats,
    AuthResponse,
} from "./types";
import { mockApi } from "./mock-data";

// ⚠️ Set to false when the Render backend is available
const USE_MOCK = true;

const BASE_URL = "https://jobpilot-c28k.onrender.com";

// ─── Core fetch helper ───────────────────────────────────

class ApiError extends Error {
    code: string;
    status: number;
    details?: { field: string; message: string }[];

    constructor(code: string, message: string, status: number, details?: { field: string; message: string }[]) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("accessToken");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const json = await res.json();

    // Handle token expiry — attempt refresh
    if (!res.ok && json.error?.code === "TOKEN_EXPIRED") {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            // Retry original request with new token
            headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
            const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
            const retryJson = await retryRes.json();
            if (!retryRes.ok || !retryJson.success) {
                throw new ApiError(
                    retryJson.error?.code || "UNKNOWN",
                    retryJson.error?.message || "Request failed",
                    retryRes.status,
                    retryJson.error?.details
                );
            }
            return retryJson.data as T;
        }
    }

    if (!res.ok || !json.success) {
        throw new ApiError(
            json.error?.code || "UNKNOWN",
            json.error?.message || "Request failed",
            res.status,
            json.error?.details
        );
    }

    return json.data as T;
}

async function tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
            localStorage.setItem("accessToken", json.data.accessToken);
            localStorage.setItem("refreshToken", json.data.refreshToken);
            return true;
        }
    } catch {
        // Refresh failed
    }

    // Clear tokens — user needs to log in again
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return false;
}

// ─── Paginated response type ─────────────────────────────

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── API methods ─────────────────────────────────────────

const realApi = {
    // ── Auth ──────────────────────────────────────────────

    async login(email: string, password: string): Promise<AuthResponse> {
        return fetchApi<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        return fetchApi<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, name }),
        });
    },

    async getMe(): Promise<UserPublic> {
        return fetchApi<UserPublic>("/auth/me");
    },

    async logout(): Promise<void> {
        try {
            await fetchApi("/auth/logout", { method: "POST" });
        } catch {
            // Ignore — we clear tokens anyway
        }
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await fetchApi("/auth/change-password", {
            method: "POST",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },

    async deleteAccount(password: string): Promise<void> {
        await fetchApi("/auth/delete-account", {
            method: "POST",
            body: JSON.stringify({ password }),
        });
    },

    // ── Profile ──────────────────────────────────────────

    async getProfile(): Promise<ProfileData | null> {
        try {
            return await fetchApi<ProfileData>("/profile");
        } catch (err) {
            if (err instanceof ApiError && (err.code === "PROFILE_NOT_FOUND" || err.status === 401)) {
                return null;
            }
            throw err;
        }
    },

    async updateProfile(data: ProfileData): Promise<ProfileData> {
        return fetchApi<ProfileData>("/profile", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async deleteProfile(): Promise<void> {
        await fetchApi("/profile", { method: "DELETE" });
    },

    // ── Jobs ─────────────────────────────────────────────

    async getJobs(params?: {
        search?: string;
        location?: string;
        remoteType?: string;
        page?: number;
        limit?: number;
        sort?: string;
        source?: string;
        salaryMin?: number;
    }): Promise<PaginatedResponse<JobListing>> {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.location) query.set("location", params.location);
        if (params?.remoteType) query.set("remoteType", params.remoteType);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        if (params?.sort) query.set("sort", params.sort);
        if (params?.source) query.set("source", params.source);
        if (params?.salaryMin) query.set("salaryMin", String(params.salaryMin));
        const qs = query.toString();
        return fetchApi<PaginatedResponse<JobListing>>(`/jobs${qs ? `?${qs}` : ""}`);
    },

    async getJob(id: string): Promise<JobListing | null> {
        try {
            return await fetchApi<JobListing>(`/jobs/${id}`);
        } catch (err) {
            if (err instanceof ApiError && err.code === "JOB_NOT_FOUND") {
                return null;
            }
            throw err;
        }
    },

    async syncJobs(): Promise<{ new: number; updated: number; total: number }> {
        return fetchApi("/jobs/sync", { method: "POST" });
    },

    async getMatchedJobs(params?: {
        minScore?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<JobListing & { matchScore?: number }>> {
        const query = new URLSearchParams();
        if (params?.minScore) query.set("minScore", String(params.minScore));
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return fetchApi(`/jobs/matched${qs ? `?${qs}` : ""}`);
    },

    async scoreAllJobs(force = false): Promise<unknown> {
        const qs = force ? "?force=true" : "";
        return fetchApi(`/jobs/score-all${qs}`, { method: "POST" });
    },

    async getJobInsights(id: string): Promise<unknown> {
        return fetchApi(`/jobs/${id}/insights`);
    },

    // ── Applications ─────────────────────────────────────

    async getApplications(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<ApplicationData>> {
        const query = new URLSearchParams();
        if (params?.status) query.set("status", params.status);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return fetchApi<PaginatedResponse<ApplicationData>>(`/applications${qs ? `?${qs}` : ""}`);
    },

    async createApplication(jobId: string, notes?: string): Promise<ApplicationData> {
        return fetchApi<ApplicationData>("/applications", {
            method: "POST",
            body: JSON.stringify({ jobId, notes }),
        });
    },

    async updateApplicationStatus(id: string, status: string): Promise<ApplicationData> {
        return fetchApi<ApplicationData>(`/applications/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    },

    async updateApplicationNotes(id: string, notes: string): Promise<ApplicationData> {
        return fetchApi<ApplicationData>(`/applications/${id}/notes`, {
            method: "PUT",
            body: JSON.stringify({ notes }),
        });
    },

    async deleteApplication(id: string): Promise<void> {
        await fetchApi(`/applications/${id}`, { method: "DELETE" });
    },

    async getStats(): Promise<ApplicationStats> {
        return fetchApi<ApplicationStats>("/applications/stats");
    },

    // ── Resumes ──────────────────────────────────────────

    async generateResume(applicationId: string, template = "modern"): Promise<unknown> {
        return fetchApi("/resumes", {
            method: "POST",
            body: JSON.stringify({ applicationId, template }),
        });
    },

    async getResumes(applicationId: string): Promise<unknown> {
        return fetchApi(`/resumes/${applicationId}`);
    },

    // ── Profile Export ───────────────────────────────────

    async exportProfile(): Promise<unknown> {
        return fetchApi("/profile/export");
    },
};

// Use mock API when backend is down, real API otherwise
export const api = USE_MOCK ? mockApi as unknown as typeof realApi : realApi;

export { ApiError };
