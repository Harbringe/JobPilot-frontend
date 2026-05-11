"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Briefcase, GraduationCap, Code2, FolderKanban, FileUp,
    Plus, Trash2, Save, CheckCircle2, ChevronRight, ChevronLeft, FileText, X,
    Rocket, AlertCircle, Pencil, MapPin, Phone, Linkedin, Github, Globe, ExternalLink,
    Wand2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProfileData, ExperienceData, EducationData, SkillData, ProjectData } from "@/lib/types";
import { calculateYearsOfExperience, formatYearsOfExperience } from "@/lib/utils";

interface ResumeFile {
    name: string;
    size: number;
    type: string;
    file: File;
    uploadedAt: Date;
}

const steps = [
    { id: 0, label: "Personal", icon: User },
    { id: 1, label: "Experience", icon: Briefcase },
    { id: 2, label: "Education", icon: GraduationCap },
    { id: 3, label: "Skills", icon: Code2 },
    { id: 4, label: "Projects", icon: FolderKanban },
    { id: 5, label: "Resume", icon: FileUp },
];

const skillLevelLabels: Record<string, { label: string; color: string; bg: string }> = {
    BEGINNER: { label: "Beginner", color: "#86868B", bg: "#F5F5F7" },
    INTERMEDIATE: { label: "Intermediate", color: "#FF9500", bg: "#FFF5E6" },
    ADVANCED: { label: "Advanced", color: "#2997FF", bg: "#EBF5FF" },
    EXPERT: { label: "Expert", color: "#34C759", bg: "#EDFDF2" },
};

export default function ProfilePage() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
    const [validationError, setValidationError] = useState("");
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState("");
    const [importPreview, setImportPreview] = useState<Partial<ProfileData> | null>(null);
    const importFileRef = React.useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<ProfileData>({
        fullName: "", headline: "", summary: "", phone: "", location: "",
        linkedinUrl: "", githubUrl: "", portfolioUrl: "",
        experiences: [], educations: [], skills: [], projects: [], certifications: [],
    });

    const { isProfileCompleted, completeProfile, refreshUser } = useAuth();
    const router = useRouter();
    const isOnboarding = !isProfileCompleted;

    useEffect(() => {
        api.getProfile().then((p) => {
            // Always load whatever exists in the DB — the user's data shouldn't
            // depend on a client-side "completed" flag.
            if (p) setProfile(p);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile(profile);
            await refreshUser();
            setSaving(false); setSaved(true);
            setIsEditing(false);
            setStep(0);
            toast.success("Profile saved.");
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setSaving(false);
            // If the backend returned per-field Zod details, show the first one
            // so the user knows exactly which field is bad.
            const apiErr = err as { message?: string; details?: { field: string; message: string }[] };
            const detail = apiErr?.details?.[0];
            const msg = detail
                ? `${detail.field}: ${detail.message}`
                : apiErr?.message || "Failed to save profile";
            toast.error(msg);
        }
    };

    const handleCompleteSetup = async () => {
        setValidationError("");
        if (!profile.fullName.trim()) {
            setValidationError("Please fill in your full name in the Personal step.");
            setStep(0);
            return;
        }
        if (resumeFiles.length === 0) {
            setValidationError("Please upload at least one resume in the Resume step.");
            setStep(5);
            return;
        }
        setSaving(true);
        try {
            await api.updateProfile(profile);
            completeProfile();
            await refreshUser();
            setSaving(false);
            router.push("/dashboard");
        } catch (err) {
            setSaving(false);
            toast.error(err instanceof Error ? err.message : "Failed to complete setup");
        }
    };

    const handleImportFile = async (file: File) => {
        setImporting(true);
        setImportError("");
        const toastId = toast.loading("Extracting profile from resume...");
        try {
            const extracted = await api.importResumeFile(file);
            toast.dismiss(toastId);
            toast.success("Resume parsed — review the extracted data below.");
            setImportPreview(extracted);
        } catch (err) {
            const apiErr = err as { message?: string; details?: { field: string; message: string }[] };
            const detail = apiErr?.details?.[0];
            const msg = detail
                ? `${detail.field}: ${detail.message}`
                : apiErr?.message || "Failed to extract resume";
            toast.dismiss(toastId);
            toast.error(msg);
            setImportError(msg);
        } finally {
            setImporting(false);
        }
    };

    const applyImport = () => {
        if (!importPreview) return;
        setProfile((prev) => ({
            ...prev,
            fullName: importPreview.fullName || prev.fullName,
            headline: importPreview.headline || prev.headline,
            summary: importPreview.summary || prev.summary,
            phone: importPreview.phone || prev.phone,
            location: importPreview.location || prev.location,
            linkedinUrl: importPreview.linkedinUrl || prev.linkedinUrl,
            githubUrl: importPreview.githubUrl || prev.githubUrl,
            portfolioUrl: importPreview.portfolioUrl || prev.portfolioUrl,
            experiences: importPreview.experiences?.length ? importPreview.experiences : prev.experiences,
            educations: importPreview.educations?.length ? importPreview.educations : prev.educations,
            skills: importPreview.skills?.length ? importPreview.skills : prev.skills,
            projects: importPreview.projects?.length ? importPreview.projects : prev.projects,
            certifications: importPreview.certifications?.length ? importPreview.certifications : prev.certifications,
        }));
        setImportPreview(null);
        setStep(0);
    };

    const updateField = (field: string, value: string) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[#E8E8ED] border-t-[#2997FF] rounded-full animate-spin" /></div>;

    // ─── PREVIEW MODE (profile completed and not editing) ───
    if (isProfileCompleted && !isEditing) {
        return <ProfilePreview profile={profile} onEdit={() => setIsEditing(true)} />;
    }

    // ─── EDIT / ONBOARDING MODE ───
    return (
        <>
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                {isOnboarding ? (
                    <>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2997FF] to-[#AF52DE] flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold">Welcome! Let&apos;s set you up</h1>
                                <p className="text-[#86868B] mt-0.5">Complete your profile to start applying to jobs.</p>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="p-4 border-amber-200 bg-amber-50/50 mt-4">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-medium">You must fill your personal info and upload a resume to continue.</span>
                                </div>
                            </Card>
                        </motion.div>
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold">Edit Profile</motion.h1>
                            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#86868B] mt-1">Update your information below.</motion.p>
                        </div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Button variant="outline" onClick={() => { setIsEditing(false); setStep(0); }} className="rounded-xl h-10 border-[#E8E8ED]">
                                <X className="w-4 h-4 mr-1" />Cancel
                            </Button>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* ── Import from resume ─────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Card className="p-4 border-[#E8E8ED] bg-gradient-to-r from-[#F5F5F7] to-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] flex items-center justify-center shrink-0">
                                <Wand2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Auto-fill from resume</p>
                                <p className="text-xs text-[#86868B]">Upload your PDF or DOCX and we&apos;ll populate all fields for you.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {importError && <span className="text-xs text-red-500">{importError}</span>}
                            <input
                                ref={importFileRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleImportFile(f);
                                    e.target.value = "";
                                }}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={importing}
                                onClick={() => importFileRef.current?.click()}
                                className="rounded-xl border-[#E8E8ED]"
                            >
                                {importing ? (
                                    <div className="w-4 h-4 border-2 border-[#86868B]/30 border-t-[#86868B] rounded-full animate-spin mr-2" />
                                ) : (
                                    <FileUp className="w-4 h-4 mr-2" />
                                )}
                                {importing ? "Extracting..." : "Upload resume"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {validationError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-4 border-red-200 bg-red-50">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium">{validationError}</span>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Progress */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-3">
                    {steps.map((s, i) => (
                        <button key={s.id} onClick={() => setStep(s.id)} className={`flex items-center gap-2 text-sm font-medium transition-colors ${i === step ? "text-[#1D1D1F]" : i < step ? "text-[#34C759]" : "text-[#86868B]"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${i === step ? "bg-[#1D1D1F] text-white" : i < step ? "bg-[#34C759] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}>
                                {i < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                            </div>
                            <span className="hidden md:inline">{s.label}</span>
                        </button>
                    ))}
                </div>
                <Progress value={((step + 1) / steps.length) * 100} className="h-1.5 bg-[#F5F5F7]" />
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <Card className="p-6 sm:p-8 border-[#E8E8ED]">
                        {step === 0 && <PersonalStep profile={profile} updateField={updateField} />}
                        {step === 1 && <ExperienceStep experiences={profile.experiences} onChange={(exps) => setProfile((p) => ({ ...p, experiences: exps }))} />}
                        {step === 2 && <EducationStep educations={profile.educations} onChange={(eds) => setProfile((p) => ({ ...p, educations: eds }))} />}
                        {step === 3 && <SkillsStep skills={profile.skills} onChange={(sks) => setProfile((p) => ({ ...p, skills: sks }))} />}
                        {step === 4 && <ProjectsStep projects={profile.projects} onChange={(prs) => setProfile((p) => ({ ...p, projects: prs }))} />}
                        {step === 5 && <ResumeStep files={resumeFiles} onChange={setResumeFiles} />}
                    </Card>
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-xl h-11 px-6 border-[#E8E8ED]"><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
                <div className="flex items-center gap-3">
                    {!isOnboarding && (
                        <Button variant="outline" onClick={handleSave} disabled={saving} className="rounded-xl h-11 px-6 border-[#E8E8ED]">
                            {saving ? <div className="w-4 h-4 border-2 border-[#86868B]/30 border-t-[#86868B] rounded-full animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4 mr-1 text-[#34C759]" /><span className="text-[#34C759]">Saved!</span></> : <><Save className="w-4 h-4 mr-1" />Save</>}
                        </Button>
                    )}
                    {step < steps.length - 1 ? (
                        <Button onClick={() => setStep(step + 1)} className="rounded-xl h-11 px-6 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white">Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
                    ) : isOnboarding ? (
                        <Button onClick={handleCompleteSetup} disabled={saving} className="rounded-xl h-11 px-8 bg-gradient-to-r from-[#2997FF] to-[#AF52DE] hover:opacity-90 text-white font-medium">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Rocket className="w-4 h-4 mr-2" />Complete Setup & Start</>}
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={saving} className="rounded-xl h-11 px-6 bg-[#34C759] hover:bg-[#34C759]/90 text-white">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Save & Finish</>}
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* ── Import preview modal ─────────────────────────── */}
        <Dialog open={!!importPreview} onOpenChange={(open) => { if (!open) setImportPreview(null); }}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review extracted profile</DialogTitle>
                </DialogHeader>
                {importPreview && (
                    <div className="space-y-4 text-sm">
                        {importPreview.fullName && <p><span className="font-medium">Name:</span> {importPreview.fullName}</p>}
                        {importPreview.headline && <p><span className="font-medium">Headline:</span> {importPreview.headline}</p>}
                        {importPreview.location && <p><span className="font-medium">Location:</span> {importPreview.location}</p>}
                        {importPreview.phone && <p><span className="font-medium">Phone:</span> {importPreview.phone}</p>}
                        {importPreview.experiences && importPreview.experiences.length > 0 && (
                            <div>
                                <p className="font-medium mb-1">Experience ({importPreview.experiences.length})</p>
                                <ul className="space-y-1 text-[#86868B]">
                                    {importPreview.experiences.map((e, i) => (
                                        <li key={i} className="truncate">{e.title} at {e.company} ({e.startDate}–{e.endDate ?? "present"})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {importPreview.educations && importPreview.educations.length > 0 && (
                            <div>
                                <p className="font-medium mb-1">Education ({importPreview.educations.length})</p>
                                <ul className="space-y-1 text-[#86868B]">
                                    {importPreview.educations.map((e, i) => (
                                        <li key={i} className="truncate">{e.degree} – {e.institution}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {importPreview.skills && importPreview.skills.length > 0 && (
                            <p><span className="font-medium">Skills:</span> {importPreview.skills.slice(0, 10).map(s => s.name).join(", ")}{importPreview.skills.length > 10 ? ` +${importPreview.skills.length - 10} more` : ""}</p>
                        )}
                        <div className="rounded-xl bg-[#F5F5F7] p-3 text-xs text-[#86868B]">
                            Applying this will overwrite your current form data. You can review and edit each field before saving.
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setImportPreview(null)} className="rounded-xl">Discard</Button>
                    <Button onClick={applyImport} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                        <CheckCircle2 className="w-4 h-4 mr-2" />Apply to Profile
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}

// ─── PROFILE PREVIEW ─────────────────────────────────────────────
function ProfilePreview({ profile, onEdit }: { profile: ProfileData; onEdit: () => void }) {
    const initials = profile.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    const yoe = calculateYearsOfExperience(profile.experiences);
    const yoeLabel = yoe > 0 ? formatYearsOfExperience(yoe) : null;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold">Profile</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#86868B] mt-1">Your profile is used to tailor every application.</motion.p>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                    <Button onClick={onEdit} className="rounded-xl h-11 px-6 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white">
                        <Pencil className="w-4 h-4 mr-2" />Edit Profile
                    </Button>
                </motion.div>
            </div>

            {/* Personal Info Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6 sm:p-8 border-[#E8E8ED]">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2997FF] to-[#AF52DE] flex items-center justify-center text-white text-xl font-bold shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-2xl font-semibold">{profile.fullName || "No Name"}</h2>
                                {yoeLabel && (
                                    <Badge
                                        className="text-[10px] font-semibold border-0 rounded-full bg-[#EBF5FF] text-[#2997FF]"
                                        title="Total years of experience, computed from your roles"
                                    >
                                        {yoeLabel} of experience
                                    </Badge>
                                )}
                            </div>
                            {profile.headline && <p className="text-[#86868B] mt-0.5">{profile.headline}</p>}
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[#86868B]">
                                {profile.location && (
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>
                                )}
                                {profile.phone && (
                                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{profile.phone}</span>
                                )}
                            </div>
                            {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    {profile.linkedinUrl && (
                                        <a href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#2997FF] hover:underline">
                                            <Linkedin className="w-3.5 h-3.5" />LinkedIn<ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {profile.githubUrl && (
                                        <a href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#1D1D1F] hover:underline">
                                            <Github className="w-3.5 h-3.5" />GitHub<ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {profile.portfolioUrl && (
                                        <a href={profile.portfolioUrl.startsWith("http") ? profile.portfolioUrl : `https://${profile.portfolioUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#AF52DE] hover:underline">
                                            <Globe className="w-3.5 h-3.5" />Portfolio<ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {profile.summary && (
                        <>
                            <Separator className="my-5" />
                            <div>
                                <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">About</h4>
                                <p className="text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-line">{profile.summary}</p>
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>

            {/* Experience */}
            {profile.experiences.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="p-6 sm:p-8 border-[#E8E8ED]">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] flex items-center justify-center"><Briefcase className="w-4 h-4 text-[#2997FF]" /></div>
                            <h3 className="text-lg font-semibold">Experience</h3>
                            <Badge className="ml-auto text-[10px] bg-[#F5F5F7] text-[#86868B] border-0">{profile.experiences.length}</Badge>
                        </div>
                        <div className="space-y-4">
                            {profile.experiences.map((exp, i) => {
                                const dur = calculateYearsOfExperience([exp]);
                                const durLabel = dur > 0 ? formatYearsOfExperience(dur) : null;
                                return (
                                <div key={i} className={`${i < profile.experiences.length - 1 ? "pb-4 border-b border-[#F5F5F7]" : ""}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold">{exp.title || "Untitled Role"}</h4>
                                            <p className="text-sm text-[#86868B]">{exp.company || "Unknown Company"}</p>
                                        </div>
                                        {exp.startDate && (
                                            <span className="text-xs text-[#86868B] shrink-0 text-right">
                                                <span>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Present"}</span>
                                                {durLabel && <span className="block text-[10px] text-[#86868B]/70">({durLabel})</span>}
                                            </span>
                                        )}
                                    </div>
                                    {exp.description && <p className="text-sm text-[#86868B] mt-2 leading-relaxed">{exp.description}</p>}
                                </div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Education */}
            {profile.educations.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="p-6 sm:p-8 border-[#E8E8ED]">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-[#F6ECFD] flex items-center justify-center"><GraduationCap className="w-4 h-4 text-[#AF52DE]" /></div>
                            <h3 className="text-lg font-semibold">Education</h3>
                            <Badge className="ml-auto text-[10px] bg-[#F5F5F7] text-[#86868B] border-0">{profile.educations.length}</Badge>
                        </div>
                        <div className="space-y-4">
                            {profile.educations.map((ed, i) => (
                                <div key={i} className={`${i < profile.educations.length - 1 ? "pb-4 border-b border-[#F5F5F7]" : ""}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold">{ed.degree || "Degree"}{ed.field ? ` in ${ed.field}` : ""}</h4>
                                            <p className="text-sm text-[#86868B]">{ed.institution || "Institution"}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {ed.startDate && <span className="text-xs text-[#86868B]">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ""}</span>}
                                            {ed.gpa && <p className="text-xs text-[#86868B] mt-0.5">GPA: {ed.gpa}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Skills */}
            {profile.skills.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card className="p-6 sm:p-8 border-[#E8E8ED]">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-[#FFF5E6] flex items-center justify-center"><Code2 className="w-4 h-4 text-[#FF9500]" /></div>
                            <h3 className="text-lg font-semibold">Skills</h3>
                            <Badge className="ml-auto text-[10px] bg-[#F5F5F7] text-[#86868B] border-0">{profile.skills.length}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((sk, i) => {
                                const lvl = skillLevelLabels[sk.level || "INTERMEDIATE"];
                                return (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: lvl.bg, color: lvl.color }}>
                                        {sk.name || "Skill"}
                                        <span className="text-[10px] opacity-70">• {lvl.label}</span>
                                    </span>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Projects */}
            {profile.projects.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="p-6 sm:p-8 border-[#E8E8ED]">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-[#EDFDF2] flex items-center justify-center"><FolderKanban className="w-4 h-4 text-[#34C759]" /></div>
                            <h3 className="text-lg font-semibold">Projects</h3>
                            <Badge className="ml-auto text-[10px] bg-[#F5F5F7] text-[#86868B] border-0">{profile.projects.length}</Badge>
                        </div>
                        <div className="space-y-4">
                            {profile.projects.map((pr, i) => (
                                <div key={i} className={`${i < profile.projects.length - 1 ? "pb-4 border-b border-[#F5F5F7]" : ""}`}>
                                    <div className="flex items-start justify-between">
                                        <h4 className="text-sm font-semibold">{pr.name || "Project"}</h4>
                                        {pr.url && (
                                            <a href={pr.url.startsWith("http") ? pr.url : `https://${pr.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2997FF] hover:underline flex items-center gap-1">
                                                View<ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    {pr.description && <p className="text-sm text-[#86868B] mt-1 leading-relaxed">{pr.description}</p>}
                                    {pr.techStack && pr.techStack.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {pr.techStack.map((t, j) => (
                                                <span key={j} className="px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[11px] font-medium text-[#1D1D1F]">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

// ─── FORM STEPS (unchanged) ──────────────────────────────────────

function PersonalStep({ profile, updateField }: { profile: ProfileData; updateField: (f: string, v: string) => void }) {
    return (
        <div className="space-y-6">
            <div><h3 className="text-xl font-semibold mb-1">Personal Information</h3><p className="text-sm text-[#86868B]">Tell us about yourself.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ f: "fullName", l: "Full Name *", p: "John Doe" }, { f: "headline", l: "Headline", p: "Full-Stack Developer" }, { f: "phone", l: "Phone", p: "+1-555-0123" }, { f: "location", l: "Location", p: "San Francisco, CA" }].map(({ f, l, p }) => (
                    <div key={f} className="space-y-2"><Label className="text-sm">{l}</Label><Input value={(profile as unknown as Record<string, string>)[f] || ""} onChange={(e) => updateField(f, e.target.value)} placeholder={p} className="h-11 rounded-xl border-[#E8E8ED] focus-visible:ring-[#2997FF]" /></div>
                ))}
            </div>
            <div className="space-y-2"><Label className="text-sm">Summary</Label><Textarea value={profile.summary || ""} onChange={(e) => updateField("summary", e.target.value)} placeholder="Tell employers about yourself..." className="min-h-[120px] rounded-xl border-[#E8E8ED] focus-visible:ring-[#2997FF] resize-none" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{ f: "linkedinUrl", l: "LinkedIn", p: "linkedin.com/in/..." }, { f: "githubUrl", l: "GitHub", p: "github.com/..." }, { f: "portfolioUrl", l: "Portfolio", p: "yoursite.dev" }].map(({ f, l, p }) => (
                    <div key={f} className="space-y-2"><Label className="text-sm">{l}</Label><Input value={(profile as unknown as Record<string, string>)[f] || ""} onChange={(e) => updateField(f, e.target.value)} placeholder={p} className="h-11 rounded-xl border-[#E8E8ED] focus-visible:ring-[#2997FF]" /></div>
                ))}
            </div>
        </div>
    );
}

function ExperienceStep({ experiences, onChange }: { experiences: ExperienceData[]; onChange: (e: ExperienceData[]) => void }) {
    const update = (i: number, patch: Partial<ExperienceData>) => {
        const u = [...experiences];
        u[i] = { ...u[i], ...patch };
        onChange(u);
    };
    // <input type="month"> returns/accepts "YYYY-MM" — same shape we store.
    const monthValue = (v?: string | null) => (v && /^\d{4}-\d{2}/.test(v) ? v.slice(0, 7) : "");
    const totalYoe = calculateYearsOfExperience(experiences);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold mb-1">Experience</h3>
                    <p className="text-sm text-[#86868B]">
                        Add your work experience.
                        {totalYoe > 0 && (
                            <span className="ml-2 text-[#1D1D1F] font-medium">
                                Total: {formatYearsOfExperience(totalYoe)}
                            </span>
                        )}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onChange([...experiences, { company: "", title: "", startDate: "", description: "", current: false }])} className="rounded-lg border-[#E8E8ED]"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
            {experiences.length === 0 ? (
                <div className="text-center py-8 text-[#86868B]"><Briefcase className="w-10 h-10 mx-auto mb-3 text-[#E8E8ED]" /><p className="text-sm">No experience added yet.</p></div>
            ) : experiences.map((exp, i) => {
                const dur = calculateYearsOfExperience([exp]);
                return (
                    <div key={i} className="p-4 rounded-xl bg-[#F5F5F7]/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-[#86868B]">
                                #{i + 1}
                                {dur > 0 && <span className="ml-2 text-[11px] text-[#86868B]/70">({formatYearsOfExperience(dur)})</span>}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => onChange(experiences.filter((_, j) => j !== i))} className="text-[#86868B] hover:text-red-500 h-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input value={exp.company} onChange={(e) => update(i, { company: e.target.value })} placeholder="Company" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                            <Input value={exp.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Title" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                        </div>
                        <Input value={exp.location || ""} onChange={(e) => update(i, { location: e.target.value })} placeholder="Location (City, Country)" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-[#86868B]">Start</Label>
                                <Input
                                    type="month"
                                    value={monthValue(exp.startDate)}
                                    onChange={(e) => update(i, { startDate: e.target.value })}
                                    className="h-10 rounded-lg border-[#E8E8ED] text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-[#86868B]">End</Label>
                                <Input
                                    type="month"
                                    value={monthValue(exp.endDate)}
                                    onChange={(e) => update(i, { endDate: e.target.value || undefined, current: false })}
                                    disabled={!!exp.current}
                                    className="h-10 rounded-lg border-[#E8E8ED] text-sm disabled:bg-[#F5F5F7] disabled:text-[#C7C7CC]"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-[#86868B] cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={!!exp.current}
                                onChange={(e) => update(i, { current: e.target.checked, endDate: e.target.checked ? undefined : exp.endDate })}
                                className="w-4 h-4 rounded border-[#E8E8ED] text-[#2997FF] focus:ring-[#2997FF]"
                            />
                            I currently work here
                        </label>
                        <Textarea value={exp.description || ""} onChange={(e) => update(i, { description: e.target.value })} placeholder="Describe your role..." className="min-h-[80px] rounded-lg border-[#E8E8ED] text-sm resize-none" />
                    </div>
                );
            })}
        </div>
    );
}

function EducationStep({ educations, onChange }: { educations: EducationData[]; onChange: (e: EducationData[]) => void }) {
    const update = (i: number, patch: Partial<EducationData>) => {
        const u = [...educations];
        u[i] = { ...u[i], ...patch };
        onChange(u);
    };
    const monthValue = (v?: string | null) => (v && /^\d{4}-\d{2}/.test(v) ? v.slice(0, 7) : "");
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h3 className="text-xl font-semibold mb-1">Education</h3><p className="text-sm text-[#86868B]">Add your education.</p></div>
                <Button variant="outline" size="sm" onClick={() => onChange([...educations, { institution: "", degree: "", startDate: "" }])} className="rounded-lg border-[#E8E8ED]"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
            {educations.length === 0 ? (<div className="text-center py-8 text-[#86868B]"><GraduationCap className="w-10 h-10 mx-auto mb-3 text-[#E8E8ED]" /><p className="text-sm">No education added yet.</p></div>) : educations.map((ed, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#F5F5F7]/50 space-y-3">
                    <div className="flex justify-between"><span className="text-sm font-medium text-[#86868B]">#{i + 1}</span><Button variant="ghost" size="sm" onClick={() => onChange(educations.filter((_, j) => j !== i))} className="text-[#86868B] hover:text-red-500 h-8"><Trash2 className="w-3.5 h-3.5" /></Button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input value={ed.institution} onChange={(e) => update(i, { institution: e.target.value })} placeholder="Institution" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                        <Input value={ed.degree} onChange={(e) => update(i, { degree: e.target.value })} placeholder="Degree" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                        <Input value={ed.field || ""} onChange={(e) => update(i, { field: e.target.value })} placeholder="Field of Study" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                        <Input value={ed.gpa || ""} onChange={(e) => update(i, { gpa: e.target.value })} placeholder="GPA (e.g. 3.8/4.0)" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-[#86868B]">Start</Label>
                            <Input
                                type="month"
                                value={monthValue(ed.startDate)}
                                onChange={(e) => update(i, { startDate: e.target.value })}
                                className="h-10 rounded-lg border-[#E8E8ED] text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-[#86868B]">End (leave empty if ongoing)</Label>
                            <Input
                                type="month"
                                value={monthValue(ed.endDate)}
                                onChange={(e) => update(i, { endDate: e.target.value || undefined })}
                                className="h-10 rounded-lg border-[#E8E8ED] text-sm"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SkillsStep({ skills, onChange }: { skills: SkillData[]; onChange: (s: SkillData[]) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h3 className="text-xl font-semibold mb-1">Skills</h3><p className="text-sm text-[#86868B]">Add technical and soft skills.</p></div>
                <Button variant="outline" size="sm" onClick={() => onChange([...skills, { name: "", level: "INTERMEDIATE" }])} className="rounded-lg border-[#E8E8ED]"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
            {skills.length === 0 ? (<div className="text-center py-8 text-[#86868B]"><Code2 className="w-10 h-10 mx-auto mb-3 text-[#E8E8ED]" /><p className="text-sm">No skills added yet.</p></div>) : skills.map((sk, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Input value={sk.name} onChange={(e) => { const u = [...skills]; u[i] = { ...u[i], name: e.target.value }; onChange(u); }} placeholder="Skill" className="h-10 rounded-lg border-[#E8E8ED] text-sm flex-1" />
                    <Select value={sk.level || "INTERMEDIATE"} onValueChange={(v) => { const u = [...skills]; u[i] = { ...u[i], level: v as SkillData["level"] }; onChange(u); }}><SelectTrigger className="w-36 h-10 rounded-lg border-[#E8E8ED] text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BEGINNER">Beginner</SelectItem><SelectItem value="INTERMEDIATE">Intermediate</SelectItem><SelectItem value="ADVANCED">Advanced</SelectItem><SelectItem value="EXPERT">Expert</SelectItem></SelectContent></Select>
                    <Button variant="ghost" size="sm" onClick={() => onChange(skills.filter((_, j) => j !== i))} className="text-[#86868B] hover:text-red-500 h-10"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
            ))}
        </div>
    );
}

function ProjectsStep({ projects, onChange }: { projects: ProjectData[]; onChange: (p: ProjectData[]) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h3 className="text-xl font-semibold mb-1">Projects</h3><p className="text-sm text-[#86868B]">Showcase your best work.</p></div>
                <Button variant="outline" size="sm" onClick={() => onChange([...projects, { name: "", description: "", techStack: [] }])} className="rounded-lg border-[#E8E8ED]"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
            {projects.length === 0 ? (<div className="text-center py-8 text-[#86868B]"><FolderKanban className="w-10 h-10 mx-auto mb-3 text-[#E8E8ED]" /><p className="text-sm">No projects added yet.</p></div>) : projects.map((pr, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#F5F5F7]/50 space-y-3">
                    <div className="flex justify-between"><span className="text-sm font-medium text-[#86868B]">#{i + 1}</span><Button variant="ghost" size="sm" onClick={() => onChange(projects.filter((_, j) => j !== i))} className="text-[#86868B] hover:text-red-500 h-8"><Trash2 className="w-3.5 h-3.5" /></Button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input value={pr.name} onChange={(e) => { const u = [...projects]; u[i] = { ...u[i], name: e.target.value }; onChange(u); }} placeholder="Project name" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                        <Input value={pr.url || ""} onChange={(e) => { const u = [...projects]; u[i] = { ...u[i], url: e.target.value }; onChange(u); }} placeholder="URL" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                    </div>
                    <Textarea value={pr.description || ""} onChange={(e) => { const u = [...projects]; u[i] = { ...u[i], description: e.target.value }; onChange(u); }} placeholder="Describe the project..." className="min-h-[80px] rounded-lg border-[#E8E8ED] text-sm resize-none" />
                    <Input value={pr.techStack?.join(", ") || ""} onChange={(e) => { const u = [...projects]; u[i] = { ...u[i], techStack: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; onChange(u); }} placeholder="Tech stack (comma separated)" className="h-10 rounded-lg border-[#E8E8ED] text-sm" />
                </div>
            ))}
        </div>
    );
}

function ResumeStep({ files, onChange }: { files: ResumeFile[]; onChange: (f: ResumeFile[]) => void }) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const accepted = Array.from(fileList).filter((f) => {
            const ext = f.name.split(".").pop()?.toLowerCase();
            return ["pdf", "doc", "docx"].includes(ext || "") && f.size <= 5 * 1024 * 1024;
        });
        const newFiles: ResumeFile[] = accepted.map((f) => ({
            name: f.name, size: f.size, type: f.type, file: f, uploadedAt: new Date(),
        }));
        onChange([...files, ...newFiles]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold mb-1">Resume</h3>
                <p className="text-sm text-[#86868B]">Upload your resume. We&apos;ll use it to auto-fill applications and tailor it per job.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragActive
                    ? "border-[#2997FF] bg-[#EBF5FF]"
                    : "border-[#E8E8ED] hover:border-[#86868B] hover:bg-[#F5F5F7]/50"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    className="hidden"
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${dragActive ? "bg-[#2997FF] text-white" : "bg-[#F5F5F7] text-[#86868B]"
                    }`}>
                    <FileUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium mb-1">
                    {dragActive ? "Drop your resume here" : "Drag & drop your resume here"}
                </p>
                <p className="text-xs text-[#86868B] mb-3">or click to browse from your device</p>
                <p className="text-[11px] text-[#86868B]/70">PDF, DOC, DOCX • Max 5MB</p>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[#86868B]">Uploaded ({files.length})</h4>
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F5F7]/50 group hover:bg-[#F5F5F7] transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-[#2997FF]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{f.name}</p>
                                <p className="text-xs text-[#86868B]">{formatSize(f.size)} • {f.uploadedAt.toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange(files.filter((_, j) => j !== i)); }}
                                className="p-2 rounded-lg text-[#86868B] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
