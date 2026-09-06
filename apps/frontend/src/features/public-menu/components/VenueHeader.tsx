'use client';

import { motion } from 'framer-motion';
import type { PublicMenuVenueResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

import { getTodaySchedule } from '../lib/venue-hours';
import { LiveStatusBadge } from './LiveStatusBadge';

type VenueHeaderProps = {
    venue: PublicMenuVenueResponse;
};

export function VenueHeader({ venue }: VenueHeaderProps) {
    const workingHours = venue.workingHours;
    const todayInfo = getTodaySchedule(workingHours);

    const coverUrl = venue.coverUrl ?? undefined;
    const hasCover = Boolean(coverUrl);

    return (
        <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            // Додано mt-6 sm:mt-8, щоб відштовхнути блок від верхнього BaseHeader
            className="mt-6 text-left sm:mt-8">
            {/* Cover banner — gradient fallback when no cover image */}
            <div className="relative h-52 overflow-hidden rounded-[2rem] border border-black/5 shadow-lg dark:border-white/10 sm:h-60">
                {hasCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt={`${venue.name} cover`} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#3B82F6]/25 via-[#8B5CF6]/20 to-[#10B981]/15">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,rgba(59,130,246,0.30),transparent_70%),radial-gradient(ellipse_60%_60%_at_85%_100%,rgba(139,92,246,0.28),transparent_70%)]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            </div>

            {/* Overlapping glass logo */}
            <div className="relative -mt-12 ml-5 flex">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/15 shadow-2xl backdrop-blur-xl dark:bg-white/10">
                    {venue.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={venue.logoUrl} alt={venue.name} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                        <span className={`${display.className} text-4xl font-bold text-white drop-shadow-sm`}>
                            {venue.name.trim().charAt(0).toUpperCase() || '?'}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4 px-1">
                <h1
                    className={`${display.className} text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl`}>
                    {venue.name}
                </h1>

                {venue.description && (
                    <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {venue.description}
                    </p>
                )}

                <div className="mt-4 flex flex-col items-start gap-2">
                    <LiveStatusBadge workingHours={workingHours} />
                    {todayInfo && (
                        <span className="text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                            {todayInfo.isOpen ? 'Open' : 'Closed'} • {todayInfo.schedule}
                        </span>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
