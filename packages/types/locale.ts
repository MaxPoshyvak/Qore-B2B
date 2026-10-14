import { z } from 'zod';

export const SUPPORTED_LOCALES = ['en', 'uk', 'cs', 'de', 'pl'] as const;
export const localeSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof localeSchema>;

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleConfig {
    code: Locale;
    name: string;
    localName: string;
    flag: string;
}

export const LOCALES_CONFIG: readonly LocaleConfig[] = [
    { code: 'en', name: 'English', localName: 'English', flag: '🇬🇧' },
    { code: 'uk', name: 'Ukrainian', localName: 'Українська', flag: '🇺🇦' },
    { code: 'cs', name: 'Czech', localName: 'Čeština', flag: '🇨🇿' },
    { code: 'de', name: 'German', localName: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', name: 'Polish', localName: 'Polski', flag: '🇵🇱' },
] as const;

export const LOCALES_MAP: Record<Locale, LocaleConfig> = LOCALES_CONFIG.reduce(
    (acc, item) => ({ ...acc, [item.code]: item }),
    {} as Record<Locale, LocaleConfig>,
);

export function getLocaleConfig(code?: string | null): LocaleConfig {
    if (!code) return LOCALES_MAP[DEFAULT_LOCALE];
    const normalized = code.toLowerCase().slice(0, 2) as Locale;
    return LOCALES_MAP[normalized] ?? LOCALES_MAP[DEFAULT_LOCALE];
}
