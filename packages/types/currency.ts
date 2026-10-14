import { z } from 'zod';

export const SUPPORTED_CURRENCY_CODES = [
    'USD',
    'EUR',
    'CZK',
    'UAH',
    'GBP',
    'PLN',
    'CHF',
    'CAD',
    'AUD',
    'JPY',
    'HUF',
    'RON',
    'BGN',
    'SEK',
    'NOK',
    'DKK',
] as const;

export const currencyCodeSchema = z.enum(SUPPORTED_CURRENCY_CODES);
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;

export interface CurrencyConfig {
    code: CurrencyCode;
    name: string;
    symbol: string;
    symbolPosition: 'prefix' | 'suffix';
    symbolSpacing: boolean;
    decimals: number;
    rateFromUsd: number;
    flag: string;
}

export const SUPPORTED_CURRENCIES: readonly CurrencyConfig[] = [
    {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        symbolPosition: 'prefix',
        symbolSpacing: false,
        decimals: 2,
        rateFromUsd: 1,
        flag: '🇺🇸',
    },
    {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        symbolPosition: 'prefix',
        symbolSpacing: false,
        decimals: 2,
        rateFromUsd: 0.92,
        flag: '🇪🇺',
    },
    {
        code: 'CZK',
        name: 'Czech Koruna',
        symbol: 'Kč',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 23.5,
        flag: '🇨🇿',
    },
    {
        code: 'UAH',
        name: 'Ukrainian Hryvnia',
        symbol: '₴',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 41.5,
        flag: '🇺🇦',
    },
    {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        symbolPosition: 'prefix',
        symbolSpacing: false,
        decimals: 2,
        rateFromUsd: 0.79,
        flag: '🇬🇧',
    },
    {
        code: 'PLN',
        name: 'Polish Złoty',
        symbol: 'zł',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 3.95,
        flag: '🇵🇱',
    },
    {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        symbolPosition: 'prefix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 0.90,
        flag: '🇨🇭',
    },
    {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'CA$',
        symbolPosition: 'prefix',
        symbolSpacing: false,
        decimals: 2,
        rateFromUsd: 1.36,
        flag: '🇨🇦',
    },
    {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'AU$',
        symbolPosition: 'prefix',
        symbolSpacing: false,
        decimals: 2,
        rateFromUsd: 1.52,
        flag: '🇦🇺',
    },
    {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        symbolPosition: 'prefix',
        symbolSpacing: false,
        decimals: 0,
        rateFromUsd: 155,
        flag: '🇯🇵',
    },
    {
        code: 'HUF',
        name: 'Hungarian Forint',
        symbol: 'Ft',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 0,
        rateFromUsd: 370,
        flag: '🇭🇺',
    },
    {
        code: 'RON',
        name: 'Romanian Leu',
        symbol: 'lei',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 4.60,
        flag: '🇷🇴',
    },
    {
        code: 'BGN',
        name: 'Bulgarian Lev',
        symbol: 'лв',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 1.80,
        flag: '🇧🇬',
    },
    {
        code: 'SEK',
        name: 'Swedish Krona',
        symbol: 'kr',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 10.5,
        flag: '🇸🇪',
    },
    {
        code: 'NOK',
        name: 'Norwegian Krone',
        symbol: 'kr',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 10.8,
        flag: '🇳🇴',
    },
    {
        code: 'DKK',
        name: 'Danish Krone',
        symbol: 'kr',
        symbolPosition: 'suffix',
        symbolSpacing: true,
        decimals: 2,
        rateFromUsd: 6.90,
        flag: '🇩🇰',
    },
] as const;

export const CURRENCY_MAP: Record<string, CurrencyConfig> = SUPPORTED_CURRENCIES.reduce(
    (acc, item) => ({ ...acc, [item.code]: item }),
    {},
);

export function getCurrencyConfig(code?: string | null): CurrencyConfig {
    if (!code) return CURRENCY_MAP['USD'];
    return CURRENCY_MAP[code.toUpperCase()] ?? CURRENCY_MAP['USD'];
}

export function formatCurrencyPrice(value: string | number, currencyCode?: string | null): string {
    const amount = typeof value === 'number' ? value : Number.parseFloat(value);
    if (!Number.isFinite(amount)) return '—';

    const config = getCurrencyConfig(currencyCode);
    const formattedNumber = amount.toLocaleString('en-US', {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
    });

    if (config.symbolPosition === 'prefix') {
        return `${config.symbol}${config.symbolSpacing ? ' ' : ''}${formattedNumber}`;
    }
    return `${formattedNumber}${config.symbolSpacing ? ' ' : ''}${config.symbol}`;
}

export function getPlanPriceForCurrency(
    planId: 'free' | 'pro' | 'business',
    currencyCode?: string | null,
): { formattedPrice: string; amount: number; currency: CurrencyCode } {
    const config = getCurrencyConfig(currencyCode);
    if (planId === 'free') {
        return {
            formattedPrice: formatCurrencyPrice(0, config.code),
            amount: 0,
            currency: config.code,
        };
    }

    const usdPrice = planId === 'pro' ? 29 : 79;
    const convertedAmount = Math.round(usdPrice * config.rateFromUsd);
    return {
        formattedPrice: formatCurrencyPrice(convertedAmount, config.code),
        amount: convertedAmount,
        currency: config.code,
    };
}

export function getSuggestedExchangeRate(fromCurrency?: string | null, toCurrency?: string | null): number {
    const fromConfig = getCurrencyConfig(fromCurrency);
    const toConfig = getCurrencyConfig(toCurrency);
    if (!fromConfig.rateFromUsd || fromConfig.rateFromUsd <= 0) return 1;
    const rate = toConfig.rateFromUsd / fromConfig.rateFromUsd;
    return rate >= 1 ? Math.round(rate * 100) / 100 : Math.round(rate * 10000) / 10000;
}

