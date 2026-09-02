'use client';

import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import type { PublicMenuVenueResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { Eyebrow } from '@/shared/ui/Eyebrow';

type VenueHeaderProps = {
    venue: PublicMenuVenueResponse;
    /**
     * Реальний статус "відкрито/закрито" на основі робочих годин закладу.
     * Свідомо необов'язковий: поки бекенд не віддає ці дані, бейдж просто
     * не рендериться — краще нічого не показати, ніж показати неправду
     * (раніше тут був захардкоджений "Open & Accepting Orders").
     */
    isOpenNow?: boolean;
};

export function VenueHeader({ venue, isOpenNow }: VenueHeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center">
            {/* Cover — soft mesh gradient */}
            <div className="relative h-40 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/20 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(59,130,246,0.22),transparent_70%),radial-gradient(ellipse_60%_60%_at_80%_100%,rgba(139,92,246,0.20),transparent_70%)]" />
            </div>

            {/* Overlapping square logo — matches the squircle mark used on the main site */}
            <div className="relative -mt-12 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[22px] border-4 border-[#FAFAF9] bg-white/70 text-[#3B82F6] shadow-xl backdrop-blur-md dark:border-[#0A0A0C] dark:bg-white/10 dark:text-[#8B5CF6]">
                    {venue.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={venue.logoUrl}
                            alt={venue.name}
                            className="h-full w-full rounded-[18px] object-cover"
                        />
                    ) : (
                        <Store size={30} strokeWidth={1.6} />
                    )}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-center">
                    <Eyebrow tone="blue">Digital Menu</Eyebrow>
                </div>
                <h1
                    className={`${display.className} text-[40px] font-bold leading-[1.05] tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-[58px]`}>
                    {venue.name}
                </h1>

                {isOpenNow !== undefined && (
                    <span
                        className={
                            isOpenNow
                                ? 'mt-3 inline-flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#04916C] dark:text-[#10B981]'
                                : 'mt-3 inline-flex items-center gap-2 rounded-full border border-[#E7E5E0] bg-black/5 px-3 py-1 text-xs font-medium text-[#6B6A65] dark:border-[#232327] dark:bg-white/5 dark:text-[#94938D]'
                        }>
                        <span
                            className={`flex h-1.5 w-1.5 rounded-full ${isOpenNow ? 'bg-[#10B981]' : 'bg-[#9C9B95]'}`}
                        />
                        {isOpenNow ? 'Open & Accepting Orders' : 'Currently Closed'}
                    </span>
                )}

                {venue.description && (
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {venue.description}
                    </p>
                )}
            </div>
        </motion.header>
    );
}
