'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Users, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

import { useGetPublicMenu } from '@/entities/menu/hooks/useGetPublicMenu';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { EASE } from '@/shared/config/animations';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import {
    VenueActionGrid,
    VenueFooter,
    VenueHero,
    VenueInfoSection,
} from '@/features/public-venue/components';
import { fadeUpItem } from '@/features/public-venue/components/ActionCard';

/*
 * Address / phone / hours / Wi-Fi / socials are not yet exposed by the public
 * venue API — these are placeholders to be wired to real data later.
 */
const VENUE_PLACEHOLDERS = {
    tagline: 'Artisan Coffee & Specialty Bakery',
    wifiSsid: 'CafeBoard-Guest',
    wifiPassword: 'welcome123',
    address: '123 Market Street, Downtown',
    phone: '+1 (555) 012-3456',
    instagramUrl: 'https://instagram.com/cafeboard',
    hours: 'Mon–Sun · 08:00 – 22:00',
    statusLabel: 'Open Now • 08:00 - 22:00',
};

function StatusBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3 py-1.5 text-xs font-medium text-[#04916C] dark:text-[#10B981]">
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            {label}
        </span>
    );
}

function PrimaryButton({
    href,
    icon,
    children,
    variant = 'primary',
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}) {
    const base =
        'flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-[15px] font-semibold transition-all hover:-translate-y-0.5';
    const styles =
        variant === 'primary'
            ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95'
            : 'border border-black/10 bg-white/60 text-[#0A0A0C] hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:border-[#3B82F6]/40';

    return (
        <Link href={href} className={`${base} ${styles}`}>
            {icon}
            {children}
        </Link>
    );
}

export default function PublicVenuePage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { theme, toggle, mounted } = useTheme();
    const { data, isLoading } = useGetPublicMenu(resolvedSlug);

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        VENUE_PLACEHOLDERS.address,
    )}`;

    return (
        <main className="relative min-h-screen bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader
                centerContent={
                    data?.venue.name ? (
                        <span className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {data.venue.name}
                        </span>
                    ) : null
                }>
                <StatusBadge label={VENUE_PLACEHOLDERS.statusLabel} />
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </BaseHeader>

            <div className="mx-auto max-w-3xl px-4 pb-20">
                {isLoading ? (
                    <div className="mt-6 h-48 animate-pulse rounded-[2rem] bg-white/40 dark:bg-white/5" />
                ) : !data ? (
                    <MenuNotFound slug={resolvedSlug} />
                ) : (
                    <>
                        <motion.div variants={fadeUpItem} initial="hidden" animate="show">
                            <VenueHero venue={data.venue} tagline={VENUE_PLACEHOLDERS.tagline} />
                        </motion.div>

                        {/* Primary hero actions */}
                        <motion.div
                            variants={fadeUpItem}
                            initial="hidden"
                            animate="show"
                            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <PrimaryButton
                                href={`/${resolvedSlug}/menu`}
                                variant="primary"
                                icon={<UtensilsCrossed size={18} strokeWidth={2} />}>
                                Explore Digital Menu
                            </PrimaryButton>
                            <PrimaryButton
                                href={`/${resolvedSlug}/reserve`}
                                variant="secondary"
                                icon={
                                    <span className="flex items-center gap-1">
                                        <Calendar size={18} strokeWidth={2} />
                                        <Users size={18} strokeWidth={2} />
                                    </span>
                                }>
                                Book a Table
                            </PrimaryButton>
                        </motion.div>

                        {/* Secondary action grid */}
                        <div className="mt-8">
                            <VenueActionGrid
                                slug={resolvedSlug}
                                wifiSsid={VENUE_PLACEHOLDERS.wifiSsid}
                                wifiPassword={VENUE_PLACEHOLDERS.wifiPassword}
                                address={VENUE_PLACEHOLDERS.address}
                                mapsUrl={mapsUrl}
                                instagramUrl={VENUE_PLACEHOLDERS.instagramUrl}
                            />
                        </div>

                        {/* Venue info & hours */}
                        <motion.div variants={fadeUpItem} initial="hidden" animate="show" className="mt-8">
                            <VenueInfoSection
                                hours={VENUE_PLACEHOLDERS.hours}
                                phone={VENUE_PLACEHOLDERS.phone}
                                address={VENUE_PLACEHOLDERS.address}
                            />
                        </motion.div>

                        <VenueFooter />
                    </>
                )}
            </div>
        </main>
    );
}
