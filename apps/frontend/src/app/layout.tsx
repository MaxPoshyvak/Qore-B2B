import { QueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/shared/ui/AuthProvider';
import { ReactNode } from 'react';

import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="uk">
            <body>
                <AuthProvider>
                    <QueryProvider>{children}</QueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
