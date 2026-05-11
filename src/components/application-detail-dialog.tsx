"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Building2,
    MapPin,
    DollarSign,
    Clock,
    Wifi,
    ExternalLink,
    FileText,
    Sparkles,
    BookOpen,
    StickyNote,
    Briefcase,
    Loader2,
    Save,
    Check,
    Download,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ApplicationData, JobEvaluation, AtsPdfResult } from "@/lib/types";

interface Props {
    application: ApplicationData | null;
    open: boolean;
    onClose: () => void;
    onUpdated?: (a: ApplicationData) => void;
}

const remoteTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    REMOTE: { label: "Remote", color: "#34C759", bg: "#EDFDF2" },
    HYBRID: { label: "Hybrid", color: "#FF9500", bg: "#FFF5E6" },
    ONSITE: { label: "On-site", color: "#2997FF", bg: "#EBF5FF" },
};

function formatSalary(min?: number, max?: number, currency = "USD"): string | null {
    if (!min && !max) return null;
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
    const fmt = (n: number) => `${symbol}${(n / 1000).toFixed(0)}K`;
    if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

export function ApplicationDetailDialog({ application, open, onClose, onUpdated }: Props) {
    const [evaluation, setEvaluation] = useState<JobEvaluation | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [pdf, setPdf] = useState<AtsPdfResult | null>(null);
    const [tailoring, setTailoring] = useState(false);
    const [notes, setNotes] = useState("");
    const [notesSaving, setNotesSaving] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    // Reset on open / app change.
    useEffect(() => {
        if (!open || !application) return;
        setNotes(application.notes ?? "");
        setEvaluation(null);
        setPdf(null);
        // Fetch existing evaluation if any.
        api.getEvaluation(application.jobId)
            .then(setEvaluation)
            .catch(() => { /* ignore — none exists */ });
    }, [open, application]);

    if (!application) return null;
    const job = application.job;
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
    const remote = job.remoteType ? remoteTypeConfig[job.remoteType] : null;

    async function tailorResume() {
        if (!application) return;
        setTailoring(true);
        const toastId = toast.loading("Tailoring resume to this job...");
        try {
            const r = await api.generateAtsPdf(application.id, false);
            setPdf(r);
            toast.dismiss(toastId);
            toast.success("Resume tailored — keywords extracted, PDF ready.");
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err instanceof Error ? err.message : "Failed to tailor resume");
        } finally {
            setTailoring(false);
        }
    }

    async function regenerateResume() {
        if (!application) return;
        setTailoring(true);
        const toastId = toast.loading("Regenerating resume...");
        try {
            const r = await api.generateAtsPdf(application.id, true);
            setPdf(r);
            toast.dismiss(toastId);
            toast.success("Resume regenerated.");
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err instanceof Error ? err.message : "Failed to regenerate resume");
        } finally {
            setTailoring(false);
        }
    }

    async function downloadResume() {
        if (!application) return;
        try {
            const url = await api.fetchAtsPdfBlobUrl(application.id);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${job.company.replace(/\W+/g, "-")}-${job.title.replace(/\W+/g, "-")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to download PDF");
        }
    }

    async function generateEvaluation() {
        if (!application) return;
        setEvaluating(true);
        const toastId = toast.loading("Generating evaluation + interview prep...");
        try {
            const e = await api.generateEvaluation(application.jobId, application.id, false);
            setEvaluation(e);
            toast.dismiss(toastId);
            toast.success("Interview prep ready.");
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err instanceof Error ? err.message : "Failed to generate evaluation");
        } finally {
            setEvaluating(false);
        }
    }

    async function regenerateEvaluation() {
        if (!application) return;
        setEvaluating(true);
        const toastId = toast.loading("Regenerating prep...");
        try {
            const e = await api.generateEvaluation(application.jobId, application.id, true);
            setEvaluation(e);
            toast.dismiss(toastId);
            toast.success("Interview prep refreshed.");
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err instanceof Error ? err.message : "Failed to regenerate");
        } finally {
            setEvaluating(false);
        }
    }

    async function saveNotes() {
        if (!application) return;
        setNotesSaving(true);
        try {
            const updated = await api.updateApplicationNotes(application.id, notes);
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 2000);
            onUpdated?.(updated);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save notes");
        } finally {
            setNotesSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0">
                {/* Sticky header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#F5F5F7] space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-base font-bold text-[#1D1D1F] shrink-0">
                            {job.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl text-left">{job.title}</DialogTitle>
                            <p className="text-sm text-[#86868B] flex items-center gap-1 mt-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {job.company}
                                <span className="text-[#C7C7CC]">·</span>
                                <span className="text-[11px] uppercase tracking-wider">{job.source}</span>
                            </p>
                        </div>
                        {remote && (
                            <Badge
                                className="text-[10px] font-medium border-0 rounded-full shrink-0"
                                style={{ backgroundColor: remote.bg, color: remote.color }}
                            >
                                <Wifi className="w-3 h-3 mr-1" />
                                {remote.label}
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[#86868B]">
                        {job.location && (
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        )}
                        {salary && (
                            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{salary}</span>
                        )}
                        {job.postedAt && (
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                        )}
                        {application.matchScore != null && (
                            <span className="flex items-center gap-1.5 text-[#1D1D1F] font-medium">
                                {Math.round(application.matchScore)}% match
                            </span>
                        )}
                    </div>
                </DialogHeader>

                {/* Scrollable tabs */}
                <Tabs defaultValue="job" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="mx-6 mt-3 mb-2 bg-[#F5F5F7] rounded-xl p-1 grid grid-cols-4 w-auto">
                        <TabsTrigger value="job" className="rounded-lg data-[state=active]:bg-white text-xs">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Job
                        </TabsTrigger>
                        <TabsTrigger value="resume" className="rounded-lg data-[state=active]:bg-white text-xs">
                            <FileText className="w-3.5 h-3.5 mr-1.5" /> Resume
                        </TabsTrigger>
                        <TabsTrigger value="prep" className="rounded-lg data-[state=active]:bg-white text-xs">
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Prep
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="rounded-lg data-[state=active]:bg-white text-xs">
                            <StickyNote className="w-3.5 h-3.5 mr-1.5" /> Notes
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {/* JOB */}
                        <TabsContent value="job" className="space-y-4 mt-3">
                            <div>
                                <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                    About the role
                                </h4>
                                <div className="prose-job">
                                    {job.description ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{job.description}</ReactMarkdown>
                                    ) : (
                                        <p className="text-[#86868B] text-sm">No description provided.</p>
                                    )}
                                </div>
                            </div>

                            {job.requirements?.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                            Requirements
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {job.requirements.map((r, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 rounded-md bg-[#F5F5F7] text-[11px] font-medium text-[#1D1D1F]"
                                                >
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {job.applyUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(job.applyUrl, "_blank", "noopener,noreferrer")}
                                    className="rounded-xl"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open posting on {job.source}
                                </Button>
                            )}
                        </TabsContent>

                        {/* RESUME */}
                        <TabsContent value="resume" className="space-y-4 mt-3">
                            <div className="rounded-xl bg-gradient-to-br from-[#EBF5FF] to-[#F6ECFD] p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 text-[#AF52DE]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Tailor your resume to this job</p>
                                        <p className="text-xs text-[#86868B] mt-0.5">
                                            AI rewrites your experience bullets toward {job.title} at {job.company} and renders an ATS-friendly PDF.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {pdf?.keywords && pdf.keywords.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                        Keywords surfaced for ATS
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pdf.keywords.map((k) => (
                                            <Badge key={k} className="text-[10px] font-medium bg-[#F5F5F7] text-[#1D1D1F] border-0 rounded-full">
                                                {k}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {!pdf?.atsPdfUrl ? (
                                    <Button onClick={tailorResume} disabled={tailoring} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                                        {tailoring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        Tailor resume
                                    </Button>
                                ) : (
                                    <>
                                        <Button onClick={downloadResume} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </Button>
                                        <Button variant="outline" onClick={regenerateResume} disabled={tailoring} className="rounded-xl">
                                            {tailoring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                            Regenerate
                                        </Button>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        {/* INTERVIEW PREP */}
                        <TabsContent value="prep" className="space-y-4 mt-3">
                            {!evaluation ? (
                                <div className="text-center py-10 space-y-3">
                                    <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] flex items-center justify-center mx-auto">
                                        <BookOpen className="w-5 h-5 text-[#2997FF]" />
                                    </div>
                                    <p className="text-sm text-[#86868B] max-w-md mx-auto">
                                        No interview prep generated yet. Generate likely questions, STAR story prompts, and topics to study.
                                    </p>
                                    <Button onClick={generateEvaluation} disabled={evaluating} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                                        {evaluating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        Generate prep
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {evaluation.interviewPrep?.likelyQuestions?.length > 0 && (
                                        <section>
                                            <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                                Likely interview questions
                                            </h4>
                                            <ol className="space-y-2">
                                                {evaluation.interviewPrep.likelyQuestions.map((q, i) => (
                                                    <li key={i} className="text-sm leading-relaxed flex gap-2">
                                                        <span className="text-[#86868B] font-medium shrink-0 w-5">{i + 1}.</span>
                                                        <span>{q}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </section>
                                    )}

                                    {evaluation.interviewPrep?.starStoryPrompts?.length > 0 && (
                                        <section>
                                            <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                                STAR story prompts
                                            </h4>
                                            <div className="space-y-2">
                                                {evaluation.interviewPrep.starStoryPrompts.map((s, i) => (
                                                    <div key={i} className="rounded-xl bg-[#F5F5F7] p-3 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="text-[10px] bg-[#EBF5FF] text-[#2997FF] border-0 rounded-full">
                                                                {s.competency}
                                                            </Badge>
                                                            {s.relevantExperienceTitle && (
                                                                <span className="text-[11px] text-[#86868B]">
                                                                    {s.relevantExperienceTitle}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm leading-relaxed">{s.prompt}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {evaluation.interviewPrep?.topicsToStudy?.length > 0 && (
                                        <section>
                                            <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                                                Topics to study
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {evaluation.interviewPrep.topicsToStudy.map((t, i) => (
                                                    <Badge key={i} className="text-[11px] font-medium bg-[#FFF5E6] text-[#FF9500] border-0 rounded-full">
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    <Button variant="outline" onClick={regenerateEvaluation} disabled={evaluating} className="rounded-xl">
                                        {evaluating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        Regenerate prep
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* NOTES */}
                        <TabsContent value="notes" className="space-y-3 mt-3">
                            <p className="text-xs text-[#86868B]">
                                Private to you — recruiter contacts, interview feedback, follow-up reminders…
                            </p>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about this application…"
                                className="min-h-[260px] rounded-xl border-[#E8E8ED] text-sm resize-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                                {notesSaved && (
                                    <span className="text-xs text-[#34C759] flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Saved
                                    </span>
                                )}
                                <Button
                                    onClick={saveNotes}
                                    disabled={notesSaving || notes === (application.notes ?? "")}
                                    className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90"
                                >
                                    {notesSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save notes
                                </Button>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
