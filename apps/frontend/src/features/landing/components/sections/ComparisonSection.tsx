'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { display, mono } from '../../lib/fonts';
import { EASE } from '../../config/animations';
import { COMPARISON_QORE, COMPARISON_TYPICAL } from '../../config/landing-data';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';

export function ComparisonSection() {
    return (
        <section className="border-b border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
            <div className="mx-auto max-w-6xl px-6 py-20">
                <Reveal>
                    <Eyebrow>Comparison</Eyebrow>
                    <h2 className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        Why not just a QR code to a PDF
                    </h2>
                </Reveal>

                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="rounded-3xl border border-[#E7E5E0] bg-white p-7 dark:border-[#232327] dark:bg-[#141417]">
                        <span
                            className={`${mono.className} text-[11px] uppercase tracking-widest text-[#6B6A65] dark:text-[#94938D]`}>
                            Typical QR menu
                        </span>
                        <ul className="mt-5 space-y-4">
                            {COMPARISON_TYPICAL.map((t, i) => (
                                <motion.li
                                    key={t}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                                    className="flex items-start gap-3 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                                    <X size={15} className="mt-0.5 shrink-0 text-[#9C9B95] dark:text-[#6E6D68]" />
                                    {t}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                        className="relative rounded-3xl border border-[#3B82F6]/30 bg-white p-7 dark:bg-[#141417]">
                        <span className={`${mono.className} text-[11px] uppercase tracking-widest text-[#3B82F6]`}>
                            Qore
                        </span>
                        <ul className="mt-5 space-y-4">
                            {COMPARISON_QORE.map((t, i) => (
                                <motion.li
                                    key={t}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                                    className="flex items-start gap-3 text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    <Check
                                        size={15}
                                        className="mt-0.5 shrink-0 text-[#04916C] dark:text-[#10B981]"
                                        strokeWidth={2.5}
                                    />
                                    {t}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
