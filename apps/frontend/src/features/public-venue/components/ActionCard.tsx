'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { Variants } from 'framer-motion';

import { EASE } from '@/shared/config/animations';

export const fadeUpItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type ActionCardProps = {
    icon?: LucideIcon;
    title: string;
    description: string;
    action: React.ReactNode;
    /** Optional custom node rendered in place of the icon (e.g. an SVG brand glyph). */
    iconNode?: React.ReactNode;
};

/** Reusable glassmorphic card used inside the secondary action grid. */
export function ActionCard({ icon: Icon, title, description, action, iconNode }: ActionCardProps) {
    return (
        <motion.div
            variants={fadeUpItem}
            className="flex flex-col rounded-2xl border border-black/5 bg-white/60 p-4 backdrop-blur-xl transition-all hover:-translate-y-1 dark:border-white/10 dark:bg-[#121215]/60">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#8B5CF6]">
                    {iconNode ?? (Icon ? <Icon size={18} strokeWidth={1.9} /> : null)}
                </span>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">{title}</h3>
                    <p className="truncate text-xs text-[#6B6A65] dark:text-[#94938D]">{description}</p>
                </div>
            </div>
            <div className="mt-4">{action}</div>
        </motion.div>
    );
}
