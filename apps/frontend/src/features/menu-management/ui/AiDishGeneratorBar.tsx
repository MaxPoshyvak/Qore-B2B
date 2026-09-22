'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Loader2, Lock, Sparkles } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { EASE } from '@/shared/config/animations';
import { body, mono } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';
import { type GenerateDishOutput } from '@my-app/types';
import { useGenerateDish } from '../api/useGenerateDish';
import { ProUpgradeModal } from './ProUpgradeModal';

type AiDishGeneratorBarProps = {
    /** Whether the active venue is on a PRO (or higher) plan. */
    isPro: boolean;
    /** Available categories, used to auto-select a matching one. */
    categories: { id: string; name: string }[];
    /** Called with the validated AI output so the parent form can populate. */
    onPopulate: (output: GenerateDishOutput) => void;
    /** Optional hook to route the user to the billing/upgrade flow. */
    onUpgrade?: () => void;
    /** Optional extra className for outer container. */
    className?: string;
};

export function AiDishGeneratorBar({
    isPro,
    categories,
    onPopulate,
    onUpgrade,
    className,
}: AiDishGeneratorBarProps) {
    const [expanded, setExpanded] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
    const [justDrafted, setJustDrafted] = useState(false);

    const generate = useGenerateDish();

    function handleGenerate() {
        if (!prompt.trim() || generate.isPending) return;
        setRateLimitMsg(null);

        generate.mutate(
            { prompt: prompt.trim() },
            {
                onSuccess: (data) => {
                    onPopulate(data);
                    setExpanded(false);
                    setJustDrafted(true);
                    setPrompt('');
                },
                onError: (error) => {
                    if (error instanceof ApiError && error.status === 403) {
                        const code = (error.data as { code?: string } | undefined)?.code;
                        if (code === 'PRO_PLAN_REQUIRED') {
                            setUpgradeOpen(true);
                            return;
                        }
                    }
                    if (error instanceof ApiError && error.status === 429) {
                        setRateLimitMsg('Too many requests. Please wait a minute.');
                        return;
                    }
                    setRateLimitMsg('Something went wrong. Please try again.');
                },
            },
        );
    }

    function resetDraft() {
        setJustDrafted(false);
        setExpanded(true);
    }

    return (
        <div className={cn('select-none', body.className, className)}>
            <div className="rounded-2xl border border-[#8B5CF6]/20 bg-gradient-to-r from-[#8B5CF6]/[0.08] via-[#3B82F6]/[0.03] to-transparent p-3.5 dark:border-[#8B5CF6]/30 dark:from-[#8B5CF6]/15">
                {/* Success state */}
                <AnimatePresence initial={false} mode="wait">
                    {justDrafted ? (
                        <motion.div
                            key="drafted"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-xs font-medium text-[#8B5CF6]">
                                <Sparkles size={14} />
                                Form drafted by AI. You can review and adjust.
                            </span>
                            <button
                                type="button"
                                onClick={resetDraft}
                                className="shrink-0 text-xs font-medium text-[#8B5CF6]/80 underline-offset-2 transition-colors md:hover:underline">
                                Draft again
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={15} className="text-[#8B5CF6]" />
                                <span className="text-xs font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    Draft with AI Assistant
                                </span>
                                <span
                                    className={cn(
                                        'rounded-md bg-[#8B5CF6]/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#8B5CF6]',
                                        mono.className,
                                    )}>
                                    AI
                                </span>
                            </div>

                            {isPro ? (
                                <button
                                    type="button"
                                    onClick={() => setExpanded((v) => !v)}
                                    aria-expanded={expanded}
                                    className="flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/30 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#7C3AED] shadow-xs transition-colors dark:border-[#8B5CF6]/35 dark:bg-white/5 dark:text-[#C4B5FD] md:hover:bg-[#8B5CF6]/10">
                                    Generate with AI
                                    <ChevronDown
                                        size={14}
                                        className={cn('transition-transform duration-200', expanded && 'rotate-180')}
                                    />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setUpgradeOpen(true)}
                                    className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6]/15 px-2.5 py-1 text-[11px] font-medium text-[#8B5CF6] transition-colors md:hover:bg-[#8B5CF6]/25">
                                    <Lock size={12} />
                                    Pro
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expanded composer */}
                <AnimatePresence initial={false}>
                    {expanded && isPro && (
                        <motion.div
                            key="composer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden">
                            <div className="mt-3.5 flex flex-col gap-3 border-t border-[#8B5CF6]/15 pt-3.5">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate();
                                    }}
                                    rows={3}
                                    placeholder="e.g. Creamy truffle pasta with wild mushrooms, parmesan crisp, and fresh thyme..."
                                    className={cn(
                                        'w-full resize-none rounded-xl border bg-white/90 p-3 text-sm font-normal leading-relaxed text-[#0A0A0C] outline-none transition-colors placeholder:text-[#A8A6A0] focus:border-[#8B5CF6]/70 focus:ring-1 focus:ring-[#8B5CF6]/20 dark:border-[#232327] dark:bg-[#141417]/90 dark:text-[#F5F4F2] dark:placeholder:text-[#5A5A56]',
                                        generate.isPending
                                            ? 'border-[#8B5CF6]/60 opacity-70'
                                            : 'border-[#E7E5E0] dark:border-[#232327]',
                                    )}
                                />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                        <kbd
                                            className={cn(
                                                'rounded border border-black/10 bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                                                mono.className,
                                            )}>
                                            ⌘ / Ctrl
                                        </kbd>
                                        <kbd
                                            className={cn(
                                                'rounded border border-black/10 bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                                                mono.className,
                                            )}>
                                            ↵
                                        </kbd>
                                        <span className="text-[11px]">to generate</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={!prompt.trim() || generate.isPending}
                                        className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-all md:hover:bg-[#7C3AED] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                                        {generate.isPending ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" />
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={13} />
                                                <span>Generate dish</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {rateLimitMsg && (
                                    <p className="text-xs font-medium text-[#DC2626] dark:text-[#F87171]">
                                        {rateLimitMsg}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ProUpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} onUpgrade={onUpgrade} />
        </div>
    );
}
