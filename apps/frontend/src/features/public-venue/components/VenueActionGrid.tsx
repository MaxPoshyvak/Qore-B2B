'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Clock, Copy, MapPin, Wifi } from 'lucide-react';
import type { PublicTenantResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { body, mono } from '@/shared/lib/fonts';
import { GlowCard } from '@/shared/ui/GlowCard';
import { TiltCard } from '@/shared/ui/TiltCard';

import { useCopyToClipboard } from '../lib/useCopyToClipboard';
import { parseWorkingHours } from '../lib/venue-hours';
import { fadeUpItem } from './ActionCard';

function CardIcon({ icon: Icon, glow = '59,130,246' }: { icon: React.ReactNode; glow?: string }) {
    return (
        <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#3B82F6] dark:text-[#8B5CF6]"
            style={{ background: `rgba(${glow},0.10)` }}>
            {Icon}
        </span>
    );
}

function InstagramGlyph() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
        </svg>
    );
}

type VenueActionGridProps = {
    slug: string;
    tenant: PublicTenantResponse;
    mapsUrl: string;
};

export function VenueActionGrid({ slug, tenant, mapsUrl }: VenueActionGridProps) {
    const { copied, copy } = useCopyToClipboard();
    const { settings } = tenant;

    const instagramUrl = settings?.instagramUrl ?? null;

    const schedule = parseWorkingHours(settings?.workingHours);
    const today = schedule
        ? Object.values(schedule).find((d) => d.isToday)
        : null;

    const cards: React.ReactNode[] = [];

    // Guest Wi-Fi
    cards.push(
        <motion.div key="wifi" variants={fadeUpItem}>
            <TiltCard strength={6}>
                <GlowCard variant="glass" className="h-full p-5">
                    <div className="flex items-start gap-4">
                        <CardIcon icon={<Wifi size={20} strokeWidth={1.9} />} />
                        <div className="min-w-0 flex-1">
                            <h3 className={`${body.className} text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                Guest Wi-Fi
                            </h3>
                            <p className="mt-0.5 truncate text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                {settings?.wifiSsid ?? 'Available on request'}
                            </p>
                        </div>
                    </div>
                    {settings?.wifiSsid && (
                        <button
                            type="button"
                            onClick={() => copy(settings.wifiPassword ?? '')}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-4 py-3 text-[13px] font-medium text-[#2563EB] transition-all hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                            {copied ? <Check size={15} /> : <Copy size={15} />}
                            {copied ? 'Password copied!' : 'Copy Password'}
                        </button>
                    )}
                </GlowCard>
            </TiltCard>
        </motion.div>,
    );

    // Location & Contacts
    cards.push(
        <motion.div key="location" variants={fadeUpItem}>
            <TiltCard strength={6}>
                <GlowCard variant="glass" className="h-full p-5">
                    <div className="flex items-start gap-4">
                        <CardIcon icon={<MapPin size={20} strokeWidth={1.9} />} glow="139,92,246" />
                        <div className="min-w-0 flex-1">
                            <h3 className={`${body.className} text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                Location & Contacts
                            </h3>
                            <p className="mt-0.5 truncate text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                {settings?.address ?? 'Address not set'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2.5">
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-4 py-3 text-[13px] font-medium text-[#2563EB] transition-all hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                            <MapPin size={15} />
                            Get Directions
                        </a>
                        {instagramUrl && (
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-[13px] font-medium text-[#0A0A0C] transition-all hover:-translate-y-0.5 hover:border-[#8B5CF6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]">
                                <InstagramGlyph />
                                Instagram
                            </a>
                        )}
                    </div>
                </GlowCard>
            </TiltCard>
        </motion.div>,
    );

    // Working Hours accordion
    cards.push(
        <motion.div key="hours" variants={fadeUpItem} className="col-span-full">
            <TiltCard strength={5}>
                <GlowCard variant="glass" className="h-full p-5">
                    <WorkingHoursCard schedule={schedule} todayLabel={today?.label ?? null} />
                </GlowCard>
            </TiltCard>
        </motion.div>,
    );

    return (
        <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards}
        </motion.div>
    );
}

function WorkingHoursCard({
    schedule,
    todayLabel,
}: {
    schedule: ReturnType<typeof parseWorkingHours>;
    todayLabel: string | null;
}) {
    const [open, setOpen] = useState(false);

    if (!schedule) {
        return (
            <div className="flex items-start gap-4">
                <CardIcon icon={<Clock size={20} strokeWidth={1.9} />} glow="16,185,129" />
                <div>
                    <h3 className={`${body.className} text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Working Hours
                    </h3>
                    <p className="mt-0.5 text-[13px] text-[#6B6A65] dark:text-[#94938D]">Not set</p>
                </div>
            </div>
        );
    }

    const days = Object.values(schedule);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 text-left">
                <div className="flex items-start gap-4">
                    <CardIcon icon={<Clock size={20} strokeWidth={1.9} />} glow="16,185,129" />
                    <div>
                        <h3 className={`${body.className} text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Working Hours
                        </h3>
                        <p className="mt-0.5 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                            {todayLabel ? `Today: ${formatToday(schedule)}` : 'Tap to view schedule'}
                        </p>
                    </div>
                </div>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
                    <ChevronDown size={18} className="text-[#6B6A65] dark:text-[#94938D]" />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden">
                        <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/10">
                            {days.map((day) => (
                                <li
                                    key={day.key}
                                    className="flex items-center justify-between py-1.5">
                                    <span
                                        className={`${body.className} text-[13px] ${
                                            day.isToday
                                                ? 'font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]'
                                                : 'text-[#6B6A65] dark:text-[#94938D]'
                                        }`}>
                                        {day.label}
                                    </span>
                                    <span
                                        className={`${mono.className} text-[12px] tabular-nums ${
                                            day.isOpen
                                                ? 'text-[#04916C] dark:text-[#10B981]'
                                                : 'text-[#A8A6A0]'
                                        }`}>
                                        {day.isOpen && day.openTime && day.closeTime
                                            ? `${day.openTime} – ${day.closeTime}`
                                            : 'Closed'}
                                    </span>
                                </li>
                            ))}
                        </div>
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

function formatToday(schedule: NonNullable<ReturnType<typeof parseWorkingHours>>): string {
    const today = Object.values(schedule).find((d) => d.isToday);
    if (!today) return 'Closed';
    return today.isOpen && today.openTime && today.closeTime
        ? `${today.openTime} – ${today.closeTime}`
        : 'Closed';
}
