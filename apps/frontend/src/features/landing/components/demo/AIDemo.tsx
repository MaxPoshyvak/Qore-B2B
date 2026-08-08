'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { body, mono } from '../../lib/fonts';
import { EASE } from '../../config/animations';
import { AI_DEMO } from '../../config/landing-data';
import { TiltCard } from '../ui/TiltCard';

export function AIDemo() {
    const [pairIndex, setPairIndex] = useState(0);
    const [qChars, setQChars] = useState(0);
    const [aChars, setAChars] = useState(0);
    const [showA, setShowA] = useState(false);
    const pair = AI_DEMO[pairIndex];

    useEffect(() => {
        setQChars(0);
        setAChars(0);
        setShowA(false);
    }, [pairIndex]);

    useEffect(() => {
        if (qChars < pair.q.length) {
            const t = setTimeout(() => setQChars((c) => c + 1), 32);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setShowA(true), 450);
        return () => clearTimeout(t);
    }, [qChars, pair.q.length]);

    useEffect(() => {
        if (!showA) return;
        if (aChars < pair.a.length) {
            const t = setTimeout(() => setAChars((c) => c + 1), 18);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setPairIndex((p) => (p + 1) % AI_DEMO.length), 2600);
        return () => clearTimeout(t);
    }, [showA, aChars, pair.a.length]);

    return (
        <TiltCard strength={5}>
            <div className="relative overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-5 shadow-lg dark:border-[#232327] dark:bg-[#141417]">
                <div className="relative flex items-center gap-2 border-b border-[#E7E5E0] pb-3 dark:border-[#232327]">
                    <motion.span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6]"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                        <Sparkles size={14} />
                    </motion.span>
                    <span className={`${body.className} text-[13px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        AI waiter concierge
                    </span>
                    <span
                        className={`${mono.className} ml-auto rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] uppercase tracking-widest text-[#8B5CF6]`}>
                        Pro
                    </span>
                </div>

                <div className={`${body.className} relative mt-4 min-h-[92px] space-y-3 text-[13px]`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[#0A0A0C]/[0.05] px-3 py-2 text-[#0A0A0C] dark:bg-white/10 dark:text-[#F5F4F2]">
                        {pair.q.slice(0, qChars)}
                        {qChars < pair.q.length && <span className="animate-pulse">▍</span>}
                    </motion.div>
                    {showA && (
                        <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#8B5CF6]/10 px-3 py-2 text-[#8B5CF6]">
                            {pair.a.slice(0, aChars)}
                            {aChars < pair.a.length && <span className="animate-pulse">▍</span>}
                        </motion.div>
                    )}
                </div>
            </div>
        </TiltCard>
    );
}
