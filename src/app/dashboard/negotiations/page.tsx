"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { api } from "@/lib/api";
import type { ApplicationData, NegotiationScript, NegotiationType } from "@/lib/types";
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

const TYPES: { value: NegotiationType; label: string }[] = [
    { value: "SALARY", label: "Salary push" },
    { value: "GEO_DISCOUNT", label: "Geo-discount pushback" },
    { value: "COMPETING_OFFER", label: "Competing offer" },
    { value: "EQUITY", label: "Equity" },
    { value: "BENEFITS", label: "Benefits" },
    { value: "COUNTER_OFFER", label: "Counter-offer" },
];

export default function NegotiationsPage() {
    const [scripts, setScripts] = useState<NegotiationScript[]>([]);
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [appId, setAppId] = useState<string>("");
    const [type, setType] = useState<NegotiationType>("SALARY");
    const [offerBase, setOfferBase] = useState<string>("");
    const [targetBase, setTargetBase] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    async function load() {
        setLoading(true);
        try {
            const [s, a] = await Promise.all([
                api.getNegotiations(),
                api.getApplications({ limit: 50 }),
            ]);
            setScripts(s.items);
            setApplications(a.items);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    async function handleGenerate() {
        if (!appId) return;
        setGenerating(true);
        try {
            await api.generateNegotiation({
                applicationId: appId,
                type,
                context: {
                    offerBase: offerBase ? Number(offerBase) : undefined,
                    targetBase: targetBase ? Number(targetBase) : undefined,
                    notes: notes || undefined,
                },
            });
            setOpen(false);
            setOfferBase("");
            setTargetBase("");
            setNotes("");
            await load();
        } finally {
            setGenerating(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this script?")) return;
        await api.deleteNegotiation(id);
        await load();
    }

    function copyText(text: string) {
        navigator.clipboard?.writeText(text);
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Negotiation scripts</h1>
                    <p className="text-sm text-[#86868B]">
                        AI-generated emails for salary, geo-discount, competing offers, and more.
                    </p>
                </div>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New script
                </Button>
            </header>

            {loading ? (
                <p className="text-sm text-[#86868B]">Loading...</p>
            ) : scripts.length === 0 ? (
                <Card className="p-8 text-center text-[#86868B]">
                    No scripts yet. Generate one for an active application.
                </Card>
            ) : (
                <div className="space-y-4">
                    {scripts.map((s) => (
                        <Card key={s.id} className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="font-semibold">{s.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-[#86868B]">
                                        <Badge variant="secondary">{s.type}</Badge>
                                        {s.application?.job && (
                                            <span>{s.application.job.title} @ {s.application.job.company}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => copyText(s.content)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {s.context?.subject && (
                                <p className="text-sm"><span className="font-medium">Subject: </span>{s.context.subject}</p>
                            )}
                            <pre className="whitespace-pre-wrap text-sm text-[#1D1D1F] bg-[#F5F5F7] rounded p-3 border border-[#E8E8ED]">{s.content}</pre>
                            {s.context?.talkingPoints && s.context.talkingPoints.length > 0 && (
                                <div className="text-sm">
                                    <p className="font-medium mb-1">Talking points</p>
                                    <ul className="list-disc pl-5 text-[#1D1D1F]">
                                        {s.context.talkingPoints.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}
                            {s.context?.suggestedCounter && (
                                <div className="text-xs text-[#86868B]">
                                    Suggested counter: base {s.context.suggestedCounter.base ?? "—"}, equity {s.context.suggestedCounter.equity ?? "—"}, total {s.context.suggestedCounter.total ?? "—"}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Generate negotiation script</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Application</Label>
                            <Select value={appId} onValueChange={setAppId}>
                                <SelectTrigger><SelectValue placeholder="Pick an application" /></SelectTrigger>
                                <SelectContent>
                                    {applications.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>{a.job.title} @ {a.job.company}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select value={type} onValueChange={(v) => setType(v as NegotiationType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Offer base</Label>
                                <Input type="number" value={offerBase} onChange={(e) => setOfferBase(e.target.value)} />
                            </div>
                            <div>
                                <Label>Target base</Label>
                                <Input type="number" value={targetBase} onChange={(e) => setTargetBase(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label>Notes (optional)</Label>
                            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button disabled={!appId || generating} onClick={handleGenerate}>
                            {generating ? "Generating..." : "Generate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
