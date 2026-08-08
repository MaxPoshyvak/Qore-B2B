'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { display, body } from '../../lib/fonts';
import { EASE } from '../../config/animations';
import { AI_PILLS } from '../../config/landing-data';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { MagneticButton } from '../ui/MagneticButton';
import { TiltCard } from '../ui/TiltCard';
import { GlowCard } from '../ui/GlowCard';
import { AIDemo } from '../demo/AIDemo';

export function AiShowcaseSection() {
    return (
        <section id="ai" className="mx-auto max-w-6xl px-6 py-24">
            <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:items-center">
                <Reveal>
                    <Eyebrow tone="violet">Pro & Business</Eyebrow>
                    <h2 className={`${display.className} text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                            AI
                        </span>{' '}
                        that makes money, not just a demo
                    </h2>
                    <p className="mt-5 text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        The core product is free and built to spread on its own. We deliberately kept expensive LLM
                        calls behind the paid tiers — that&apos;s a growth engine, not a hook.
                    </p>
                    <MagneticButton
                        primary
                        showSparks
                        href="#pricing"
                        className={`${body.className} mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#8B5CF6] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#A78BFA]`}>
                        Upgrade to Pro
                        <ArrowRight size={16} />
                    </MagneticButton>
                </Reveal>

                <Reveal delay={0.1}>
                    <AIDemo />
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {AI_PILLS.map((f) => (
                            <TiltCard key={f.title} strength={5}>
                                <GlowCard className="p-4" glow="139,92,246">
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
