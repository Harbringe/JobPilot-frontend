import {
    UserPublic,
    ProfileData,
    JobListing,
    ApplicationData,
    ApplicationStats,
    AuthResponse,
    JobEvaluation,
    InterviewStory,
    StoryInput,
    NegotiationScript,
    NegotiationType,
    NegotiationContext,
    Portal,
    PortalProvider,
    PortalScanProgress,
    AtsPdfResult,
    AiProviderName,
    UserAiConfigPublic,
    AiTestResult,
    AutoApplyTask,
    DiscoverProgress,
} from "./types";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "");

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

    async importResumeFile(file: File): Promise<Partial<ProfileData>> {
        const token = localStorage.getItem("accessToken");
        const form = new FormData();
        form.append("resume", file);
        const res = await fetch(`${BASE_URL}/profile/import-resume`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new ApiError(json.error?.code || "UNKNOWN", json.error?.message || "Import failed", res.status);
        }
        return json.data as Partial<ProfileData>;
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
        sources?: string[];
        salaryMin?: number;
        salaryMax?: number;
        postedWithinDays?: number;
    }): Promise<PaginatedResponse<JobListing>> {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.location) query.set("location", params.location);
        if (params?.remoteType) query.set("remoteType", params.remoteType);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        if (params?.sort) query.set("sort", params.sort);
        if (params?.source) query.set("source", params.source);
        if (params?.sources && params.sources.length > 0) query.set("sources", params.sources.join(","));
        if (params?.salaryMin) query.set("salaryMin", String(params.salaryMin));
        if (params?.salaryMax) query.set("salaryMax", String(params.salaryMax));
        if (params?.postedWithinDays) query.set("postedWithinDays", String(params.postedWithinDays));
        const qs = query.toString();
        return fetchApi<PaginatedResponse<JobListing>>(`/jobs${qs ? `?${qs}` : ""}`);
    },

    async getJobSources(): Promise<string[]> {
        return fetchApi<string[]>("/jobs/sources");
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

    // ── career-ops port: Evaluations ─────────────────────

    async getEvaluation(jobId: string): Promise<JobEvaluation | null> {
        try {
            return await fetchApi<JobEvaluation>(`/evaluations/jobs/${jobId}`);
        } catch (err) {
            if (err instanceof ApiError && err.code === "EVALUATION_NOT_FOUND") return null;
            throw err;
        }
    },

    async generateEvaluation(jobId: string, applicationId?: string, regenerate = false): Promise<JobEvaluation> {
        return fetchApi<JobEvaluation>(`/evaluations/jobs/${jobId}`, {
            method: "POST",
            body: JSON.stringify({ applicationId, regenerate }),
        });
    },

    async listEvaluations(params?: { applicationId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<JobEvaluation>> {
        const query = new URLSearchParams();
        if (params?.applicationId) query.set("applicationId", params.applicationId);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return fetchApi<PaginatedResponse<JobEvaluation>>(`/evaluations${qs ? `?${qs}` : ""}`);
    },

    async updateEvaluationBlock(id: string, blockName: string, content: unknown): Promise<JobEvaluation> {
        return fetchApi<JobEvaluation>(`/evaluations/${id}/blocks/${blockName}`, {
            method: "PATCH",
            body: JSON.stringify({ content }),
        });
    },

    async deleteEvaluation(id: string): Promise<void> {
        await fetchApi(`/evaluations/${id}`, { method: "DELETE" });
    },

    // ── career-ops port: Stories ─────────────────────────

    async getStories(params?: { competency?: string; tag?: string; q?: string; page?: number; limit?: number }): Promise<PaginatedResponse<InterviewStory>> {
        const query = new URLSearchParams();
        if (params?.competency) query.set("competency", params.competency);
        if (params?.tag) query.set("tag", params.tag);
        if (params?.q) query.set("q", params.q);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return fetchApi<PaginatedResponse<InterviewStory>>(`/stories${qs ? `?${qs}` : ""}`);
    },

    async createStory(data: StoryInput): Promise<InterviewStory> {
        return fetchApi<InterviewStory>(`/stories`, { method: "POST", body: JSON.stringify(data) });
    },

    async updateStory(id: string, data: Partial<StoryInput>): Promise<InterviewStory> {
        return fetchApi<InterviewStory>(`/stories/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },

    async deleteStory(id: string): Promise<void> {
        await fetchApi(`/stories/${id}`, { method: "DELETE" });
    },

    async generateStoriesFromApplication(applicationId: string, count = 4, experienceIds?: string[]): Promise<{ stories: InterviewStory[] }> {
        return fetchApi<{ stories: InterviewStory[] }>(`/stories/from-application/${applicationId}`, {
            method: "POST",
            body: JSON.stringify({ count, experienceIds }),
        });
    },

    // ── career-ops port: Negotiations ────────────────────

    async getNegotiations(applicationId?: string): Promise<PaginatedResponse<NegotiationScript>> {
        const qs = applicationId ? `?applicationId=${applicationId}` : "";
        return fetchApi<PaginatedResponse<NegotiationScript>>(`/negotiations${qs}`);
    },

    async generateNegotiation(input: { applicationId: string; type: NegotiationType; context: NegotiationContext }): Promise<NegotiationScript> {
        return fetchApi<NegotiationScript>(`/negotiations/generate`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async deleteNegotiation(id: string): Promise<void> {
        await fetchApi(`/negotiations/${id}`, { method: "DELETE" });
    },

    // ── career-ops port: ATS Resume PDF ──────────────────

    async generateAtsPdf(applicationId: string, regenerate = false): Promise<AtsPdfResult> {
        return fetchApi<AtsPdfResult>(`/resumes/${applicationId}/ats-pdf`, {
            method: "POST",
            body: JSON.stringify({ regenerate }),
        });
    },

    getAtsPdfUrl(applicationId: string): string {
        return `${BASE_URL}/resumes/${applicationId}/ats-pdf`;
    },

    /**
     * Fetches the auth-gated ATS PDF and returns a blob URL usable in
     * `<a href>` / `<img src>`. Caller is responsible for `URL.revokeObjectURL`
     * when the link is no longer needed.
     */
    async fetchAtsPdfBlobUrl(applicationId: string): Promise<string> {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/resumes/${applicationId}/ats-pdf`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to load PDF (HTTP ${res.status})`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    },

    /**
     * Fetches the auth-gated auto-apply screenshot and returns a blob URL.
     * Caller is responsible for `URL.revokeObjectURL`.
     */
    async fetchAutoApplyScreenshotBlobUrl(taskId: string): Promise<string> {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/autoapply/task/${taskId}/screenshot`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to load screenshot (HTTP ${res.status})`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    },

    // ── career-ops port: Portals ─────────────────────────

    async getPortals(): Promise<Portal[]> {
        return fetchApi<Portal[]>(`/portals`);
    },

    async createPortal(data: { company: string; provider: PortalProvider; url: string; filterTags?: string[]; enabled?: boolean }): Promise<Portal> {
        return fetchApi<Portal>(`/portals`, {
            method: "POST",
            body: JSON.stringify({
                ...data,
                filterTags: data.filterTags ?? [],
                enabled: data.enabled ?? true,
            }),
        });
    },

    async updatePortal(id: string, data: Partial<{ company: string; provider: PortalProvider; url: string; filterTags: string[]; enabled: boolean }>): Promise<Portal> {
        return fetchApi<Portal>(`/portals/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },

    async deletePortal(id: string): Promise<void> {
        await fetchApi(`/portals/${id}`, { method: "DELETE" });
    },

    async syncPortals(opts?: { portalIds?: string[]; all?: boolean }): Promise<PortalScanProgress> {
        return fetchApi<PortalScanProgress>(`/jobs/sync/portals`, {
            method: "POST",
            body: JSON.stringify({
                portalIds: opts?.portalIds,
                all: opts?.all ?? !opts?.portalIds,
            }),
        });
    },

    async getPortalSyncStatus(taskId: string): Promise<PortalScanProgress> {
        return fetchApi<PortalScanProgress>(`/jobs/sync/portals/${taskId}`);
    },

    // ── AI Provider settings ─────────────────────────────

    async getAiConfig(): Promise<UserAiConfigPublic> {
        return fetchApi<UserAiConfigPublic>(`/settings/ai`);
    },

    async updateAiConfig(input: {
        provider: AiProviderName;
        apiKey?: string;
        model?: string;
        baseUrl?: string;
    }): Promise<UserAiConfigPublic> {
        return fetchApi<UserAiConfigPublic>(`/settings/ai`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
    },

    async deleteAiConfig(): Promise<void> {
        await fetchApi(`/settings/ai`, { method: "DELETE" });
    },

    async testAiConfig(input: {
        provider: AiProviderName;
        apiKey: string;
        model?: string;
        baseUrl?: string;
    }): Promise<AiTestResult> {
        return fetchApi<AiTestResult>(`/settings/ai/test`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    // ── Discover pipeline ────────────────────────────────

    async startDiscover(opts?: { withPortals?: boolean; force?: boolean }): Promise<DiscoverProgress> {
        return fetchApi<DiscoverProgress>(`/jobs/discover`, {
            method: "POST",
            body: JSON.stringify({
                withPortals: opts?.withPortals ?? true,
                force: opts?.force ?? false,
            }),
        });
    },

    async getDiscoverStatus(taskId: string): Promise<DiscoverProgress> {
        return fetchApi<DiscoverProgress>(`/jobs/discover/${taskId}`);
    },

    // ── Auto-apply ───────────────────────────────────────

    async startAutoApply(applicationId: string): Promise<AutoApplyTask> {
        return fetchApi<AutoApplyTask>(`/autoapply/${applicationId}`, { method: "POST" });
    },

    async getAutoApply(taskId: string): Promise<AutoApplyTask> {
        return fetchApi<AutoApplyTask>(`/autoapply/task/${taskId}`);
    },

    async listAutoApply(applicationId?: string): Promise<AutoApplyTask[]> {
        const qs = applicationId ? `?applicationId=${applicationId}` : "";
        return fetchApi<AutoApplyTask[]>(`/autoapply${qs}`);
    },
};

export const api = realApi;

export { ApiError, BASE_URL };
