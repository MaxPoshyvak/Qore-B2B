'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { TICKET_EVENTS } from '../../config/landing-data';
import { TiltCard } from '../ui/TiltCard';

export function LiveTablePanel() {
    const [phase, setPhase] = useState(0);
    const [showUpsell, setShowUpsell] = useState(false);
    const totalPhases = TICKET_EVENTS.length + 2;

    useEffect(() => {
        const reduced =
            typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            setPhase(totalPhases - 1);
            return;
        }
        const delay = phase >= totalPhases - 1 ? 3400 : 1450;
        const t = setTimeout(() => {
            setPhase((p) => (p >= totalPhases - 1 ? 0 : p + 1));
        }, delay);
        return () => clearTimeout(t);
    }, [phase, totalPhases]);

    useEffect(() => {
        if (phase === 3) {
            const t1 = setTimeout(() => setShowUpsell(true), 350);
            const t2 = setTimeout(() => setShowUpsell(false), 1650);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [phase]);

    const visibleEvents = TICKET_EVENTS.slice(0, Math.min(phase + 1, TICKET_EVENTS.length));
    const showTotal = phase >= TICKET_EVENTS.length;
    const showSplit = phase >= TICKET_EVENTS.length + 1;
    const total = visibleEvents.reduce((s, e) => s + e.price, 0);

    const perGuest = useMemo(() => {
        const map = new Map<string, { color: string; sum: number }>();
        for (const e of TICKET_EVENTS) {
            const cur = map.get(e.guest) ?? { color: e.color, sum: 0 };
            cur.sum += e.price;
            map.set(e.guest, cur);
        }
        return Array.from(map.entries());
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[360px]">
            {/* live badge */}
            <motion.div
                className={`${mono.className} absolute -top-4 left-6 z-20 flex items-center gap-1.5 rounded-full bg-[#10B981] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white shadow-sm`}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                table 4 · live
            </motion.div>

            {/* AI upsell bubble */}
            <AnimatePresence>
                {showUpsell && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 16, y: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 16 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={`${mono.className} absolute -right-7 top-16 z-30 w-[192px] rounded-2xl border border-[#8B5CF6]/30 bg-white/95 p-3 text-[10.5px] leading-relaxed text-[#0A0A0C] shadow-lg backdrop-blur-xl dark:bg-[#16151D]/95 dark:text-[#F5F4F2]`}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-[#8B5CF6]">
                            <Wand2 size={11} /> AI upsell
                        </div>
                        Cappuccino pairs well with a croissant — add for $5.50?
                    </motion.div>
                )}
            </AnimatePresence>

            <TiltCard strength={6}>
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                    <div className="relative flex items-baseline justify-between border-b border-[#0A0A0C]/10 pb-3 dark:border-white/10">
                        <span
                            className={`${display.className} text-[16px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Qore
                        </span>
                        <span
                            className={`${mono.className} text-[10px] uppercase tracking-widest text-[#6B6A65] dark:text-[#94938D]`}>
                            check #0192
                        </span>
                    </div>

                    <div
                        className={`${mono.className} relative mt-4 min-h-[168px] space-y-2.5 text-[12.5px] text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        <AnimatePresence initial={false}>
                            {visibleEvents.map((e, i) => (
                                <motion.div
                                    key={`${e.item}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, ease: EASE }}
                                    className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 odd:bg-[#0A0A0C]/[0.03] dark:odd:bg-white/[0.04]">
                                    <span className="flex items-center gap-2">
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                            style={{ backgroundColor: e.color }}>
                                            {e.initials}
                                        </motion.span>
                                        {e.item}
                                    </span>
                                    <span className="tabular-nums">${e.price.toFixed(2)}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div
                        className={`${mono.className} relative mt-4 flex items-center justify-between border-t border-[#0A0A0C]/10 pt-3 text-[13px] font-semibold text-[#0A0A0C] transition-opacity duration-300 dark:border-white/10 dark:text-[#F5F4F2] ${
                            showTotal ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <span>Total</span>
                        <span className="tabular-nums">${total.toFixed(2)}</span>
                    </div>

                    <div
                        className={`${mono.className} relative mt-3 space-y-1.5 border-t border-[#0A0A0C]/10 pt-3 text-[11.5px] text-[#0A0A0C]/80 transition-all duration-500 dark:border-white/10 dark:text-[#F5F4F2]/80 ${
                            showSplit ? 'max-h-40 opacity-100' : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
                        }`}>
                        <div className="mb-1 uppercase tracking-widest text-[10px] text-[#6B6A65] dark:text-[#94938D]">
                            Split evenly
                        </div>
                        {perGuest.map(([guest, v]) => (
                            <div key={guest} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                                    {guest}
                                </span>
                                <span className="tabular-nums">${(total / perGuest.length).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </TiltCard>
        </motion.div>
    );
}
