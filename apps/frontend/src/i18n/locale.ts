'use server';

import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@my-app/types';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale(): Promise<Locale> {
    try {
        const cookieStore = await cookies();
        const cookieLocale = cookieStore.get(COOKIE_NAME)?.value as Locale | undefined;

        if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
            return cookieLocale;
        }

        const headerList = await headers();
        const acceptLanguage = headerList.get('accept-language');
        if (acceptLanguage) {
            const preferred = acceptLanguage
                .split(',')
                .map((lang) => lang.split(';')[0].trim().toLowerCase().slice(0, 2))
                .find((lang): lang is Locale => SUPPORTED_LOCALES.includes(lang as Locale));
            if (preferred) {
                return preferred;
            }
        }
    } catch {
        // Fallback for edge cases or static build
    }

    return DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
    });
}
