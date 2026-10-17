'use client';

import { useMemo } from 'react';
import type { ThemeConfig, ThemeFontBody, ThemeFontHeading, ThemeRadius } from '@my-app/types';
import { DEFAULT_THEME_CONFIG } from '@my-app/types';
import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';

export function getFontFamily(font: ThemeFontHeading | ThemeFontBody): string {
    switch (font) {
        case 'space-grotesk':
            return 'var(--font-space-grotesk), sans-serif';
        case 'playfair':
            return 'var(--font-playfair), serif';
        case 'lora':
            return 'var(--font-lora), serif';
        case 'plus-jakarta':
            return 'var(--font-plus-jakarta), sans-serif';
        case 'syne':
            return 'var(--font-syne), sans-serif';
        case 'inter':
        default:
            return 'var(--font-inter), sans-serif';
    }
}

export function getRadiusValue(radius: ThemeRadius): string {
    switch (radius) {
        case 'sharp':
            return '0.5rem';
        case 'classic':
            return '0.875rem';
        case 'modern':
            return '1.25rem';
        case 'pill':
            return '1.75rem';
        default:
            return '1.25rem';
    }
}

export function PublicThemeInjector({
    theme,
    slug,
    scopeSelector = ':root',
}: {
    theme?: ThemeConfig | null;
    slug?: string;
    scopeSelector?: string;
}) {
    const { data: tenant } = useGetPublicTenant(slug ?? '');
    const clientTheme = (tenant?.activeTheme?.themeConfig as ThemeConfig | undefined) ?? null;
    const active = clientTheme ?? theme ?? DEFAULT_THEME_CONFIG;

    const css = useMemo(() => {
        const headingFont = getFontFamily(active.fontHeading);
        const bodyFont = getFontFamily(active.fontBody);
        const radius = getRadiusValue(active.radius);
        const light = active.light;
        const dark = active.dark;

        const isRoot = scopeSelector === ':root';
        const lightTarget = isRoot ? ':root' : scopeSelector;
        const darkTarget = isRoot ? '.dark' : `.dark ${scopeSelector}`;

        const lightCardBorderHover =
            active.cardVariant === 'luxury'
                ? 'rgba(212, 175, 55, 0.7)'
                : active.cardVariant === 'cyber'
                  ? '#22D3EE'
                  : active.cardVariant === 'editorial'
                    ? '#C2410C'
                    : active.cardVariant === 'organic'
                      ? '#0D9488'
                      : light.primary;

        const darkCardBorderHover =
            active.cardVariant === 'luxury'
                ? 'rgba(212, 175, 55, 0.8)'
                : active.cardVariant === 'cyber'
                  ? '#22D3EE'
                  : active.cardVariant === 'editorial'
                    ? '#EA580C'
                    : active.cardVariant === 'organic'
                      ? '#14B8A6'
                      : dark.primary;

        const lightCardGlow =
            active.cardVariant === 'cyber'
                ? '0 0 20px rgba(6, 182, 212, 0.35)'
                : active.cardVariant === 'luxury'
                  ? '0 8px 24px rgba(212, 175, 55, 0.2)'
                  : active.cardVariant === 'editorial'
                    ? '0 8px 20px rgba(194, 65, 12, 0.15)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)';

        const darkCardGlow =
            active.cardVariant === 'cyber'
                ? '0 0 25px rgba(6, 182, 212, 0.5)'
                : active.cardVariant === 'luxury'
                  ? '0 8px 25px rgba(212, 175, 55, 0.25)'
                  : active.cardVariant === 'editorial'
                    ? '0 8px 20px rgba(234, 88, 12, 0.2)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.4)';

        return `
${lightTarget} {
  --theme-font-heading: ${headingFont};
  --theme-font-body: ${bodyFont};
  --theme-radius: ${radius};
  --theme-primary: ${light.primary};
  --theme-primary-hover: ${light.primaryHover};
  --theme-primary-text: ${light.primaryText};
  --theme-bg: ${light.bg};
  --theme-surface: ${light.surface};
  --theme-surface-border: ${light.surfaceBorder};
  --theme-text-primary: ${light.textPrimary};
  --theme-text-secondary: ${light.textSecondary};
  --theme-accent: ${light.accent || '#F59E0B'};
  --theme-card-border-hover: ${lightCardBorderHover};
  --theme-card-glow: ${lightCardGlow};
}

${darkTarget} {
  --theme-font-heading: ${headingFont};
  --theme-font-body: ${bodyFont};
  --theme-radius: ${radius};
  --theme-primary: ${dark.primary};
  --theme-primary-hover: ${dark.primaryHover};
  --theme-primary-text: ${dark.primaryText};
  --theme-bg: ${dark.bg};
  --theme-surface: ${dark.surface};
  --theme-surface-border: ${dark.surfaceBorder};
  --theme-text-primary: ${dark.textPrimary};
  --theme-text-secondary: ${dark.textSecondary};
  --theme-accent: ${dark.accent || '#FBBF24'};
  --theme-card-border-hover: ${darkCardBorderHover};
  --theme-card-glow: ${darkCardGlow};
}
`;
    }, [active, scopeSelector]);

    return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
