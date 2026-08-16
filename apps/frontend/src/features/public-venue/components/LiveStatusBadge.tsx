'use client';

import { motion } from 'framer-motion';

import { mono } from '@/shared/lib/fonts';

import { getVenueStatus } from '../lib/venue-hours';

export function LiveStatusBadge({ workingHours }: { workingHours: unknown }) {
    const { isOpen, label, hasHours } = getVenueStatus(workingHours);

    if (!hasHours) {
        return (
            <span
                className={`${mono.className} inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#6B6A65] dark:border-white/15 dark:bg-white/10 dark:text-[#94938D]`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#9C9B95]" />
                {label}
            </span>
        );
    }

    const tone = isOpen
        ? 'border-[#10B981]/30 bg-[#10B981]/15 text-[#04916C] dark:text-[#10B981]'
        : 'border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24]';
    const dot = isOpen ? 'bg-[#10B981]' : 'bg-[#F59E0B]';

    return (
        <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`${mono.className} inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-widest ${tone}`}>
            <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dot}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
            </span>
            {label}
        </motion.span>
    );
}
