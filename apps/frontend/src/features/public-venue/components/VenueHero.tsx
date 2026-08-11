'use client';

import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import type { PublicMenuVenueResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

type VenueHeroProps = {
    venue: PublicMenuVenueResponse;
    tagline?: string;
};

export function VenueHero({ venue, tagline }: VenueHeroProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center">
            {/* Cover banner */}
            <div className="relative h-40 overflow-hidden rounded-[2rem] border border-black/5 bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/15 to-transparent dark:border-white/10 sm:h-48">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(59,130,246,0.20),transparent_70%),radial-gradient(ellipse_60%_60%_at_80%_100%,rgba(139,92,246,0.18),transparent_70%)]" />
            </div>

            {/* Overlapping circular avatar */}
            <div className="relative -mt-12 ml-6 flex justify-start">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#FAFAF9] bg-white/70 text-[#3B82F6] shadow-xl backdrop-blur-md dark:border-[#0A0A0C] dark:bg-white/10 dark:text-[#8B5CF6]">
                    {venue.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={venue.logoUrl} alt={venue.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <Store size={30} strokeWidth={1.6} />
                    )}
                </div>
            </div>

            <div className="mt-4 text-left">
                <h1
                    className={`${display.className} text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl`}>
                    {venue.name}
                </h1>
                {(tagline || venue.description) && (
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {tagline || venue.description}
                    </p>
                )}
            </div>
        </motion.section>
    );
}
