"use client";

import { useEffect, useState } from "react";
import { Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AiProviderName, UserAiConfigPublic, AiTestResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PROVIDER_LABELS: Record<AiProviderName, string> = {
    GROQ: "Groq (free, OpenAI-compatible)",
    ANTHROPIC: "Anthropic Claude",
    GEMINI: "Google Gemini",
    OPENAI: "OpenAI / Codex / OpenAI-compatible",
};

const DEFAULT_MODELS: Record<AiProviderName, string> = {
    GROQ: "llama-3.3-70b-versatile",
    ANTHROPIC: "claude-sonnet-4-6",
    GEMINI: "gemini-1.5-pro-latest",
    OPENAI: "gpt-4o-mini",
};

const NEEDS_BASE_URL: Record<AiProviderName, boolean> = {
    GROQ: false,
    ANTHROPIC: false,
    GEMINI: false,
    OPENAI: true, // expose so users can point at Codex / OpenRouter / vLLM / etc.
};

export function AiProviderSettings() {
    const [cfg, setCfg] = useState<UserAiConfigPublic | null>(null);
    const [provider, setProvider] = useState<AiProviderName>("GROQ");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [busy, setBusy] = useState(false);
    const [testResult, setTestResult] = useState<AiTestResult | null>(null);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [error, setError] = useState<string>("");

    async function load() {
        const c = await api.getAiConfig();
        setCfg(c);
        if (c.provider) setProvider(c.provider);
        if (c.model) setModel(c.model);
        else if (c.provider) setModel(DEFAULT_MODELS[c.provider]);
        if (c.baseUrl) setBaseUrl(c.baseUrl);
    }
    useEffect(() => { load(); }, []);

    async function handleTest() {
        if (!apiKey) {
            setError("Enter an API key first to test.");
            return;
        }
        setError("");
        setBusy(true);
        setTestResult(null);
        try {
            const r = await api.testAiConfig({
                provider,
                apiKey,
                model: model || undefined,
                baseUrl: baseUrl || undefined,
            });
            setTestResult(r);
        } catch (err) {
            setTestResult({ ok: false, message: err instanceof Error ? err.message : "Test failed" });
        } finally {
            setBusy(false);
        }
    }

    async function handleSave() {
        setError("");
        if (!cfg?.hasKey && !apiKey) {
            setError("Enter an API key to save.");
            return;
        }
        setBusy(true);
        try {
            const updated = await api.updateAiConfig({
                provider,
                apiKey: apiKey || undefined,
                model: model || undefined,
                baseUrl: baseUrl || undefined,
            });
            setCfg(updated);
            setApiKey("");
            setSavedAt(Date.now());
            setTimeout(() => setSavedAt(null), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setBusy(false);
        }
    }

    async function handleClear() {
        if (!confirm("Remove your saved AI key?")) return;
        await api.deleteAiConfig();
        setApiKey("");
        setModel("");
        setBaseUrl("");
        setTestResult(null);
        await load();
    }

    return (
        <Card className="p-6 border-[#E8E8ED]">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-[#2997FF]" />
                <h3 className="text-lg font-semibold">AI Provider</h3>
            </div>
            <p className="text-sm text-[#86868B] mb-4">
                Pick the AI used for matching, evaluations, stories, and negotiations. Keys are encrypted at rest with AES-256-GCM.
            </p>

            <div className="space-y-4">
                <div>
                    <Label className="text-sm">Provider</Label>
                    <Select value={provider} onValueChange={(v) => {
                        const p = v as AiProviderName;
                        setProvider(p);
                        if (!model) setModel(DEFAULT_MODELS[p]);
                        setTestResult(null);
                    }}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {(Object.keys(PROVIDER_LABELS) as AiProviderName[]).map((p) => (
                                <SelectItem key={p} value={p}>{PROVIDER_LABELS[p]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-sm">
                        API Key {cfg?.hasKey && <span className="text-xs text-[#34C759] ml-1">(saved · enter a new one to replace)</span>}
                    </Label>
                    <div className="relative">
                        <Input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={cfg?.hasKey ? "Leave blank to keep existing key" : "Paste your API key"}
                            className="h-11 rounded-xl border-[#E8E8ED] pr-12"
                            autoComplete="off"
                        />
                        <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B]">
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm">Model</Label>
                        <Input
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder={DEFAULT_MODELS[provider]}
                            className="h-11 rounded-xl border-[#E8E8ED]"
                        />
                    </div>
                    {NEEDS_BASE_URL[provider] && (
                        <div>
                            <Label className="text-sm">Base URL (optional)</Label>
                            <Input
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder="https://api.openai.com/v1"
                                className="h-11 rounded-xl border-[#E8E8ED]"
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}
                {testResult && (
                    <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${testResult.ok ? "bg-green-50 text-[#1F7A3A]" : "bg-red-50 text-red-600"}`}>
                        {testResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                        <div>
                            <p className="font-medium">{testResult.ok ? "Connected" : "Failed"}</p>
                            <p className="opacity-80">{testResult.message}</p>
                            {testResult.sample && <p className="opacity-70 mt-1 italic">&quot;{testResult.sample}&quot;</p>}
                        </div>
                    </div>
                )}
                {savedAt && (
                    <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-[#1F7A3A] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Saved.
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleTest} disabled={busy} className="rounded-xl">
                        {busy ? "Testing..." : "Test connection"}
                    </Button>
                    <Button onClick={handleSave} disabled={busy} className="rounded-xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90">
                        Save
                    </Button>
                    {cfg?.hasKey && (
                        <Button variant="outline" onClick={handleClear} className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove key
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
