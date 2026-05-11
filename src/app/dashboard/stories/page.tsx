"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { InterviewStory, ApplicationData, StoryInput } from "@/lib/types";
import { STORY_COMPETENCIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const EMPTY_STORY: StoryInput = {
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    reflection: "",
    competencies: [],
    tags: [],
};

export default function StoriesPage() {
    const [stories, setStories] = useState<InterviewStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCompetency, setFilterCompetency] = useState<string>("");
    const [createOpen, setCreateOpen] = useState(false);
    const [genOpen, setGenOpen] = useState(false);
    const [draft, setDraft] = useState<StoryInput>(EMPTY_STORY);
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const [generating, setGenerating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getStories({
                competency: filterCompetency || undefined,
                limit: 50,
            });
            setStories(res.items);
        } finally {
            setLoading(false);
        }
    }, [filterCompetency]);

    useEffect(() => { load(); }, [load]);

    async function loadApplications() {
        const res = await api.getApplications({ limit: 50 });
        setApplications(res.items);
    }

    async function handleCreate() {
        await api.createStory(draft);
        setCreateOpen(false);
        setDraft(EMPTY_STORY);
        await load();
    }

    async function handleGenerate() {
        if (!selectedAppId) return;
        setGenerating(true);
        try {
            await api.generateStoriesFromApplication(selectedAppId, 4);
            setGenOpen(false);
            await load();
        } finally {
            setGenerating(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this story?")) return;
        await api.deleteStory(id);
        await load();
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Interview Stories</h1>
                    <p className="text-sm text-[#86868B]">
                        STAR+Reflection stories you can reuse in interviews. Powered by your job applications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            loadApplications();
                            setGenOpen(true);
                        }}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate from application
                    </Button>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New story
                    </Button>
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-2">
                <Label className="text-xs text-[#86868B]">Filter by competency:</Label>
                <Button
                    size="sm"
                    variant={filterCompetency === "" ? "default" : "outline"}
                    onClick={() => setFilterCompetency("")}
                >
                    all
                </Button>
                {STORY_COMPETENCIES.map((c) => (
                    <Button
                        key={c}
                        size="sm"
                        variant={filterCompetency === c ? "default" : "outline"}
                        onClick={() => setFilterCompetency(c)}
                    >
                        {c}
                    </Button>
                ))}
            </div>

            {loading ? (
                <p className="text-sm text-[#86868B]">Loading...</p>
            ) : stories.length === 0 ? (
                <Card className="p-8 text-center text-[#86868B]">
                    No stories yet. Create one or generate from a job application.
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {stories.map((s) => (
                        <Card key={s.id} className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold">{s.title}</h3>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {s.competencies.map((c) => (
                                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                                ))}
                                {s.isAiGenerated && <Badge variant="outline" className="text-xs">AI</Badge>}
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Situation: </span>{s.situation}</p>
                                <p><span className="font-medium">Task: </span>{s.task}</p>
                                <p><span className="font-medium">Action: </span>{s.action}</p>
                                <p><span className="font-medium">Result: </span>{s.result}</p>
                                {s.reflection && (
                                    <p><span className="font-medium">Reflection: </span>{s.reflection}</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New story</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Title</Label>
                            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                        </div>
                        <div>
                            <Label>Situation</Label>
                            <Textarea rows={2} value={draft.situation} onChange={(e) => setDraft({ ...draft, situation: e.target.value })} />
                        </div>
                        <div>
                            <Label>Task</Label>
                            <Textarea rows={2} value={draft.task} onChange={(e) => setDraft({ ...draft, task: e.target.value })} />
                        </div>
                        <div>
                            <Label>Action</Label>
                            <Textarea rows={3} value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} />
                        </div>
                        <div>
                            <Label>Result</Label>
                            <Textarea rows={2} value={draft.result} onChange={(e) => setDraft({ ...draft, result: e.target.value })} />
                        </div>
                        <div>
                            <Label>Reflection (optional)</Label>
                            <Textarea rows={2} value={draft.reflection ?? ""} onChange={(e) => setDraft({ ...draft, reflection: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={genOpen} onOpenChange={setGenOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate stories from application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label>Application</Label>
                        <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                            <SelectTrigger><SelectValue placeholder="Pick an application" /></SelectTrigger>
                            <SelectContent>
                                {applications.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.job.title} @ {a.job.company}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-[#86868B]">
                            We&apos;ll produce 3-4 STAR stories grounded in your profile experiences and the target role.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
                        <Button disabled={!selectedAppId || generating} onClick={handleGenerate}>
                            {generating ? "Generating..." : "Generate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
