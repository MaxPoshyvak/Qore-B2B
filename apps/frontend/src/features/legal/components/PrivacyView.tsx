'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, UserCheck, ShieldAlert, FileText, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { PublicShell } from '@/shared/ui/PublicShell';

export function PrivacyView() {
    const t = useTranslations('legal.privacy');
    const tLegal = useTranslations('legal');

    const highlights = [
        {
            icon: Lock,
            title: t('highlight1Title'),
            desc: t('highlight1Desc'),
            color: 'from-[#10B981]/20 to-[#059669]/10 text-[#04916C] dark:text-[#10B981]',
        },
        {
            icon: ShieldCheck,
            title: t('highlight2Title'),
            desc: t('highlight2Desc'),
            color: 'from-[#3B82F6]/20 to-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]',
        },
        {
            icon: UserCheck,
            title: t('highlight3Title'),
            desc: t('highlight3Desc'),
            color: 'from-[#8B5CF6]/20 to-[#7C3AED]/10 text-[#7C3AED] dark:text-[#C4B5FD]',
        },
    ];

    const sections = [
        { id: 'sec1', title: t('sec1Title'), content: t('sec1Content') },
        {
            id: 'sec2',
            title: t('sec2Title'),
            subsections: [
                { title: t('sec2B2BTitle'), content: t('sec2B2BContent') },
                { title: t('sec2B2CTitle'), content: t('sec2B2CContent') },
                { title: t('sec2DeviceTitle'), content: t('sec2DeviceContent') },
            ],
        },
        { id: 'sec3', title: t('sec3Title'), content: t('sec3Content') },
        { id: 'sec4', title: t('sec4Title'), content: t('sec4Content') },
        { id: 'sec5', title: t('sec5Title'), content: t('sec5Content') },
        { id: 'sec6', title: t('sec6Title'), content: t('sec6Content') },
        { id: 'sec7', title: t('sec7Title'), content: t('sec7Content') },
        { id: 'sec8', title: t('sec8Title'), content: t('sec8Content') },
        { id: 'sec9', title: t('sec9Title'), content: t('sec9Content') },
        { id: 'sec10', title: t('sec10Title'), content: t('sec10Content') },
    ];

    return (
        <PublicShell>
            <div className="mx-auto max-w-4xl px-6 py-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/5 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#93C5FD]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                        {tLegal('badge')}
                    </span>

                    <h1
                        className={`${display.className} mt-4 text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl lg:text-5xl`}>
                        {t('title')}
                    </h1>

                    <p className={`${mono.className} mt-3 text-xs tracking-wide text-[#6B6A65] dark:text-[#94938D]`}>
                        {t('lastUpdated')}
                    </p>

                    <p className="mt-5 text-base leading-relaxed text-[#3A3A36] dark:text-[#C7C6C1] sm:text-lg">
                        {t('introLead')}
                    </p>
                </motion.div>

                {/* Privacy Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
                    className="mt-10 grid gap-4 sm:grid-cols-3">
                    {highlights.map((h) => {
                        const Icon = h.icon;
                        return (
                            <div
                                key={h.title}
                                className="rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                                <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${h.color}`}>
                                    <Icon size={18} strokeWidth={2.2} />
                                </span>
                                <h2 className={`${display.className} mt-3 text-[15px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {h.title}
                                </h2>
                                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                    {h.desc}
                                </p>
                            </div>
                        );
                    })}
                </motion.div>

                <div className="my-10 border-t border-[#E7E5E0] dark:border-[#232327]" />

                {/* Document Body */}
                <div className="space-y-10">
                    {sections.map((sec, idx) => (
                        <motion.section
                            key={sec.id}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.45, ease: EASE }}
                            id={sec.id}
                            className="scroll-mt-32">
                            <h2
                                className={`${display.className} text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-2xl`}>
                                {sec.title}
                            </h2>

                            {sec.content && (
                                <p className="mt-3 text-[14.5px] leading-relaxed text-[#3A3A36] dark:text-[#C7C6C1]">
                                    {sec.content}
                                </p>
                            )}

                            {sec.subsections && (
                                <div className="mt-5 space-y-4 pl-1 sm:pl-4">
                                    {sec.subsections.map((sub) => (
                                        <div
                                            key={sub.title}
                                            className="rounded-2xl border border-black/5 bg-black/[0.015] p-4.5 dark:border-white/5 dark:bg-white/[0.02]">
                                            <h3 className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                {sub.title}
                                            </h3>
                                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                                {sub.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.section>
                    ))}
                </div>

                {/* Bottom Contact / Legal Callout */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-14 rounded-3xl border border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/[0.08] to-[#8B5CF6]/[0.05] p-7 text-center">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/15 text-[#3B82F6] dark:text-[#60A5FA]">
                        <Mail size={20} strokeWidth={2.2} />
                    </span>
                    <h3 className={`${display.className} mt-3 text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Questions about your privacy or data?
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-[#6B6A65] dark:text-[#94938D]">
                        Our Data Protection Officer and compliance team are available to handle any inquiries or deletion requests.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <a
                            href="mailto:privacy@useqore.app"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                            privacy@useqore.app
                        </a>
                        <Link
                            href="/terms"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E5E0] bg-white px-4 py-2.5 text-xs font-medium text-[#0A0A0C] transition-colors hover:bg-black/5 dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                            Terms of Service
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </PublicShell>
    );
}
