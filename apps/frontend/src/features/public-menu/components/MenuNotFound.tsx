'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

/** Shown when the venue slug has no public menu (or the request failed). */
export function MenuNotFound({ slug }: { slug: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/15 to-[#8B5CF6]/15 text-[#3B82F6] dark:text-[#8B5CF6]">
                <UtensilsCrossed size={28} strokeWidth={1.6} />
            </span>
            <h1
                className={`${display.className} mt-6 text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                Menu not found
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                We couldn&apos;t find a menu for <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{slug}</span>.
                The venue may not be published yet, or the link is incorrect.
            </p>
            <Link
                href="/"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-opacity hover:opacity-95">
                Go to CaféBoard
            </Link>
        </motion.div>
    );
}
