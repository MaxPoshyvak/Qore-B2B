'use client';

import { motion } from 'framer-motion';
import type { PublicMenuVenueResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { LiveStatusBadge } from './LiveStatusBadge';

type VenueHeaderProps = {
    venue: PublicMenuVenueResponse;
};

export function VenueHeader({ venue }: VenueHeaderProps) {
    const workingHours = venue.workingHours;
    const coverUrl = venue.coverUrl ?? undefined;
    const hasCover = Boolean(coverUrl);

    return (
        <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-2.5 text-left sm:mt-6">
            {/* Cinematic cover banner with compact modern aspect ratio */}
            <div className="relative h-28 overflow-hidden rounded-2xl border border-black/5 shadow-xs dark:border-white/10 sm:h-44 sm:rounded-3xl">
                {hasCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt={`${venue.name} cover`} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#3B82F6]/25 via-[#8B5CF6]/20 to-[#10B981]/15">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,rgba(59,130,246,0.30),transparent_70%),radial-gradient(ellipse_60%_60%_at_85%_100%,rgba(139,92,246,0.28),transparent_70%)]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>

            {/* Profile info: Glass avatar + Title & Status */}
            <div className="relative -mt-8 px-2 sm:-mt-12 sm:px-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-3 min-w-0 sm:gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 bg-white/40 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-[#121215]/80 sm:h-24 sm:w-24">
                            {venue.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={venue.logoUrl} alt={venue.name} className="h-full w-full rounded-2xl object-cover" />
                            ) : (
                                <span className={`${display.className} text-2xl font-bold text-white drop-shadow-sm sm:text-4xl`}>
                                    {venue.name.trim().charAt(0).toUpperCase() || '?'}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 pb-0.5">
                            <h1
                                className={`${display.className} truncate text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-3xl`}>
                                {venue.name}
                            </h1>
                            {venue.description && (
                                <p className="mt-0.5 line-clamp-1 max-w-lg text-xs text-[#6B6A65] dark:text-[#94938D] sm:text-[13.5px]">
                                    {venue.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Single reliable live status pill */}
                    <div className="shrink-0 self-start sm:self-end sm:pb-1">
                        <LiveStatusBadge workingHours={workingHours} />
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
