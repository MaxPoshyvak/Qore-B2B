'use client';

import { motion } from 'framer-motion';

import { EASE } from '@/shared/config/animations';

function ItemCardSkeleton() {
    return (
        <div className="flex gap-4 rounded-[1.5rem] border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-[#121215]/60">
            <div className="flex flex-1 flex-col gap-2.5">
                <div className="h-4 w-32 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                <div className="h-3 w-full animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                <div className="h-3 w-2/3 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                <div className="mt-1 flex items-center justify-between">
                    <div className="h-6 w-14 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
                    <div className="h-8 w-8 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
                </div>
            </div>
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-black/[0.05] dark:bg-white/[0.07]" />
        </div>
    );
}

/** Loading placeholder mirroring the ultra-premium menu layout. */
export function PublicMenuSkeleton() {
    return (
        <div>
            {/* Cover + overlapping avatar */}
            <div className="h-40 animate-pulse rounded-[2rem] bg-gradient-to-br from-black/[0.06] to-black/[0.03] dark:from-white/10 dark:to-white/5" />
            <div className="relative -mt-12 flex justify-center">
                <div className="h-24 w-24 animate-pulse rounded-full border-4 border-[#FAFAF9] bg-black/[0.06] dark:border-[#0A0A0C] dark:bg-white/10" />
            </div>
            <div className="mt-4 space-y-3 text-center">
                <div className="mx-auto h-8 w-48 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                <div className="mx-auto h-5 w-40 animate-pulse rounded-full bg-black/[0.05] dark:bg-white/[0.07]" />
            </div>

            {/* Floating pill nav */}
            <div className="sticky top-4 z-40 mx-auto mt-8 w-[calc(100%-2rem)] max-w-2xl rounded-full border border-white/20 bg-white/60 p-1.5 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-black/40">
                <div className="flex gap-1 px-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-9 w-24 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10"
                        />
                    ))}
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}>
                        <ItemCardSkeleton />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
