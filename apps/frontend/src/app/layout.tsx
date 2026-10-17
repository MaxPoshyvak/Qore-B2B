import { QueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/shared/ui/AuthProvider';
import { CookieBanner } from '@/shared/ui/CookieBanner';
import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { fontVariables } from '@/shared/lib/fonts';

import './globals.css';

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
        { media: '(prefers-color-scheme: dark)', color: '#0A0A0C' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    title: {
        default: 'Qore — Operating System for Modern Restaurants & Cafes',
        template: '%s | Qore',
    },
    description:
        'All-in-one restaurant operating system: interactive QR menus, collaborative table carts, instant split payments, smart kitchen display (KDS), table reservations, and AI growth tools.',
    keywords: [
        'restaurant QR menu',
        'digital menu',
        'table ordering system',
        'KDS',
        'kitchen display system',
        'restaurant SaaS',
        'split bill QR',
        'HoReCa POS',
        'table reservations',
        'Qore',
    ],
    authors: [{ name: 'Qore Technologies' }],
    creator: 'Qore',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://useqore.app'),
    icons: {
        icon: '/icon.svg',
        shortcut: '/icon.svg',
        apple: '/icon.svg',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://useqore.app',
        siteName: 'Qore',
        title: 'Qore — Operating System for Modern Restaurants & Cafes',
        description:
            'Interactive QR menus, collaborative table carts, split bill, KDS, and table reservations for modern hospitality.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Qore — Operating System for Modern Restaurants & Cafes',
        description:
            'Interactive QR menus, collaborative table carts, split bill, KDS, and table reservations for modern hospitality.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={fontVariables}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <AuthProvider>
                        <QueryProvider>
                            {children}
                            <CookieBanner />
                        </QueryProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

