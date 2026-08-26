'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound, Link2, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';

import { type TenantSettingsResponse } from '@my-app/types';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { mono } from '@/shared/lib/fonts';
import { useKdsAuth } from '../hooks/use-kds-auth';

export function StaffKdsTab({ slug, settings }: { slug: string; settings?: TenantSettingsResponse | null }) {
    const { generate, revoke } = useKdsAuth(slug);

    // Local mirror so the PIN/token show immediately after generate, before the
    // tenant query re-syncs. Falls back to the server-provided values.
    const [token, setToken] = useState(settings?.kdsToken ?? null);
    const [pin, setPin] = useState(settings?.kdsPin ?? null);
    const [busy, setBusy] = useState<'generate' | 'revoke' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const hasAccess = Boolean(token && pin);

    async function handleGenerate() {
        setBusy('generate');
        setError(null);
        try {
            const res = await generate();
            setToken(res.kdsToken);
            setPin(res.kdsPin);
            setCopied(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not generate KDS access');
        } finally {
            setBusy(null);
        }
    }

    async function handleRegenerate() {
        await handleGenerate();
    }

    async function handleRevoke() {
        setBusy('revoke');
        setError(null);
        try {
            await revoke();
            setToken(null);
            setPin(null);
            setCopied(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not revoke KDS access');
        } finally {
            setBusy(null);
        }
    }

    function kdsLink(): string {
        if (typeof window === 'undefined' || !token) return '';
        return `${window.location.origin}/kds/${token}`;
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(kdsLink());
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable — no-op */
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                    Staff &amp; Kitchen Display
                </h2>
                <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">
                    Give your kitchen secure, isolated access to live orders.
                </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-card/50 p-5 backdrop-blur-sm dark:border-white/10">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6] dark:text-[#C4B5FD]">
                        <ShieldCheck size={18} />
                    </span>
                    <div>
                        <p className="text-[14px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                            Secure Kitchen Link
                        </p>
                        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            Generate a secure, isolated link for your kitchen staff. This link gives access to
                            Live Orders without exposing your dashboard settings, billing, or venue controls.
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                {!hasAccess ? (
                    <PrimaryButton
                        type="button"
                        onClick={handleGenerate}
                        loading={busy === 'generate'}
                        icon={<Link2 size={16} />}
                        className="mt-5">
                        Generate Kitchen Link
                    </PrimaryButton>
                ) : (
                    <div className="mt-5 space-y-4">
                        <label className="block">
                            <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                Kitchen link
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={kdsLink()}
                                    onFocus={(e) => e.currentTarget.select()}
                                    className="w-full rounded-xl border border-[#E7E5E0] bg-white/70 px-3 py-2.5 text-[13px] text-[#0A0A0C] outline-none dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]"
                                />
                                <button
                                    type="button"
                                    onClick={copy}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-2.5 text-[13px] font-medium text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 dark:text-[#60A5FA]">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </label>

                        <div>
                            <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                4-digit PIN
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-2.5">
                                    <KeyRound size={14} className="text-[#8B5CF6] dark:text-[#C4B5FD]" />
                                    <span
                                        className={`${mono.className} text-[16px] font-semibold tracking-[0.3em] text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                        {pin}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRegenerate}
                                    disabled={busy === 'generate'}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-[13px] font-medium text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 dark:border-white/15 dark:text-[#94938D]">
                                    {busy === 'generate' ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <RotateCcw size={14} />
                                    )}
                                    Regenerate PIN
                                </button>
                            </div>
                            <p className="mt-2 text-[12px] leading-relaxed text-[#9C9B95] dark:text-[#6E6D68]">
                                Share the link and PIN with kitchen staff. Regenerating rotates both credentials and
                                locks any open board.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleRevoke}
                            disabled={busy === 'revoke'}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/30 px-3 py-2 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60">
                            {busy === 'revoke' ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Revoke Access
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
