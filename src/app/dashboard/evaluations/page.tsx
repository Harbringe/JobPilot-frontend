"use client";

import { useEffect, useState } from "react";
import { Sparkles, FileDown } from "lucide-react";
import { api } from "@/lib/api";
import type { ApplicationData, JobEvaluation, AtsPdfResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function EvaluationsPage() {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const [evaluation, setEvaluation] = useState<JobEvaluation | null>(null);
    const [pdf, setPdf] = useState<AtsPdfResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [pdfBusy, setPdfBusy] = useState(false);

    useEffect(() => {
        (async () => {
            const apps = await api.getApplications({ limit: 50 });
            setApplications(apps.items);
        })();
    }, []);

    async function handleSelect(id: string) {
        setSelectedAppId(id);
        setEvaluation(null);
        setPdf(null);
        const app = applications.find((a) => a.id === id);
        if (!app) return;
        setLoading(true);
        try {
            const e = await api.getEvaluation(app.jobId);
            setEvaluation(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate(regenerate = false) {
        const app = applications.find((a) => a.id === selectedAppId);
        if (!app) return;
        setGenerating(true);
        try {
            const e = await api.generateEvaluation(app.jobId, app.id, regenerate);
            setEvaluation(e);
        } finally {
            setGenerating(false);
        }
    }

    async function handleAtsPdf(regenerate = false) {
        if (!selectedAppId) return;
        setPdfBusy(true);
        try {
            const r = await api.generateAtsPdf(selectedAppId, regenerate);
            setPdf(r);
        } finally {
            setPdfBusy(false);
        }
    }

    async function openPdf() {
        if (!selectedAppId) return;
        try {
            const url = await api.fetchAtsPdfBlobUrl(selectedAppId);
            // window.open keeps the tab; the blob URL is revoked when the tab is closed.
            window.open(url, "_blank", "noopener,noreferrer");
            // Defer revoke so the browser has time to load.
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
            console.error(err);
        }
    }

    const selectedApp = applications.find((a) => a.id === selectedAppId);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Evaluations</h1>
                <p className="text-sm text-[#86868B]">
                    Six-block AI report per application — role, CV match, level, comp, personalization, and interview prep.
                </p>
            </header>

            <Card className="p-4 space-y-3">
                <Label>Application</Label>
                <Select value={selectedAppId} onValueChange={handleSelect}>
                    <SelectTrigger><SelectValue placeholder="Pick an application" /></SelectTrigger>
                    <SelectContent>
                        {applications.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.job.title} @ {a.job.company}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedApp && (
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleGenerate(false)} disabled={generating}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {evaluation ? "Open / refresh" : "Generate evaluation"}
                        </Button>
                        {evaluation && (
                            <Button variant="outline" onClick={() => handleGenerate(true)} disabled={generating}>
                                Regenerate
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => handleAtsPdf(false)} disabled={pdfBusy}>
                            <FileDown className="w-4 h-4 mr-2" />
                            {pdfBusy ? "Working..." : "ATS PDF"}
                        </Button>
                        {pdf?.atsPdfUrl && (
                            <button onClick={openPdf} className="text-sm text-[#0066CC] underline self-center">
                                Open latest PDF
                            </button>
                        )}
                    </div>
                )}
            </Card>

            {loading && <p className="text-sm text-[#86868B]">Loading evaluation...</p>}

            {evaluation && (
                <Tabs defaultValue="role">
                    <TabsList>
                        <TabsTrigger value="role">Role</TabsTrigger>
                        <TabsTrigger value="cv">CV match</TabsTrigger>
                        <TabsTrigger value="level">Level</TabsTrigger>
                        <TabsTrigger value="comp">Compensation</TabsTrigger>
                        <TabsTrigger value="pers">Personalization</TabsTrigger>
                        <TabsTrigger value="prep">Interview prep</TabsTrigger>
                    </TabsList>

                    <TabsContent value="role">
                        <Card className="p-5 space-y-3">
                            <p>{evaluation.roleSummary.summary}</p>
                            <div>
                                <p className="text-sm font-medium mb-1">Key responsibilities</p>
                                <ul className="list-disc pl-5 text-sm">
                                    {evaluation.roleSummary.keyResponsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                            <p className="text-sm text-[#86868B]">Team: {evaluation.roleSummary.teamContext}</p>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cv">
                        <Card className="p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge>fit {evaluation.cvMatchAssessment.fitScore}/100</Badge>
                            </div>
                            <Section title="Strengths" items={evaluation.cvMatchAssessment.strengths} />
                            <Section title="Gaps" items={evaluation.cvMatchAssessment.gaps} />
                            <Section title="Transferable" items={evaluation.cvMatchAssessment.transferable} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="level">
                        <Card className="p-5 space-y-2">
                            <Badge variant="secondary">{evaluation.levelStrategy.targetLevel}</Badge>
                            <p className="text-sm">{evaluation.levelStrategy.rationale}</p>
                            <p className="text-sm text-[#86868B]">{evaluation.levelStrategy.yoeFit}</p>
                            <Section title="Title suggestions" items={evaluation.levelStrategy.titleSuggestions} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="comp">
                        <Card className="p-5 space-y-2">
                            <p className="text-sm"><span className="font-medium">Base:</span> {evaluation.compensationResearch.baseRange}</p>
                            <p className="text-sm"><span className="font-medium">Total:</span> {evaluation.compensationResearch.totalComp}</p>
                            <p className="text-sm"><span className="font-medium">Geo:</span> {evaluation.compensationResearch.geoAdjusted}</p>
                            <Section title="Sources" items={evaluation.compensationResearch.sources} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="pers">
                        <Card className="p-5 space-y-3">
                            <Section title="Cover-letter angles" items={evaluation.personalization.coverLetterAngles} />
                            <div>
                                <p className="text-sm font-medium mb-1">Resume keywords</p>
                                <div className="flex flex-wrap gap-1">
                                    {evaluation.personalization.resumeKeywords.map((k, i) => (
                                        <Badge key={i} variant="secondary">{k}</Badge>
                                    ))}
                                </div>
                            </div>
                            <Section title="Referral paths" items={evaluation.personalization.referralPaths} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="prep">
                        <Card className="p-5 space-y-3">
                            <Section title="Likely questions" items={evaluation.interviewPrep.likelyQuestions} />
                            <div>
                                <p className="text-sm font-medium mb-1">STAR story prompts</p>
                                <ul className="space-y-2">
                                    {evaluation.interviewPrep.starStoryPrompts.map((s, i) => (
                                        <li key={i} className="text-sm">
                                            <Badge variant="secondary" className="mr-2">{s.competency}</Badge>
                                            {s.prompt}
                                            {s.relevantExperienceTitle && (
                                                <span className="text-xs text-[#86868B]"> — {s.relevantExperienceTitle}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Section title="Topics to study" items={evaluation.interviewPrep.topicsToStudy} />
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

function Section({ title, items }: { title: string; items: string[] }) {
    if (!items?.length) return null;
    return (
        <div>
            <p className="text-sm font-medium mb-1">{title}</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
                {items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
        </div>
    );
}
