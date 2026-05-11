// Auth Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: "FREE" | "PRO" | "PREMIUM";
  profileCompleted: boolean;
}

// Profile Types
export interface JobPreferences {
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remoteType?: "REMOTE" | "HYBRID" | "ONSITE";
  visaRequired?: boolean;
  industries?: string[];
  locations?: string[];
}

export interface ExperienceData {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface EducationData {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  gpa?: string;
  description?: string;
  sortOrder?: number;
}

export interface SkillData {
  id?: string;
  name: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category?: string;
}

export interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  url?: string;
  techStack?: string[];
  sortOrder?: number;
}

export interface CertificationData {
  id?: string;
  name: string;
  issuer?: string;
  dateObtained?: string;
  expiryDate?: string | null;
  credentialUrl?: string;
}

export interface ProfileData {
  id?: string;
  userId?: string;
  fullName: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  preferences?: JobPreferences;
  experiences: ExperienceData[];
  educations: EducationData[];
  skills: SkillData[];
  projects: ProjectData[];
  certifications: CertificationData[];
  updatedAt?: string;
}

// Job Types
export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string | null;
  location?: string;
  remoteType?: "REMOTE" | "HYBRID" | "ONSITE";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requirements: string[];
  source: string;
  sourceUrl?: string | null;
  applyUrl: string;
  postedAt?: string;
  scrapedAt?: string;
  fingerprint?: string;
  isActive?: boolean;
  matchScore?: number;
  /** 0-100. How likely the user is to land this job (from JobScore). */
  acceptanceScore?: number;
  missingSkills?: string[];
  strongPoints?: string[];
  matchReason?: string;
}

export type JobSortMode = "date" | "salary" | "company" | "match" | "easy";

// Application Types
export type ApplicationStatusType =
  | "SAVED"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "ACCEPTED"
  | "DECLINED"
  | "REJECTED";

export interface ApplicationData {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatusType;
  matchScore?: number | null;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
  job: JobListing;
  resumes?: ResumeData[];
}

export interface ResumeData {
  id: string;
  applicationId: string;
  pdfUrl: string;
  template: "modern" | "classic" | "minimal";
  contentSnapshot?: Record<string, unknown>;
  generatedAt: string;
}

export interface ApplicationStats {
  total: number;
  byStatus: Partial<Record<ApplicationStatusType, number>>;
}

// API Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── career-ops port: Job Evaluation ───────────────────────
export interface RoleSummary {
  summary: string;
  keyResponsibilities: string[];
  teamContext: string;
}
export interface CvMatchAssessment {
  strengths: string[];
  gaps: string[];
  transferable: string[];
  fitScore: number;
}
export interface LevelStrategy {
  targetLevel: string;
  rationale: string;
  yoeFit: string;
  titleSuggestions: string[];
}
export interface CompensationResearch {
  baseRange: string;
  totalComp: string;
  geoAdjusted: string;
  sources: string[];
}
export interface Personalization {
  coverLetterAngles: string[];
  resumeKeywords: string[];
  referralPaths: string[];
}
export interface InterviewPrep {
  likelyQuestions: string[];
  starStoryPrompts: Array<{
    competency: string;
    prompt: string;
    relevantExperienceTitle?: string;
  }>;
  topicsToStudy: string[];
}
export interface JobEvaluation {
  id: string;
  userId: string;
  jobId: string;
  applicationId: string | null;
  roleSummary: RoleSummary;
  cvMatchAssessment: CvMatchAssessment;
  levelStrategy: LevelStrategy;
  compensationResearch: CompensationResearch;
  personalization: Personalization;
  interviewPrep: InterviewPrep;
  generatedAt: string;
  updatedAt: string;
  model?: string | null;
  job?: JobListing;
}

// ─── career-ops port: STAR stories ─────────────────────────
export const STORY_COMPETENCIES = [
  "leadership",
  "conflict",
  "scope",
  "ambiguity",
  "technical-deep-dive",
  "mentorship",
  "customer-empathy",
  "prioritization",
  "failure-recovery",
  "growth",
] as const;
export type StoryCompetency = (typeof STORY_COMPETENCIES)[number];

export interface InterviewStory {
  id: string;
  userId: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string | null;
  competencies: string[];
  tags: string[];
  sourceApplicationId: string | null;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryInput {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection?: string | null;
  competencies?: StoryCompetency[];
  tags?: string[];
}

// ─── career-ops port: Negotiation ──────────────────────────
export type NegotiationType =
  | "SALARY"
  | "GEO_DISCOUNT"
  | "COMPETING_OFFER"
  | "EQUITY"
  | "BENEFITS"
  | "COUNTER_OFFER";

export interface NegotiationContext {
  offerBase?: number;
  offerEquity?: string;
  offerBonus?: string;
  offerBenefits?: string;
  candidateLocation?: string;
  employerLocation?: string;
  targetBase?: number;
  competingOffers?: Array<{ company: string; base?: number; total?: number; notes?: string }>;
  notes?: string;
  suggestedCounter?: { base: number | null; equity: string | null; total: string | null } | null;
  talkingPoints?: string[];
  subject?: string;
}

export interface NegotiationScript {
  id: string;
  userId: string;
  applicationId: string | null;
  type: NegotiationType;
  title: string;
  content: string;
  context: NegotiationContext | null;
  generatedAt: string;
  application?: ApplicationData;
}

// ─── career-ops port: Portals ──────────────────────────────
export type PortalProvider =
  | "ASHBY"
  | "GREENHOUSE"
  | "LEVER"
  | "WORKABLE"
  | "WELLFOUND"
  | "CUSTOM";

export interface Portal {
  id: string;
  userId: string | null;
  company: string;
  provider: PortalProvider;
  url: string;
  filterTags: string[];
  enabled: boolean;
  lastScannedAt: string | null;
  createdAt: string;
}

export interface PortalScanProgress {
  taskId: string;
  status: "running" | "done" | "failed";
  started: string;
  finished?: string;
  portalsTotal: number;
  portalsDone: number;
  new: number;
  updated: number;
  errors: Array<{ portalId: string; company: string; provider: string; error: string }>;
}

export interface AtsPdfResult {
  resumeId: string;
  atsPdfUrl: string;
  keywords: string[];
}

// ─── AI provider config (per user) ─────────────────────────
export type AiProviderName = "GROQ" | "ANTHROPIC" | "GEMINI" | "OPENAI";

export interface UserAiConfigPublic {
  provider: AiProviderName | null;
  model: string | null;
  baseUrl: string | null;
  hasKey: boolean;
  updatedAt: string | null;
}

export interface AiTestResult {
  ok: boolean;
  message: string;
  sample?: string;
}

// ─── Auto-apply ────────────────────────────────────────────
export interface AutoApplyField {
  label: string;
  value: string;
  inputType: string;
  required: boolean;
  filled: boolean;
}

export interface AutoApplyTask {
  id: string;
  userId: string;
  applicationId: string;
  status: "PENDING" | "FILLING" | "READY_FOR_REVIEW" | "BLOCKED" | "FAILED";
  ats: string | null;
  applyUrl: string;
  reviewUrl: string | null;
  filledFields: AutoApplyField[] | null;
  screenshotUrl: string | null;
  blockedReason: string | null;
  errors: { message?: string } | null;
  createdAt: string;
  finishedAt: string | null;
  application?: ApplicationData;
}

// ─── Discover (combined sync + score pipeline) ─────────────
export type DiscoverPhase = "syncing-feeds" | "scanning-portals" | "scoring" | "done" | "failed";
export interface DiscoverProgress {
  taskId: string;
  phase: DiscoverPhase;
  started: string;
  finished?: string;
  feeds?: { new: number; updated: number; total: number; sources: Record<string, number>; errors: string[] };
  portals?: { taskId: string; status: string; portalsTotal: number; portalsDone: number; new: number; updated: number; errors: number };
  scoring?: { scored: number; skipped: number; total: number; batches: number };
  error?: string;
}
