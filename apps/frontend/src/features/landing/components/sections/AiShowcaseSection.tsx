'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { display, body } from '@/shared/lib/fonts';
import { AI_PILLS } from '../../config/landing-data';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { MagneticButton } from '../ui/MagneticButton';
import { TiltCard } from '../ui/TiltCard';
import { GlowCard } from '@/shared/ui/GlowCard';
import { AIDemo } from '../demo/AIDemo';

export function AiShowcaseSection() {
    const t = useTranslations('landing.aiShowcase');

    const localizedPills = [
        { ...AI_PILLS[0], title: t('promptPill') },
        { ...AI_PILLS[1], title: t('upsellPill') },
        { ...AI_PILLS[2], title: t('npsSummaryPill') },
    ];

    return (
        <section id="ai" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14 md:items-center">
                <Reveal>
                    <Eyebrow tone="violet">{t('badge')}</Eyebrow>
                    <h2 className={`${display.className} text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                            {t('titlePart1')}
                        </span>{' '}
                        {t('titlePart2')}
                    </h2>
                    <p className="mt-4 sm:mt-5 text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {t('subtitle')}
                    </p>
                    <MagneticButton
                        primary
                        showSparks
                        href="#pricing"
                        className={`${body.className} mt-6 sm:mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#8B5CF6] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#A78BFA]`}>
                        {t('upgradeCta')}
                        <ArrowRight size={16} />
                    </MagneticButton>
                </Reveal>

                <Reveal delay={0.1}>
                    <AIDemo />
                    <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                        {localizedPills.map((f) => (
                            <TiltCard key={f.title} strength={5}>
                                <GlowCard className="p-3.5 sm:p-4" glow="139,92,246">
                                    <div className="flex items-center gap-2.5">
                                        <motion.span
                                            whileHover={{ scale: 1.1, rotate: 15 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6]">
                                            <f.icon size={14} strokeWidth={1.75} />
                                        </motion.span>
                                        <span
                                            className={`${body.className} text-[12.5px] text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                            {f.title}
                                        </span>
                                    </div>
                                </GlowCard>
                            </TiltCard>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
