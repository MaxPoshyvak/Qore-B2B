import { QueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/shared/ui/AuthProvider';
import { CookieBanner } from '@/shared/ui/CookieBanner';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import './globals.css';

export default async function RootLayout({ children }: { children: ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body>
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

