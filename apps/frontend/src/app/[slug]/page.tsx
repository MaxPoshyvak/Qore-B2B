'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, CalendarDays, Star, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { MagneticButton } from '@/shared/ui/MagneticButton';
import { Reveal } from '@/shared/ui/Reveal';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { body } from '@/shared/lib/fonts';
import { useTheme } from '@/shared/hooks/useTheme';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import { usePublicHappyHour } from '@/features/public-menu/hooks/usePublicHappyHour';
import { VenueActionGrid, VenueFooter, VenueHero } from '@/features/public-venue/components';

export default function PublicVenuePage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant, isLoading, isError } = useGetPublicTenant(resolvedSlug);

    // Активні правила Happy Hour для банера у шапці (підрахунок знижок у меню/кошику).
    const { activeRules: activeHappyHourRules } = usePublicHappyHour({ slug: resolvedSlug });

    const mapsUrl =
        tenant?.settings?.googleMapsUrl ??
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant?.settings?.address ?? resolvedSlug)}`;

    return (
        <main className="relative min-h-screen bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader
                activeRules={activeHappyHourRules}
                centerContent={
                    tenant?.name ? (
                        <span className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">{tenant.name}</span>
                    ) : null
                }>
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </BaseHeader>

            <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
                {isLoading ? (
                    <div className="mt-6 h-52 animate-pulse rounded-[2rem] bg-white/40 dark:bg-white/5" />
                ) : isError || !tenant ? (
                    <MenuNotFound slug={resolvedSlug} />
                ) : (
                    <>
                        <Reveal>
                            <VenueHero venue={tenant} />
                        </Reveal>

                        {/* Primary hook + secondary action */}
                        <Reveal delay={0.1}>
                            <div className="mt-6 flex flex-col gap-3">
                                <MagneticButton
                                    href={`/${resolvedSlug}/menu`}
                                    showSparks
                                    className="w-full rounded-full bg-[#0A0A0C] px-6 py-4 text-[15px] font-medium text-white shadow-lg shadow-[#0A0A0C]/15 transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:shadow-white/10 dark:hover:bg-white">
                                    <span className={`${body.className} flex w-full items-center justify-center gap-2`}>
                                        <UtensilsCrossed size={18} strokeWidth={2} />
                                        View Menu
                                        <ArrowRight size={18} strokeWidth={2} />
                                    </span>
                                </MagneticButton>

                                <Link
                                    href={`/${resolvedSlug}/book`}
                                    className={`${body.className} flex w-full items-center justify-center gap-2 rounded-full border border-[#E7E5E0] px-6 py-4 text-[15px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]`}>
                                    <CalendarDays size={18} strokeWidth={2} />
                                    Book a Table
                                </Link>

                                <Link
                                    href={`/${resolvedSlug}/reviews`}
                                    className={`${body.className} flex w-full items-center justify-center gap-2 rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/5 px-6 py-4 text-[15px] font-medium text-[#0A0A0C] transition-colors hover:border-[#FBBF24]/70 dark:border-[#FBBF24]/30 dark:text-[#F5F4F2]`}>
                                    <Star size={18} strokeWidth={2} />
                                    View Reviews
                                </Link>
                            </div>
                        </Reveal>

                        {/* Interactive info cards */}
                        <div className="mt-8">
                            <VenueActionGrid slug={resolvedSlug} tenant={tenant} mapsUrl={mapsUrl} />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-10">
                            <VenueFooter />
                        </motion.div>
                    </>
                )}
            </div>
        </main>
    );
}
