'use client';

import Image from 'next/image';
import type { PublicMenuVenueResponse, ThemeConfig } from '@my-app/types';
import { DEFAULT_THEME_CONFIG } from '@my-app/types';
import { sanitizeImageUrl } from '@/shared/lib/utils';

import { LiveStatusBadge } from './LiveStatusBadge';

type VenueHeaderProps = {
    venue: PublicMenuVenueResponse;
};

export function VenueHeader({ venue }: VenueHeaderProps) {
    const workingHours = venue.workingHours;
    const coverUrl = sanitizeImageUrl(venue.coverUrl);
    const hasCover = Boolean(coverUrl);

    const activeTheme: ThemeConfig =
        (venue as any).activeTheme?.themeConfig ?? DEFAULT_THEME_CONFIG;
    const badgeVariant = activeTheme.badgeVariant ?? 'minimal';
    const brandStamp = activeTheme.brandStamp;

    return (
        <header className="mt-2.5 text-left sm:mt-6">
            {/* Cinematic cover banner with compact modern aspect ratio */}
            <div
                style={{ borderRadius: 'var(--theme-radius)' }}
                className="relative h-28 overflow-hidden border border-black/5 shadow-xs dark:border-white/10 sm:h-44">
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

            {/* Profile info: Glass avatar + Title & Status */}
            <div className="relative -mt-8 px-2 sm:-mt-12 sm:px-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-3 min-w-0 sm:gap-4">
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
                                        ? '0 8px 20px -4px rgba(212, 175, 55, 0.35)'
                                        : badgeVariant === 'cyber-tag'
                                          ? '0 0 16px rgba(6, 182, 212, 0.45)'
                                          : undefined,
                            }}
                            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border-2 shadow-lg backdrop-blur-xl sm:h-24 sm:w-24">
                            {venue.logoUrl ? (
                                <Image
                                    src={venue.logoUrl}
                                    alt={venue.name}
                                    fill
                                    sizes="(max-width: 640px) 64px, 96px"
                                    className="object-cover"
                                />
                            ) : (
                                <span className="font-theme-heading text-2xl font-bold text-[var(--theme-text-primary)] drop-shadow-sm sm:text-4xl">
                                    {venue.name.trim().charAt(0).toUpperCase() || '?'}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 pb-0.5">
                            {brandStamp && (
                                <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wider text-[var(--theme-primary)] sm:text-[10.5px]">
                                    {badgeVariant === 'luxury-crest' && '★ '}
                                    {badgeVariant === 'editorial-flourish' && '✦ '}
                                    {badgeVariant === 'cyber-tag' && '[ '}
                                    {badgeVariant === 'organic-leaf' && '🌿 '}
                                    {badgeVariant === 'minimal' && '● '}
                                    {brandStamp}
                                    {badgeVariant === 'cyber-tag' && ' ]'}
                                    {badgeVariant === 'editorial-flourish' && ' ✦'}
                                    {badgeVariant === 'luxury-crest' && ' ★'}
                                </div>
                            )}
                            <h1 className="font-theme-heading truncate text-xl font-bold tracking-tight text-[var(--theme-text-primary)] sm:text-3xl">
                                {venue.name}
                            </h1>
                            {venue.description && (
                                <p className="font-theme-body mt-0.5 line-clamp-1 max-w-lg text-xs text-[var(--theme-text-secondary)] sm:text-[13.5px]">
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
        </header>
    );
}
