'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { SessionGuard } from './SessionGuard';

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <SessionGuard>{children}</SessionGuard>
        </SessionProvider>
    );
}
