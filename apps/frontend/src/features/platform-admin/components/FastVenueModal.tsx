'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    X,
    Copy,
    Check,
    ExternalLink,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Eye,
    Key,
    Mail,
    ArrowRight,
    Utensils,
    QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { FAST_VENUE_AI_PROMPT } from '../config/fast-venue-prompt';
import { useCreateFastVenue } from '../hooks/usePlatformAdmin';
import { fastVenueInputSchema, type FastVenueResultDTO } from '@my-app/types';

interface FastVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FastVenueModal({ isOpen, onClose }: FastVenueModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any | null>(null);
    const [result, setResult] = useState<FastVenueResultDTO | null>(null);

    const createMutation = useCreateFastVenue();

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(FAST_VENUE_AI_PROMPT);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2500);
        } catch {
            // fallback
        }
    };

    const handleCopyText = async (text: string, fieldId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldId);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            // fallback
        }
    };

    const handleJsonChange = (val: string) => {
        setJsonInput(val);
        setParseError(null);

        if (!val.trim()) {
            setParsedData(null);
            return;
        }

        try {
            // Strip markdown backticks if present
            let cleaned = val.trim();
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            // Strip accidental markdown link syntax inside JSON strings: "[url](url)" -> "url"
            cleaned = cleaned.replace(/\[.*?\]\((https?:\/\/[^\s")]+)\)/g, '$1');

            const parsed = JSON.parse(cleaned);
            const validation = fastVenueInputSchema.safeParse(parsed);

            if (!validation.success) {
                const issue = validation.error.issues[0];
                setParseError(`${issue.path.join('.') || 'root'}: ${issue.message}`);
                setParsedData(null);
            } else {
                setParsedData(validation.data);
                setParseError(null);
            }
        } catch (e: any) {
            setParseError(`Invalid JSON syntax: ${e.message}`);
            setParsedData(null);
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            handleJsonChange(text);
        } catch {
            // clipboard access not permitted
        }
    };

    const handleDeploy = async () => {
        if (!parsedData) return;
        try {
            const res = await createMutation.mutateAsync(parsedData);
            setResult(res);
        } catch (err: any) {
            setParseError(err?.message || 'Failed to deploy venue.');
        }
    };

    const handleReset = () => {
        setJsonInput('');
        setParsedData(null);
        setParseError(null);
        setResult(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-8 shadow-2xl text-[#F5F4F2]">
                {/* Header */}
                <div className="flex items-start justify-between pb-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400">
                            <Zap size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-white">
                                    Fast Venue AI Engine
                                </h2>
                                <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold text-black uppercase tracking-wider">
                                    1-Click Deploy
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#94938D]">
                                Turn Instagram screenshots or menu photos into a live restaurant in seconds.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-[#6B6A65] hover:bg-white/5 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {!result ? (
                    <div className="mt-6 space-y-6">
                        {/* Step 1: Copy AI Prompt */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-amber-400" />
                                        Step 1: Get Structured Data from AI
                                    </span>
                                    <p className="mt-1 text-xs text-[#94938D]">
                                        Copy our master prompt, attach your Instagram/menu photos into ChatGPT or Claude, then paste the resulting JSON below.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyPrompt}
                                    className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                                        copiedPrompt
                                            ? 'bg-emerald-500 text-black'
                                            : 'bg-white/10 text-white hover:bg-white/15'
                                    }`}>
                                    {copiedPrompt ? (
                                        <>
                                            <Check size={14} />
                                            Prompt Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            Copy AI Prompt
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Paste JSON */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                    Step 2: Paste AI Output (JSON)
                                </label>
                                <button
                                    type="button"
                                    onClick={handlePasteFromClipboard}
                                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                    Paste from Clipboard
                                </button>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => handleJsonChange(e.target.value)}
                                    rows={9}
                                    placeholder='{\n  "venue": { "name": "Roast Cafe", "themePreset": "botanical-garden", ... },\n  "categories": [ ... ]\n}'
                                    className="w-full rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-white placeholder:text-[#6B6A65] focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                            </div>

                            {/* Validation Status */}
                            {parseError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2.5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                    <span>{parseError}</span>
                                </motion.div>
                            )}

                            {parsedData && !parseError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
                                    <div className="flex items-center gap-2 font-bold">
                                        <CheckCircle2 size={15} />
                                        <span>Ready to Deploy: {parsedData.venue.name}</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#F5F4F2]">
                                        <span className="rounded-lg bg-black/40 px-2 py-0.5 border border-white/5">
                                            Categories: {parsedData.categories.length}
                                        </span>
                                        <span className="rounded-lg bg-black/40 px-2 py-0.5 border border-white/5">
                                            Items: {parsedData.categories.reduce((acc: number, c: any) => acc + c.items.length, 0)} ({parsedData.categories.reduce((acc: number, c: any) => acc + c.items.filter((i: any) => Boolean(i.imageUrl || i.image)).length, 0)} with photos)
                                        </span>
                                        <span className="rounded-lg bg-black/40 px-2 py-0.5 border border-white/5">
                                            Tables: {parsedData.venue.tablesCount || 6}
                                        </span>
                                        <span className="rounded-lg bg-black/40 px-2 py-0.5 border border-white/5 text-amber-300">
                                            Theme: {parsedData.venue.themePreset}
                                        </span>
                                        {(parsedData.venue.coverUrl || (parsedData.venue as any).coverImage) && (
                                            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/30 text-emerald-300">
                                                Cover Photo: Attached
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleDeploy}
                            disabled={!parsedData || Boolean(parseError) || createMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-3.5 text-sm font-bold text-black shadow-xl hover:opacity-95 transition-all disabled:cursor-not-allowed disabled:opacity-40">
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 size={17} className="animate-spin text-black" />
                                    <span>Deploying Venue, Menu & Tables...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={16} />
                                    <span>Deploy Venue in 1-Click</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Success Result View */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 space-y-6">
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                                <Check size={24} />
                            </span>
                            <h3 className="text-xl font-extrabold text-white">
                                {result.venueName} is Live!
                            </h3>
                            <p className="mt-1 text-xs text-emerald-300/80">
                                Generated {result.categoriesCreated} categories, {result.itemsCreated} dishes, and {result.tablesCreated} QR tables.
                            </p>
                        </div>

                        {/* Live Links Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#94938D] block">
                                Public Links
                            </span>

                            {/* Public Menu URL */}
                            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/40 border border-white/5">
                                <div className="overflow-hidden">
                                    <span className="text-[11px] font-semibold text-[#94938D] block">Live QR Menu:</span>
                                    <span className="font-mono text-xs text-blue-400 truncate block">
                                        {result.publicMenuUrl}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(result.publicMenuUrl, 'menuUrl')}
                                        className="rounded-lg bg-white/5 p-2 text-[#94938D] hover:text-white transition-colors">
                                        {copiedField === 'menuUrl' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                    <Link
                                        href={result.publicMenuUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-lg bg-blue-500/20 p-2 text-blue-400 hover:bg-blue-500/30 transition-colors">
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>

                            {/* Public Venue Landing */}
                            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/40 border border-white/5">
                                <div className="overflow-hidden">
                                    <span className="text-[11px] font-semibold text-[#94938D] block">Venue Landing:</span>
                                    <span className="font-mono text-xs text-purple-400 truncate block">
                                        {result.venueLandingUrl}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(result.venueLandingUrl, 'landingUrl')}
                                        className="rounded-lg bg-white/5 p-2 text-[#94938D] hover:text-white transition-colors">
                                        {copiedField === 'landingUrl' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                    <Link
                                        href={result.venueLandingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-lg bg-purple-500/20 p-2 text-purple-400 hover:bg-purple-500/30 transition-colors">
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Owner Credentials Card */}
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5 space-y-3.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block flex items-center gap-1.5">
                                <Key size={13} />
                                Owner Admin Credentials (Instant Login)
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Email */}
                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                    <div className="overflow-hidden">
                                        <span className="text-[10px] text-[#94938D] block font-semibold">Email</span>
                                        <span className="font-mono text-xs text-white truncate block">
                                            {result.credentials.email}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(result.credentials.email, 'email')}
                                        className="rounded-lg p-1.5 text-[#94938D] hover:text-white transition-colors">
                                        {copiedField === 'email' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    </button>
                                </div>

                                {/* Password */}
                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                                    <div className="overflow-hidden">
                                        <span className="text-[10px] text-[#94938D] block font-semibold">Password</span>
                                        <span className="font-mono text-xs text-amber-400 font-bold truncate block">
                                            {result.credentials.password}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(result.credentials.password, 'password')}
                                        className="rounded-lg p-1.5 text-[#94938D] hover:text-white transition-colors">
                                        {copiedField === 'password' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                                Create Another Venue
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-2xl bg-white text-black py-3 text-xs font-bold hover:bg-white/90 transition-colors">
                                Done
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
