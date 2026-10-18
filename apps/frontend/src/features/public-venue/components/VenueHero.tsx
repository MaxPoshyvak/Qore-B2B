'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { PublicTenantResponse, ThemeConfig } from '@my-app/types';
import { DEFAULT_THEME_CONFIG } from '@my-app/types';
import { sanitizeImageUrl } from '@/shared/lib/utils';

import { LiveStatusBadge } from './LiveStatusBadge';

type VenueHeroProps = {
    venue: PublicTenantResponse;
};

export function VenueHero({ venue }: VenueHeroProps) {
    const t = useTranslations('venue');
    const initial = venue.name.trim().charAt(0).toUpperCase() || '?';
    const description = venue.settings?.description || t('welcomeTo', { name: venue.name });
    const coverUrl = sanitizeImageUrl(venue.settings?.coverUrl);
    const logoUrl = sanitizeImageUrl(venue.settings?.logoUrl);
    const hasLogo = Boolean(logoUrl);
    const hasCover = Boolean(coverUrl);

    const activeTheme =
        (venue.activeTheme?.themeConfig as ThemeConfig | undefined) ?? DEFAULT_THEME_CONFIG;
    const atmosphere = activeTheme.atmosphere ?? 'minimal-grid';
    const badgeVariant = activeTheme.badgeVariant ?? 'minimal';
    const brandStamp = activeTheme.brandStamp;

    return (
        <section className="text-left">
            {/* Cover banner */}
            <div
                style={{ borderRadius: 'var(--theme-radius)' }}
                className="relative h-36 overflow-hidden border border-black/5 shadow-md dark:border-white/10 sm:h-44">
                {hasCover && coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={`${venue.name} cover`}
                        fill
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
                        className="object-cover"
                    />
                ) : (
                    <div
                        style={{
                            background:
                                'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 35%, transparent), color-mix(in srgb, var(--theme-primary) 10%, transparent))',
                        }}
                        className="h-full w-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,rgba(255,255,255,0.15),transparent_70%)]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>

            {/* Overlapping theme-styled logo */}
            <div className="relative -mt-10 ml-4 flex items-end justify-between pr-4 sm:-mt-12 sm:ml-5">
                <div
                    style={{
                        borderRadius:
                            badgeVariant === 'organic-leaf'
                                ? '28px'
                                : 'var(--theme-radius)',
                        backgroundColor: 'var(--theme-surface)',
                        borderColor:
                            badgeVariant === 'luxury-crest'
                                ? '#D4AF37'
                                : badgeVariant === 'cyber-tag'
                                  ? '#06B6D4'
                                  : 'var(--theme-surface-border)',
                        boxShadow:
                            badgeVariant === 'luxury-crest'
                                ? '0 10px 25px -4px rgba(212, 175, 55, 0.35)'
                                : badgeVariant === 'cyber-tag'
                                  ? '0 0 22px rgba(6, 182, 212, 0.45)'
                                  : undefined,
                    }}
                    className="relative flex h-20 w-20 items-center justify-center overflow-hidden border-2 shadow-xl backdrop-blur-xl sm:h-24 sm:w-24">
                    {hasLogo && logoUrl ? (
                        <Image
                            src={logoUrl}
                            alt={venue.name}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover"
                        />
                    ) : (
                        <span className="font-theme-heading text-3xl font-bold text-[var(--theme-text-primary)] drop-shadow-sm sm:text-4xl">
                            {initial}
                        </span>
                    )}
                </div>

                {/* Theme-specific Brand Badge */}
                <div className="mb-2 hidden sm:block">
                    {badgeVariant === 'luxury-crest' && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 px-3 py-1 shadow-xs shadow-amber-500/10 backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="font-theme-heading text-[10px] font-bold tracking-[0.22em] uppercase text-amber-700 dark:text-amber-300">
                                {brandStamp ?? 'HAUTE CUISINE • PRIVATE SELECTION'}
                            </span>
                        </div>
                    )}
                    {badgeVariant === 'cyber-tag' && (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span>{brandStamp ?? 'STREET KITCHEN // SYS:ONLINE'}</span>
                        </div>
                    )}
                    {badgeVariant === 'editorial-flourish' && (
                        <span className="font-theme-heading text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--theme-primary)]">
                            ✦ {brandStamp ?? 'CUCINA TRADIZIONALE • DAL 1984'} ✦
                        </span>
                    )}
                    {badgeVariant === 'organic-leaf' && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            <span>🌿</span>
                            <span className="font-theme-body font-semibold tracking-wide">
                                {brandStamp ?? '100% ARTISAN & FARM FRESH'}
                            </span>
                        </div>
                    )}
                    {badgeVariant === 'minimal' && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            <span>●</span>
                            <span className="font-theme-heading">
                                {brandStamp ?? 'CONTEMPORARY DINING & COCKTAILS'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 px-1">
                {/* Mobile Theme Badge */}
                <div className="mb-2 block sm:hidden">
                    {badgeVariant === 'luxury-crest' && (
                        <span className="font-theme-heading text-[9.5px] font-bold tracking-[0.2em] uppercase text-amber-700 dark:text-amber-300">
                            ★ {brandStamp ?? 'HAUTE CUISINE • PRIVATE SELECTION'} ★
                        </span>
                    )}
                    {badgeVariant === 'cyber-tag' && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
                            [ {brandStamp ?? 'SYS:ONLINE // STREET KITCHEN'} ]
                        </span>
                    )}
                    {badgeVariant === 'editorial-flourish' && (
                        <span className="font-theme-heading text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--theme-primary)]">
                            ✦ {brandStamp ?? 'CUCINA TRADIZIONALE • DAL 1984'} ✦
                        </span>
                    )}
                    {badgeVariant === 'organic-leaf' && (
                        <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300">
                            🌿 {brandStamp ?? '100% ARTISAN & FARM FRESH'}
                        </span>
                    )}
                    {badgeVariant === 'minimal' && (
                        <span className="font-theme-heading text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            ● {brandStamp ?? 'CONTEMPORARY DINING & COCKTAILS'}
                        </span>
                    )}
                </div>

                <h1 className="font-theme-heading text-3xl font-bold tracking-tight text-[var(--theme-text-primary)] sm:text-4xl">
                    {venue.name}
                </h1>
                <p className="font-theme-body mt-2 max-w-xl text-[14.5px] leading-relaxed text-[var(--theme-text-secondary)]">
                    {description}
                </p>

                {/* Editorial Italian flourish divider line */}
                {atmosphere === 'warm-grain' && (
                    <div className="my-3 flex max-w-md items-center gap-2 text-[var(--theme-primary)] opacity-60">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--theme-primary)]/40" />
                        <span className="font-serif text-[11px]">✦ ━━━━━ ✦</span>
                        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--theme-primary)]/40" />
                    </div>
                )}

                <div className="mt-4">
                    <LiveStatusBadge workingHours={venue.settings?.workingHours} />
                </div>
            </div>
        </section>
    );
}
