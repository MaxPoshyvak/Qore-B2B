'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, Plus, Store, Sparkles } from 'lucide-react';

import { useTheme } from '@/shared/hooks/useTheme';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import type { Tenant } from '@my-app/database';

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function planLabel(plan?: string | null): { text: string; business: boolean } {
    if (!plan) return { text: 'Free', business: false };
    const normalizedPlan = plan.toLowerCase();
    const text = normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);
    return { text, business: normalizedPlan === 'business' };
}

export function DashboardHubView({ tenants, userName }: { tenants: Tenant[]; userName?: string }) {
    const { theme, toggle, mounted } = useTheme();
    const [copied, setCopied] = useState<string | null>(null);
    const isBusinessPlan = tenants.some((tenant) => tenant.subscriptionPlan?.toLowerCase() === 'business');

    async function copySlug(slug: string, e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(`useqore.app/${slug}`);
            setCopied(slug);
            setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1500);
        } catch {
            /* ignore */
        }
    }

    return (
        <div className="relative min-h-screen text-[#0A0A0C] antialiased dark:text-[#F5F4F2]">
            <AmbientBackground />

            {/* Header */}
            <BaseHeader>
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
                {isBusinessPlan && (
                    <Link
                        href="/onboarding"
                        className="flex items-center gap-1.5 rounded-full bg-[#0A0A0C] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white">
                        <Plus size={15} strokeWidth={2.25} />
                        Add venue
                    </Link>
                )}
            </BaseHeader>

            <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 px-3 py-1 text-[12px] font-medium text-[#8B5CF6] dark:text-[#A78BFA]">
                        <Sparkles size={13} />
                        Multi-Venue Active
                    </span>
                    <h1
                        className={`${display.className} mt-4 text-[36px] font-bold leading-[1.05] tracking-tight sm:text-[46px]`}>
                        {userName ? `Welcome back, ${userName}` : 'Select a workspace'}
                    </h1>
                    <p className="mt-2 max-w-xl text-[15px] text-[#6B6A65] dark:text-[#94938D]">
                        You&apos;re managing {tenants.length} venues under your Business Network. Pick where you want to dive in.
                    </p>
                </motion.div>

                {/* Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {tenants.map((tenant) => {
                        const plan = planLabel(tenant.subscriptionPlan);
                        return (
                            <motion.div key={tenant.id} variants={item}>
                                <Link
                                    href={`/dashboard/${tenant.slug}`}
                                    className="group relative flex h-full flex-col rounded-3xl border border-black/10 bg-white/50 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/40 hover:shadow-[0_24px_70px_-40px_rgba(59,130,246,0.5)] dark:border-white/10 dark:bg-[#121215]/80 dark:hover:border-[#3B82F6]/40">
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white">
                                            <Store size={20} strokeWidth={1.75} />
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                plan.business
                                                    ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#A78BFA]'
                                                    : 'bg-[#3B82F6]/10 text-[#3B82F6]'
                                            }`}>
                                            {plan.text}
                                        </span>
                                    </div>

                                    <h2 className="mt-5 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {tenant.name}
                                    </h2>

                                    <div className="mt-2 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[12px] text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]">
                                            useqore.app/{tenant.slug}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Copy link"
                                            onClick={(e) => copySlug(tenant.slug, e)}
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#A8A6A0] transition-colors hover:text-[#3B82F6] dark:hover:text-[#3B82F6]">
                                            {copied === tenant.slug ? (
                                                <Check size={13} />
                                            ) : (
                                                <Copy size={13} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="mt-auto flex items-center justify-end pt-6">
                                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#3B82F6] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                                            Open <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}

                    {isBusinessPlan && (
                        <motion.div variants={item}>
                            <Link
                                href="/onboarding"
                                className="group flex h-full min-h-[15rem] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/15 bg-transparent p-6 text-center transition-colors hover:border-[#3B82F6]/40 dark:border-white/15 dark:hover:border-[#3B82F6]/40">
                                <motion.span
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                                    <Plus size={24} strokeWidth={2} />
                                </motion.span>
                                <h3 className="mt-4 text-[16px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    New Venue
                                </h3>
                                <p className="mt-1 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                    Expand your network
                                </p>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
