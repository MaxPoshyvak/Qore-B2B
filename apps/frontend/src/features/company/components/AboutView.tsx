'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, Users, ChefHat, ShieldCheck, ArrowRight, Sparkles, Coffee } from 'lucide-react';
import Link from 'next/link';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { PublicShell } from '@/shared/ui/PublicShell';

export function AboutView() {
    const t = useTranslations('about');

    const stats = [
        {
            value: t('stats.stat1Value'),
            label: t('stats.stat1Label'),
            desc: t('stats.stat1Desc'),
        },
        {
            value: t('stats.stat2Value'),
            label: t('stats.stat2Label'),
            desc: t('stats.stat2Desc'),
        },
        {
            value: t('stats.stat3Value'),
            label: t('stats.stat3Label'),
            desc: t('stats.stat3Desc'),
        },
    ];

    const pillars = [
        {
            icon: Zap,
            title: t('pillar1Title'),
            desc: t('pillar1Desc'),
            color: 'from-[#3B82F6]/20 to-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]',
        },
        {
            icon: Users,
            title: t('pillar2Title'),
            desc: t('pillar2Desc'),
            color: 'from-[#8B5CF6]/20 to-[#7C3AED]/10 text-[#7C3AED] dark:text-[#C4B5FD]',
        },
        {
            icon: ChefHat,
            title: t('pillar3Title'),
            desc: t('pillar3Desc'),
            color: 'from-[#10B981]/20 to-[#059669]/10 text-[#04916C] dark:text-[#10B981]',
        },
        {
            icon: ShieldCheck,
            title: t('pillar4Title'),
            desc: t('pillar4Desc'),
            color: 'from-[#F59E0B]/20 to-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24]',
        },
    ];

    return (
        <PublicShell>
            <div className="mx-auto max-w-5xl px-6 py-4">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/5 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#93C5FD]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                        {t('badge')}
                    </span>

                    <h1
                        className={`${display.className} mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl lg:text-5xl`}>
                        {t('title')}
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#6B6A65] dark:text-[#94938D] sm:text-lg">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
                    className="mt-12 grid gap-4 sm:grid-cols-3">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-3xl border border-black/5 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                            <span
                                className={`${display.className} bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl`}>
                                {s.value}
                            </span>
                            <h2 className="mt-2 text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                {s.label}
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* The Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="mt-16 rounded-[32px] border border-black/5 bg-gradient-to-br from-black/[0.02] to-black/[0.005] p-8 dark:border-white/10 dark:from-white/[0.02] dark:to-transparent sm:p-12">
                    <span
                        className={`${mono.className} text-[11px] uppercase tracking-widest text-[#3B82F6]`}>
                        {t('storyBadge')}
                    </span>
                    <h2
                        className={`${display.className} mt-3 text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-3xl`}>
                        {t('storyTitle')}
                    </h2>

                    <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#3A3A36] dark:text-[#C7C6C1]">
                        <p>{t('storyText1')}</p>
                        <p>{t('storyText2')}</p>
                    </div>
                </motion.div>

                {/* Pillars Grid */}
                <div className="mt-20">
                    <div className="text-center">
                        <span
                            className={`${mono.className} text-[11px] uppercase tracking-widest text-[#3B82F6]`}>
                            {t('pillarsBadge')}
                        </span>
                        <h2
                            className={`${display.className} mt-2 text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-3xl`}>
                            {t('pillarsTitle')}
                        </h2>
                    </div>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2">
                        {pillars.map((p) => {
                            const Icon = p.icon;
                            return (
                                <motion.div
                                    key={p.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, ease: EASE }}
                                    className="rounded-3xl border border-black/5 bg-white/70 p-7 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                                    <span
                                        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color}`}>
                                        <Icon size={22} strokeWidth={2} />
                                    </span>
                                    <h3
                                        className={`${display.className} mt-4 text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                        {p.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                        {p.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="mt-20 overflow-hidden rounded-[32px] border border-[#3B82F6]/25 bg-gradient-to-br from-[#3B82F6]/10 via-[#8B5CF6]/10 to-transparent p-8 text-center sm:p-12">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-[#3B82F6]/25">
                        <Sparkles size={22} strokeWidth={2.2} />
                    </span>

                    <h2
                        className={`${display.className} mx-auto mt-4 max-w-xl text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-3xl`}>
                        {t('ctaTitle')}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[#6B6A65] dark:text-[#94938D]">
                        {t('ctaDesc')}
                    </p>

                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-opacity hover:opacity-95">
                            {t('ctaButton')}
                            <ArrowRight size={15} />
                        </Link>
                        <Link
                            href="/#pricing"
                            className="inline-flex items-center gap-2 rounded-2xl border border-[#E7E5E0] bg-white px-6 py-3.5 text-sm font-semibold text-[#0A0A0C] transition-colors hover:bg-black/5 dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                            {t('ctaSecondary')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </PublicShell>
    );
}
