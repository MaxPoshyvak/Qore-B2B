'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CalendarDays, Star, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { useCartStore } from '@/features/public-menu/store/useCartStore';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { cn } from '@/shared/lib/utils';
import { MagneticButton } from '@/shared/ui/MagneticButton';
import { Reveal } from '@/shared/ui/Reveal';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { body } from '@/shared/lib/fonts';
import { isReservedSlug, DEFAULT_THEME_CONFIG, type ThemeConfig } from '@my-app/types';
import { useTheme } from '@/shared/hooks/useTheme';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import { usePublicHappyHour } from '@/features/public-menu/hooks/usePublicHappyHour';
import { VenueActionGrid, VenueFooter, VenueHero } from '@/features/public-venue/components';

export default function PublicVenuePage() {
    const tVenue = useTranslations('venue');
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    // Defensive guard: reserved paths (e.g. an auth flow) must not trigger
    // tenant data fetching. Passing an empty slug disables the queries.
    const safeSlug = isReservedSlug(resolvedSlug) ? '' : resolvedSlug;
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant, isLoading, isError } = useGetPublicTenant(safeSlug);
    const setCurrency = useCartStore((s) => s.setCurrency);

    useEffect(() => {
        if (tenant?.settings?.currency) {
            setCurrency(tenant.settings.currency);
        }
    }, [tenant?.settings?.currency, setCurrency]);

    // Активні правила Happy Hour для банера у шапці (підрахунок знижок у меню/кошику).
    const { activeRules: activeHappyHourRules } = usePublicHappyHour({ slug: safeSlug });

    const mapsUrl =
        tenant?.settings?.googleMapsUrl ??
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant?.settings?.address ?? resolvedSlug)}`;

    return (
        <main className="relative min-h-screen overflow-x-clip bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader
                activeRules={activeHappyHourRules}
                centerContent={
                    tenant?.name ? (
                        <span className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">{tenant.name}</span>
                    ) : null
                }>
                <LanguageSwitcher />
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
                            {(() => {
                                const activeTheme: ThemeConfig =
                                    (tenant?.activeTheme?.themeConfig as ThemeConfig | undefined) ??
                                    DEFAULT_THEME_CONFIG;
                                const buttonVariant = activeTheme.buttonVariant ?? 'solid-rounded';

                                return (
                                    <div className="flex flex-col gap-3">
                                        {/* Головна дія (100% ширини) */}
                                        <MagneticButton
                                            href={`/${resolvedSlug}/menu`}
                                            showSparks={buttonVariant === 'gilded'}
                                            style={{
                                                borderRadius:
                                                    buttonVariant === 'organic-pill'
                                                        ? '9999px'
                                                        : 'var(--theme-radius)',
                                                backgroundColor:
                                                    buttonVariant === 'gilded'
                                                        ? '#121215'
                                                        : buttonVariant === 'warm-terracotta'
                                                          ? '#C2410C'
                                                          : 'var(--theme-primary)',
                                                color:
                                                    buttonVariant === 'gilded'
                                                        ? '#F5E6B3'
                                                        : 'var(--theme-primary-text)',
                                                boxShadow:
                                                    buttonVariant === 'gilded'
                                                        ? '0 12px 28px -6px rgba(212, 175, 55, 0.3), inset 0 0 0 1px rgba(212, 175, 55, 0.5)'
                                                        : buttonVariant === 'neon-glow'
                                                          ? '0 0 28px rgba(6, 182, 212, 0.55), inset 0 0 0 1px rgba(34, 211, 238, 0.7)'
                                                          : buttonVariant === 'warm-terracotta'
                                                            ? '0 10px 24px -6px rgba(194, 65, 12, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                                                            : buttonVariant === 'organic-pill'
                                                              ? '0 10px 25px -6px rgba(21, 128, 61, 0.35)'
                                                              : '0 10px 24px -6px rgba(59, 130, 246, 0.35)',
                                            }}
                                            className={cn(
                                                'w-full px-6 py-4 shadow-lg transition-all duration-150 ease-out hover:scale-[1.01] active:scale-[0.98]',
                                                buttonVariant === 'gilded' &&
                                                    'tracking-wider uppercase text-[15px] font-bold border border-amber-400/40',
                                                buttonVariant === 'neon-glow' &&
                                                    'font-mono tracking-wider uppercase text-[15px] font-bold',
                                                buttonVariant === 'warm-terracotta' &&
                                                    'font-serif italic text-[17px] font-bold',
                                                buttonVariant === 'organic-pill' &&
                                                    'rounded-full text-[16px] font-semibold',
                                                buttonVariant === 'solid-rounded' &&
                                                    'text-[16px] font-semibold',
                                            )}>
                                            <span className="font-theme-body flex w-full items-center justify-center gap-2.5">
                                                <UtensilsCrossed size={20} strokeWidth={2.5} />
                                                {buttonVariant === 'neon-glow'
                                                    ? `// ${tVenue('viewMenu')}`
                                                    : tVenue('viewMenu')}
                                            </span>
                                        </MagneticButton>

                                        {/* Другорядні дії (50% / 50% в одному ряду) */}
                                        <div className="flex w-full gap-3">
                                            <Link
                                                href={`/${resolvedSlug}/book`}
                                                style={{
                                                    borderRadius:
                                                        buttonVariant === 'organic-pill'
                                                            ? '9999px'
                                                            : 'var(--theme-radius)',
                                                    backgroundColor:
                                                        buttonVariant === 'gilded'
                                                            ? 'rgba(18, 18, 21, 0.9)'
                                                            : buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 16, 30, 0.85)'
                                                              : 'var(--theme-surface)',
                                                    borderColor:
                                                        buttonVariant === 'gilded'
                                                            ? 'rgba(212, 175, 55, 0.35)'
                                                            : buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 182, 212, 0.4)'
                                                              : 'var(--theme-surface-border)',
                                                }}
                                                className={cn(
                                                    'font-theme-body group flex w-1/2 flex-col items-center justify-center gap-2 border py-3.5 backdrop-blur-xl transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95',
                                                    buttonVariant === 'gilded' &&
                                                        'text-amber-200 hover:border-amber-400 hover:shadow-amber-500/15',
                                                    buttonVariant === 'neon-glow' &&
                                                        'text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
                                                )}>
                                                <CalendarDays
                                                    size={20}
                                                    style={{ color: 'var(--theme-primary)' }}
                                                    className="transition-transform duration-150 group-hover:scale-110"
                                                />
                                                <span className="text-[13.5px] font-medium text-[var(--theme-text-primary)]">
                                                    {tVenue('bookTable')}
                                                </span>
                                            </Link>

                                            <Link
                                                href={`/${resolvedSlug}/reviews`}
                                                style={{
                                                    borderRadius:
                                                        buttonVariant === 'organic-pill'
                                                            ? '9999px'
                                                            : 'var(--theme-radius)',
                                                    backgroundColor:
                                                        buttonVariant === 'gilded'
                                                            ? 'rgba(18, 18, 21, 0.9)'
                                                            : buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 16, 30, 0.85)'
                                                              : 'var(--theme-surface)',
                                                    borderColor:
                                                        buttonVariant === 'gilded'
                                                            ? 'rgba(212, 175, 55, 0.35)'
                                                            : buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 182, 212, 0.4)'
                                                              : 'var(--theme-surface-border)',
                                                }}
                                                className={cn(
                                                    'font-theme-body group flex w-1/2 flex-col items-center justify-center gap-2 border py-3.5 backdrop-blur-xl transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95',
                                                    buttonVariant === 'gilded' &&
                                                        'text-amber-200 hover:border-amber-400 hover:shadow-amber-500/15',
                                                    buttonVariant === 'neon-glow' &&
                                                        'text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
                                                )}>
                                                <Star
                                                    size={20}
                                                    style={{ color: 'var(--theme-accent)' }}
                                                    className="transition-transform duration-150 group-hover:scale-110"
                                                />
                                                <span className="text-[13.5px] font-medium text-[var(--theme-text-primary)]">
                                                    {tVenue('reviews')}
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })()}
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
