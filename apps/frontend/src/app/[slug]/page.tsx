'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CalendarDays, Star, UtensilsCrossed } from 'lucide-react';
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

// System / auth routes that must never be resolved as a tenant slug.
const RESERVED_SLUGS = new Set([
    'api',
    'auth',
    'login',
    'register',
    'onboarding',
    'forgot-password',
    'reset-password',
    'verify-email',
    'dashboard',
    't',
    'kds',
]);

export default function PublicVenuePage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    // Defensive guard: reserved paths (e.g. an auth flow) must not trigger
    // tenant data fetching. Passing an empty slug disables the queries.
    const safeSlug = RESERVED_SLUGS.has(resolvedSlug) ? '' : resolvedSlug;
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant, isLoading, isError } = useGetPublicTenant(safeSlug);

    // Активні правила Happy Hour для банера у шапці (підрахунок знижок у меню/кошику).
    const { activeRules: activeHappyHourRules } = usePublicHappyHour({ slug: safeSlug });

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

            {/* Використовуємо max-w-3xl: на мобільному буде на весь екран, 
                а на ПК збереться в акуратну, сфокусовану колонку по центру */}
            <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
                {isLoading ? (
                    <div className="mt-6 h-52 animate-pulse rounded-[2rem] bg-white/40 dark:bg-white/5" />
                ) : isError || !tenant ? (
                    <MenuNotFound slug={resolvedSlug} />
                ) : (
                    <div className="flex flex-col gap-6 md:gap-8 mt-6">
                        <Reveal>
                            <VenueHero venue={tenant} />
                        </Reveal>

                        {/* Блок з основними кнопками */}
                        <Reveal delay={0.1}>
                            <div className="flex flex-col gap-3">
                                {/* Головна дія (100% ширини). 
                                    Додано duration-150 ease-out для швидкої реакції CSS. */}
                                <MagneticButton
                                    href={`/${resolvedSlug}/menu`}
                                    showSparks
                                    className="w-full rounded-[1.25rem] bg-[#3B82F6] px-6 py-4 text-[16px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.5)] transition-all duration-150 ease-out hover:scale-[1.01] hover:bg-[#2563EB] hover:shadow-[0_12px_28px_-8px_rgba(59,130,246,0.6)] active:scale-[0.98]">
                                    <span
                                        className={`${body.className} flex w-full items-center justify-center gap-2.5`}>
                                        <UtensilsCrossed size={20} strokeWidth={2.5} />
                                        View Menu
                                    </span>
                                </MagneticButton>

                                {/* Другорядні дії (50% / 50% в одному ряду) */}
                                <div className="flex w-full gap-3">
                                    <Link
                                        href={`/${resolvedSlug}/book`}
                                        className={`${body.className} group flex w-1/2 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-black/5 bg-white/60 py-3.5 backdrop-blur-xl transition-all duration-150 ease-out hover:-translate-y-1 hover:border-[#3B82F6]/40 hover:bg-white/90 hover:shadow-lg dark:border-white/10 dark:bg-[#121215]/60 dark:hover:border-[#3B82F6]/40 dark:hover:bg-[#121215]/90 active:scale-95`}>
                                        <CalendarDays
                                            size={20}
                                            className="text-[#3B82F6] transition-transform duration-150 group-hover:scale-110 dark:text-[#60A5FA]"
                                        />
                                        <span className="text-[13.5px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            Book Table
                                        </span>
                                    </Link>

                                    <Link
                                        href={`/${resolvedSlug}/reviews`}
                                        className={`${body.className} group flex w-1/2 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-black/5 bg-white/60 py-3.5 backdrop-blur-xl transition-all duration-150 ease-out hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:bg-white/90 hover:shadow-lg dark:border-white/10 dark:bg-[#121215]/60 dark:hover:border-[#F59E0B]/40 dark:hover:bg-[#121215]/90 active:scale-95`}>
                                        <Star
                                            size={20}
                                            className="text-[#F59E0B] transition-transform duration-150 group-hover:scale-110 dark:text-[#FBBF24]"
                                        />
                                        <span className="text-[13.5px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            Reviews
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </Reveal>

                        {/* Інформаційна сітка */}
                        <Reveal delay={0.2}>
                            <VenueActionGrid slug={resolvedSlug} tenant={tenant} mapsUrl={mapsUrl} />
                        </Reveal>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-6 md:mt-10">
                            <VenueFooter />
                        </motion.div>
                    </div>
                )}
            </div>
        </main>
    );
}
