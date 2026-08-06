import { QueryProvider } from '@/lib/query-client';
import { ReactNode } from 'react';

import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="uk">
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
