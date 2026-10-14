import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@my-app/types';

export default getRequestConfig(async () => {
    let locale: Locale = DEFAULT_LOCALE;

    try {
        const cookieStore = await cookies();
        const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;

        if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
            locale = cookieLocale;
        } else {
            const headerList = await headers();
            const acceptLanguage = headerList.get('accept-language');
            if (acceptLanguage) {
                const preferred = acceptLanguage
                    .split(',')
                    .map((lang) => lang.split(';')[0].trim().toLowerCase().slice(0, 2))
                    .find((lang): lang is Locale => SUPPORTED_LOCALES.includes(lang as Locale));
                if (preferred) {
                    locale = preferred;
                }
            }
        }
    } catch {
        locale = DEFAULT_LOCALE;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
