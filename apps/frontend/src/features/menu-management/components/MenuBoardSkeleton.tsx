'use client';

import { motion } from 'framer-motion';

import { EASE } from '@/shared/config/animations';

function ItemCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white/80 shadow-xs dark:border-[#232327] dark:bg-[#141417]/80">
            <div className="h-32 w-full animate-pulse bg-gradient-to-br from-black/[0.04] to-black/[0.02] dark:from-white/[0.06] dark:to-white/[0.02] sm:h-36" />
            <div className="space-y-2.5 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-28 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                    <div className="h-4 w-12 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                </div>
                <div className="space-y-1">
                    <div className="h-3 w-full animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                    <div className="h-3 w-2/3 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                </div>
                <div className="flex items-center gap-2 border-t border-[#E7E5E0] pt-2.5 dark:border-[#232327]">
                    <div className="h-3.5 w-12 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                    <div className="h-3.5 w-14 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                </div>
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
                    className="rounded-3xl border border-[#E7E5E0] bg-white/50 p-6 backdrop-blur-xl dark:border-[#232327] dark:bg-[#141417]/40 sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="h-8 w-1 rounded-full bg-black/[0.08] dark:bg-white/10" />
                            <div className="space-y-1.5">
                                <div className="h-5 w-36 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                                <div className="h-3 w-16 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                            </div>
                        </div>
                        <div className="h-8 w-24 animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/10" />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((card) => (
                            <ItemCardSkeleton key={card} />
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
