'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { display, body, mono } from '@/shared/lib/fonts';
import { EASE, fadeUp, stagger } from '@/shared/config/animations';
import { HERO_METRICS } from '../../config/landing-data';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { MagneticButton } from '../ui/MagneticButton';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { LightningWithSparks } from '../ui/LightningWithSparks';
import { PhoneDemo } from '../demo/PhoneDemo';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-20 md:grid-cols-2 md:py-28">
                <motion.div initial="hidden" animate="show" variants={stagger}>
                    <motion.div variants={fadeUp}>
                        <Eyebrow>QR Menu · Reservations · AI</Eyebrow>
                    </motion.div>

                    <h1
                        className={`${display.className} text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[58px]`}>
                        {['One table.', 'One cart.'].map((line, i) => (
                            <motion.span
                                key={line}
                                variants={fadeUp}
                                custom={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}
                                className="block">
                                {line}
                            </motion.span>
                        ))}
                        <motion.span
                            variants={fadeUp}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
                            className="block bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
                            Zero chaos.
                        </motion.span>
                    </h1>

                    <motion.p
                        variants={fadeUp}
                        className="mt-6 max-w-md text-[15.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Qore is a platform for cafés and restaurants. Guests at the same table see a shared menu in real
                        time and split the bill themselves, while the AI engine lifts average order value and takes
                        routine work off your team.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
                        <MagneticButton
                            primary
                            showSparks
                            href="/register"
                            className={`${body.className} flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white`}>
                            Start for free
                            <ArrowRight size={16} />
                        </MagneticButton>
                        <MagneticButton
                            href="#how"
                            className={`${body.className} cursor-pointer rounded-full border border-[#E7E5E0] px-6 py-3.5 text-[14px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]`}>
                            View demo menu
                        </MagneticButton>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className={`${mono.className} mt-8 flex items-center gap-2 text-[12px] uppercase tracking-wider text-[#6B6A65]/80 dark:text-[#94938D]/80`}>
                        <LightningWithSparks size={14} />
                        <span>Server-rendered · under 1s even on slow 3G</span>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[#E7E5E0] pt-6 dark:border-[#232327]">
                        {HERO_METRICS.map((m, i) => (
                            <div key={i}>
                                <div className={`${display.className} text-[22px] font-bold`}>
                                    <AnimatedNumber value={m.value} prefix={m.prefix} suffix={m.suffix} />
                                </div>
                                <div
                                    className={`${mono.className} mt-1 text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                <PhoneDemo />
            </div>
        </section>
    );
}
