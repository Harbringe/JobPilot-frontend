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
}

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
