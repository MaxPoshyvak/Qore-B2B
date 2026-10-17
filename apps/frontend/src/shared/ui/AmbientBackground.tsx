'use client';

import { useParams } from 'next/navigation';
import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import type { ThemeAtmosphere, ThemeConfig } from '@my-app/types';
import { DEFAULT_THEME_CONFIG } from '@my-app/types';

type AmbientBackgroundProps = {
    theme?: ThemeConfig | null;
    atmosphere?: ThemeAtmosphere;
};

export function AmbientBackground({
    theme: propTheme,
    atmosphere: propAtmosphere,
}: AmbientBackgroundProps = {}) {
    const params = useParams<{ slug?: string }>();
    const slug = params?.slug ?? '';
    const { data: tenant } = useGetPublicTenant(slug);
    const activeTheme =
        propTheme ??
        (tenant?.activeTheme?.themeConfig as ThemeConfig | undefined) ??
        DEFAULT_THEME_CONFIG;
    const atmosphere: ThemeAtmosphere =
        propAtmosphere ?? activeTheme.atmosphere ?? 'minimal-grid';

    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--theme-bg)] transition-colors duration-500">
            {/* ATMOSPHERE 1: Minimal Grid (Qore Classic) */}
            {atmosphere === 'minimal-grid' && (
                <>
                    {/* Top Sapphire Glow */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse 70% 45% at 50% 0%, color-mix(in srgb, var(--theme-primary) 14%, transparent), transparent 75%)',
                        }}
                    />
                    {/* Precision 24px Dot Matrix */}
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-40 dark:opacity-30"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at center, color-mix(in srgb, var(--theme-primary) 22%, transparent) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                </>
            )}

            {/* ATMOSPHERE 2: Warm Grain (Tuscan Osteria) */}
            {atmosphere === 'warm-grain' && (
                <>
                    {/* Warm Italian Terracotta Vignette */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse 80% 60% at 50% 5%, color-mix(in srgb, var(--theme-primary) 18%, transparent), transparent 75%), radial-gradient(ellipse 60% 50% at 90% 90%, color-mix(in srgb, var(--theme-accent) 12%, transparent), transparent 70%)',
                        }}
                    />
                    {/* Warm paper linen texture */}
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                    {/* Soft warm edge shade */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 60%, color-mix(in srgb, var(--theme-primary) 6%, transparent) 100%)',
                        }}
                    />
                </>
            )}

            {/* ATMOSPHERE 3: Noir Gold (Monarch Luxury) */}
            {atmosphere === 'noir-gold' && (
                <>
                    {/* Top Dramatic Cinema Gold Spotlight */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--theme-primary) 24%, transparent) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 50% 100%, color-mix(in srgb, var(--theme-accent) 10%, transparent) 0%, transparent 70%)',
                        }}
                    />
                    {/* Subtle Obsidian luxury diamond weave */}
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-20 dark:opacity-15"
                        style={{
                            backgroundImage:
                                'linear-gradient(45deg, color-mix(in srgb, var(--theme-primary) 15%, transparent) 1px, transparent 1px), linear-gradient(-45deg, color-mix(in srgb, var(--theme-primary) 15%, transparent) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    {/* Vignette depth */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(circle at 50% 30%, transparent 40%, rgba(0,0,0,0.5) 100%)',
                        }}
                    />
                </>
            )}

            {/* ATMOSPHERE 4: Cyber Glow (Tokyo Cyber) */}
            {atmosphere === 'cyber-glow' && (
                <>
                    {/* Dual Neon Beams: Electric Cyan + Neon Pink/Magenta */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse 65% 55% at 15% 15%, color-mix(in srgb, var(--theme-primary) 28%, transparent), transparent 70%), radial-gradient(ellipse 55% 55% at 85% 85%, color-mix(in srgb, var(--theme-accent) 22%, transparent), transparent 70%)',
                        }}
                    />
                    {/* High-tech Cyber Grid Lines */}
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-40 dark:opacity-25"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, color-mix(in srgb, var(--theme-primary) 18%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 18%, transparent) 1px, transparent 1px)',
                            backgroundSize: '36px 36px',
                        }}
                    />
                    {/* Scanline overlay */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-10"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
                            backgroundSize: '100% 4px',
                        }}
                    />
                </>
            )}

            {/* ATMOSPHERE 5: Organic Soft (Botanical Garden) */}
            {atmosphere === 'organic-soft' && (
                <>
                    {/* Organic natural flowing light blobs (Sage & Warm Matcha) */}
                    <div
                        className="absolute -top-20 -left-20 h-72 w-72 rounded-full blur-xl opacity-30 md:h-96 md:w-96 md:blur-3xl md:opacity-40"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                    />
                    <div
                        className="absolute top-1/2 -right-20 h-72 w-72 rounded-full blur-xl opacity-20 md:h-96 md:w-96 md:blur-3xl md:opacity-30"
                        style={{
                            backgroundColor:
                                'color-mix(in srgb, var(--theme-primary) 60%, var(--theme-accent))',
                        }}
                    />
                    {/* Natural subtle paper grain */}
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                </>
            )}

            {/* Soft global transition overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 40%, var(--theme-bg) 100%)',
                }}
            />
        </div>
    );
}
