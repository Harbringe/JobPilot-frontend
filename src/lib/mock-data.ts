import {
    UserPublic,
    ProfileData,
    JobListing,
    ApplicationData,
    ApplicationStats,
} from "./types";

// ─── Mock User ───────────────────────────────────────────
export const mockUser: UserPublic = {
    id: "u-001",
    email: "demo@jobpilot.dev",
    name: "John Doe",
    avatarUrl: null,
    plan: "FREE",
    profileCompleted: true,
};

// ─── Mock Profile ────────────────────────────────────────
export const mockProfile: ProfileData = {
    id: "p-001",
    userId: "u-001",
    fullName: "John Doe",
    headline: "Full-Stack Developer",
    summary:
        "Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud infrastructure. Love turning complex problems into simple, elegant solutions.",
    phone: "+1-555-0123",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe",
    portfolioUrl: "https://johndoe.dev",
    preferences: {
        salaryMin: 120000,
        salaryMax: 200000,
        currency: "USD",
        remoteType: "REMOTE",
        visaRequired: false,
        industries: ["technology", "fintech"],
        locations: ["San Francisco", "Remote"],
    },
    experiences: [
        {
            id: "e-001",
            company: "TechCorp",
            title: "Senior Developer",
            location: "San Francisco, CA",
            startDate: "2022-03-01",
            endDate: null,
            current: true,
            description:
                "Led platform development for a SaaS product serving 50K+ users. Architected microservices with Node.js and managed CI/CD pipelines.",
            sortOrder: 0,
        },
        {
            id: "e-002",
            company: "StartupXYZ",
            title: "Full-Stack Developer",
            location: "Remote",
            startDate: "2020-01-15",
            endDate: "2022-02-28",
            current: false,
            description:
                "Built React frontends and Express APIs. Shipped 12 features from ideation to production. Reduced page load times by 40%.",
            sortOrder: 1,
        },
        {
            id: "e-003",
            company: "WebAgency",
            title: "Junior Developer",
            location: "New York, NY",
            startDate: "2018-06-01",
            endDate: "2019-12-31",
            current: false,
            description:
                "Developed client websites using React and WordPress. Managed 8+ client projects simultaneously.",
            sortOrder: 2,
        },
    ],
    educations: [
        {
            id: "ed-001",
            institution: "UC Berkeley",
            degree: "B.S.",
            field: "Computer Science",
            startDate: "2014-09-01",
            endDate: "2018-05-15",
            current: false,
            gpa: "3.7",
            description: "Dean's List, ACM Club President",
            sortOrder: 0,
        },
    ],
    skills: [
        { id: "s-001", name: "TypeScript", level: "EXPERT", category: "programming" },
        { id: "s-002", name: "React", level: "EXPERT", category: "frontend" },
        { id: "s-003", name: "Node.js", level: "ADVANCED", category: "backend" },
        { id: "s-004", name: "PostgreSQL", level: "ADVANCED", category: "database" },
        { id: "s-005", name: "AWS", level: "INTERMEDIATE", category: "cloud" },
        { id: "s-006", name: "Docker", level: "ADVANCED", category: "devops" },
        { id: "s-007", name: "Python", level: "INTERMEDIATE", category: "programming" },
        { id: "s-008", name: "GraphQL", level: "ADVANCED", category: "api" },
    ],
    projects: [
        {
            id: "pr-001",
            name: "DevFlow",
            description:
                "Open-source developer productivity dashboard with GitHub integration, task management, and analytics.",
            url: "https://github.com/johndoe/devflow",
            techStack: ["React", "Node.js", "PostgreSQL", "Docker"],
            sortOrder: 0,
        },
        {
            id: "pr-002",
            name: "QuickReply",
            description:
                "AI-powered email reply assistant that generated contextual responses. 2K+ daily active users.",
            url: "https://quickreply.dev",
            techStack: ["Next.js", "OpenAI", "Tailwind", "Vercel"],
            sortOrder: 1,
        },
    ],
    certifications: [
        {
            id: "c-001",
            name: "AWS Solutions Architect Associate",
            issuer: "Amazon Web Services",
            dateObtained: "2023-06-15",
            expiryDate: "2026-06-15",
            credentialUrl: "https://aws.amazon.com/verification",
        },
    ],
    updatedAt: "2026-02-20T10:30:00Z",
};

// ─── Mock Jobs ───────────────────────────────────────────
export const mockJobs: JobListing[] = [
    {
        id: "j-001",
        title: "Senior Frontend Engineer",
        company: "Google",
        companyLogoUrl: null,
        location: "Mountain View, CA",
        remoteType: "HYBRID",
        salaryMin: 180000,
        salaryMax: 280000,
        salaryCurrency: "USD",
        description:
            "Join Google's Cloud team to build next-generation user interfaces for cloud products. You'll work with React, TypeScript, and internal design systems to deliver delightful experiences to millions of developers.",
        requirements: ["React", "TypeScript", "5+ years", "Design Systems", "Testing"],
        source: "seed",
        applyUrl: "https://careers.google.com/jobs/1",
        postedAt: "2026-02-18T10:00:00Z",
        isActive: true,
    },
    {
        id: "j-002",
        title: "Full-Stack Engineer",
        company: "Stripe",
        companyLogoUrl: null,
        location: "San Francisco, CA",
        remoteType: "REMOTE",
        salaryMin: 170000,
        salaryMax: 250000,
        salaryCurrency: "USD",
        description:
            "Build financial infrastructure that powers the internet. Work across the full stack with Ruby, React, and our custom API framework to create seamless payment experiences.",
        requirements: ["React", "Ruby", "API Design", "3+ years", "Payments"],
        source: "seed",
        applyUrl: "https://stripe.com/jobs/1",
        postedAt: "2026-02-17T14:00:00Z",
        isActive: true,
    },
    {
        id: "j-003",
        title: "Staff Software Engineer",
        company: "Apple",
        companyLogoUrl: null,
        location: "Cupertino, CA",
        remoteType: "ONSITE",
        salaryMin: 220000,
        salaryMax: 350000,
        salaryCurrency: "USD",
        description:
            "Help shape the future of Apple's services ecosystem. Architect and implement high-scale backend systems that serve billions of requests daily across all Apple platforms.",
        requirements: ["Java", "Distributed Systems", "8+ years", "System Design"],
        source: "seed",
        applyUrl: "https://jobs.apple.com/1",
        postedAt: "2026-02-16T09:00:00Z",
        isActive: true,
    },
    {
        id: "j-004",
        title: "React Native Developer",
        company: "Airbnb",
        companyLogoUrl: null,
        location: "Remote",
        remoteType: "REMOTE",
        salaryMin: 150000,
        salaryMax: 220000,
        salaryCurrency: "USD",
        description:
            "Build the next generation of Airbnb's mobile experience. You'll work on cross-platform features using React Native, collaborate with designers, and optimize for performance.",
        requirements: ["React Native", "iOS", "Android", "3+ years", "Mobile"],
        source: "seed",
        applyUrl: "https://careers.airbnb.com/1",
        postedAt: "2026-02-15T12:00:00Z",
        isActive: true,
    },
    {
        id: "j-005",
        title: "Platform Engineer",
        company: "Netflix",
        companyLogoUrl: null,
        location: "Los Gatos, CA",
        remoteType: "HYBRID",
        salaryMin: 200000,
        salaryMax: 300000,
        salaryCurrency: "USD",
        description:
            "Build and maintain the platform that powers the world's leading streaming service. Focus on reliability, scalability, and developer experience across Netflix's infrastructure.",
        requirements: ["Go", "Kubernetes", "AWS", "5+ years", "SRE"],
        source: "seed",
        applyUrl: "https://jobs.netflix.com/1",
        postedAt: "2026-02-14T08:00:00Z",
        isActive: true,
    },
    {
        id: "j-006",
        title: "AI/ML Engineer",
        company: "OpenAI",
        companyLogoUrl: null,
        location: "San Francisco, CA",
        remoteType: "HYBRID",
        salaryMin: 250000,
        salaryMax: 400000,
        salaryCurrency: "USD",
        description:
            "Work on cutting-edge AI systems at the frontier of artificial intelligence. Build, train, and deploy large language models that are used by millions of people worldwide.",
        requirements: ["Python", "PyTorch", "ML", "5+ years", "NLP"],
        source: "seed",
        applyUrl: "https://openai.com/careers/1",
        postedAt: "2026-02-13T11:00:00Z",
        isActive: true,
    },
];

// ─── Mock Applications ───────────────────────────────────
export const mockApplications: ApplicationData[] = [
    {
        id: "a-001",
        userId: "u-001",
        jobId: "j-001",
        status: "INTERVIEW",
        matchScore: 92,
        notes: "Great culture fit. Preparing for system design round.",
        appliedAt: "2026-02-19T10:00:00Z",
        updatedAt: "2026-02-22T14:00:00Z",
        job: mockJobs[0],
    },
    {
        id: "a-002",
        userId: "u-001",
        jobId: "j-002",
        status: "APPLIED",
        matchScore: 88,
        notes: "Submitted resume. Waiting for response.",
        appliedAt: "2026-02-18T09:00:00Z",
        updatedAt: "2026-02-18T09:00:00Z",
        job: mockJobs[1],
    },
    {
        id: "a-003",
        userId: "u-001",
        jobId: "j-003",
        status: "SCREENING",
        matchScore: 76,
        notes: "Passed initial HR screen. Technical assessment pending.",
        appliedAt: "2026-02-17T15:00:00Z",
        updatedAt: "2026-02-20T11:00:00Z",
        job: mockJobs[2],
    },
    {
        id: "a-004",
        userId: "u-001",
        jobId: "j-004",
        status: "OFFER",
        matchScore: 95,
        notes: "Received offer! Reviewing compensation package.",
        appliedAt: "2026-02-10T08:00:00Z",
        updatedAt: "2026-02-23T16:00:00Z",
        job: mockJobs[3],
    },
    {
        id: "a-005",
        userId: "u-001",
        jobId: "j-005",
        status: "REJECTED",
        matchScore: 65,
        notes: "Did not move forward after technical round.",
        appliedAt: "2026-02-12T10:00:00Z",
        updatedAt: "2026-02-21T09:00:00Z",
        job: mockJobs[4],
    },
    {
        id: "a-006",
        userId: "u-001",
        jobId: "j-006",
        status: "SAVED",
        matchScore: null,
        notes: "Interesting role. Need to tailor resume for AI focus.",
        appliedAt: "2026-02-22T14:00:00Z",
        updatedAt: "2026-02-22T14:00:00Z",
        job: mockJobs[5],
    },
];

// ─── Mock Stats ──────────────────────────────────────────
export const mockStats: ApplicationStats = {
    total: 24,
    byStatus: {
        SAVED: 3,
        APPLIED: 8,
        SCREENING: 5,
        INTERVIEW: 4,
        OFFER: 2,
        ACCEPTED: 1,
        REJECTED: 1,
    },
};

// ─── Mock API Functions ──────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
    // Auth
    async login(email: string, _password: string) {
        await delay(800);
        const profileDone = localStorage.getItem("profileCompleted") === "true";
        const storedName = localStorage.getItem("userName") || mockUser.name;
        return {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: { ...mockUser, name: storedName, email, profileCompleted: profileDone },
        };
    },

    async register(name: string, email: string, _password: string) {
        await delay(800);
        localStorage.removeItem("profileCompleted");
        localStorage.setItem("userName", name);
        return {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: { ...mockUser, name, email, profileCompleted: false },
        };
    },

    async getMe() {
        await delay(300);
        const profileDone = localStorage.getItem("profileCompleted") === "true";
        const storedName = localStorage.getItem("userName") || mockUser.name;
        return { ...mockUser, name: storedName, profileCompleted: profileDone };
    },

    // Profile
    async getProfile() {
        await delay(500);
        return mockProfile;
    },

    async updateProfile(data: ProfileData) {
        await delay(600);
        return { ...mockProfile, ...data };
    },

    // Jobs
    async getJobs(params?: {
        search?: string;
        location?: string;
        remoteType?: string;
        page?: number;
        limit?: number;
    }) {
        await delay(400);
        let filtered = [...mockJobs];
        if (params?.search) {
            const q = params.search.toLowerCase();
            filtered = filtered.filter(
                (j) =>
                    j.title.toLowerCase().includes(q) ||
                    j.company.toLowerCase().includes(q) ||
                    j.description.toLowerCase().includes(q)
            );
        }
        if (params?.location) {
            const loc = params.location.toLowerCase();
            filtered = filtered.filter((j) =>
                j.location?.toLowerCase().includes(loc)
            );
        }
        if (params?.remoteType) {
            filtered = filtered.filter((j) => j.remoteType === params.remoteType);
        }
        return {
            items: filtered,
            total: filtered.length,
            page: params?.page || 1,
            limit: params?.limit || 20,
            totalPages: 1,
        };
    },

    async getJob(id: string) {
        await delay(300);
        return mockJobs.find((j) => j.id === id) || null;
    },

    // Applications
    async getApplications(params?: { status?: string; page?: number; limit?: number }) {
        await delay(400);
        let filtered = [...mockApplications];
        if (params?.status) {
            filtered = filtered.filter((a) => a.status === params.status);
        }
        return {
            items: filtered,
            total: filtered.length,
            page: params?.page || 1,
            limit: params?.limit || 20,
            totalPages: 1,
        };
    },

    async createApplication(jobId: string, notes?: string) {
        await delay(500);
        const job = mockJobs.find((j) => j.id === jobId);
        if (!job) throw new Error("Job not found");
        const app: ApplicationData = {
            id: `a-${Date.now()}`,
            userId: "u-001",
            jobId,
            status: "SAVED",
            matchScore: Math.floor(Math.random() * 30) + 70,
            notes: notes || "",
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            job,
        };
        return app;
    },

    async updateApplicationStatus(id: string, status: string) {
        await delay(400);
        const app = mockApplications.find((a) => a.id === id);
        if (!app) throw new Error("Application not found");
        return { ...app, status, updatedAt: new Date().toISOString() };
    },

    async getStats() {
        await delay(300);
        return mockStats;
    },
};
