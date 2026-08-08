'use client';

import { motion } from 'framer-motion';
import { Check, QrCode, SplitSquareHorizontal, Sparkles } from 'lucide-react';

import { display } from '@/shared/lib/fonts';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { GlowCard } from '@/shared/ui/GlowCard';
import { EASE } from '@/shared/config/animations';

const HIGHLIGHTS = [
    { icon: QrCode, text: 'Guests scan a QR and the menu opens instantly' },
    { icon: SplitSquareHorizontal, text: 'Split the bill evenly or by item — no server needed' },
    { icon: Sparkles, text: 'AI concierge upsells 38% higher checks, 24/7' },
];

export function AuthSidePanel() {
    return (
        <div className="relative">
            <Eyebrow tone="blue">Why Qore</Eyebrow>
            <h2
                className={`${display.className} mb-4 text-[34px] font-bold leading-[1.05] tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                The all-in-one OS for modern venues
            </h2>
            <p className="mb-7 max-w-md text-[15px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                Live table carts, instant menu edits, AI recommendations and split billing — served
                straight to every guest&apos;s phone.
            </p>

            <div className="flex flex-col gap-3">
                {HIGHLIGHTS.map((h, i) => (
                    <motion.div
                        key={h.text}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}>
                        <GlowCard className="p-4">
                            <div className="flex items-center gap-3.5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                                    <h.icon size={18} strokeWidth={1.75} />
                                </span>
                                <span className="text-[14px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {h.text}
                                </span>
                            </div>
                        </GlowCard>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                <Check size={16} className="text-[#10B981]" strokeWidth={2.25} />
                No credit card required to get started
            </div>
        </div>
    );
}
