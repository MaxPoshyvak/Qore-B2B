'use client';

import { motion } from 'framer-motion';

import { EASE } from '@/shared/config/animations';

function ItemCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
            <div className="h-28 animate-pulse bg-gradient-to-br from-black/[0.06] to-black/[0.03] dark:from-white/10 dark:to-white/5" />
            <div className="space-y-2.5 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-28 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                    <div className="h-4 w-14 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                </div>
                <div className="h-3 w-full animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                <div className="h-3 w-2/3 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
            </div>
        </div>
    );
}

/** Loading placeholder that mirrors the real board layout to avoid layout shift. */
export function MenuBoardSkeleton() {
    return (
        <div className="space-y-6">
            {[0, 1].map((section) => (
                <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: section * 0.08 }}
                    className="rounded-3xl border border-black/10 bg-white/40 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="h-8 w-1 rounded-full bg-black/[0.08] dark:bg-white/10" />
                            <div className="space-y-2">
                                <div className="h-5 w-36 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                                <div className="h-3 w-16 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                            </div>
                        </div>
                        <div className="h-9 w-24 animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/10" />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {[0, 1, 2].map((card) => (
                            <ItemCardSkeleton key={card} />
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
