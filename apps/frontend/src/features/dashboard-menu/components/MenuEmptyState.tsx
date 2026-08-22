'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, Plus } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

/** Shown when a venue has no categories yet. */
export function MenuEmptyState({ onAddCategory }: { onAddCategory: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-black/15 bg-white/40 px-6 py-16 text-center backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.03]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.10),transparent_70%)]" />

            <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-[#3B82F6]/25">
                <LayoutGrid size={26} strokeWidth={1.8} />
            </motion.span>

            <h3
                className={`${display.className} relative mt-6 text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                Your menu is a blank canvas
            </h3>
            <p className="relative mt-2 max-w-md text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                Categories group your dishes — think “Breakfast”, “Coffee” or “Desserts”. Create your first one to
                start building the menu your guests will see.
            </p>

            <motion.button
                type="button"
                onClick={onAddCategory}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-opacity hover:opacity-95">
                <Plus size={17} strokeWidth={2.4} />
                Add your first category
            </motion.button>
        </motion.div>
    );
}
