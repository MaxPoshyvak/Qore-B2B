'use client';

import { signOut, useSession } from 'next-auth/react';
import { ReactNode, useEffect, useRef } from 'react';

/**
 * Watches the session for a `RefreshAccessTokenError` flag (set by the jwt
 * callback when the backend rejects our refresh token) and forces a sign out.
 * Without this the client keeps replaying a "poisoned" cookie forever.
 */
export function SessionGuard({ children }: { children?: ReactNode }) {
    const { data: session } = useSession();
    const signingOut = useRef(false);

    useEffect(() => {
        if (session?.error === 'RefreshAccessTokenError' && !signingOut.current) {
            signingOut.current = true;
            void signOut({ callbackUrl: '/login' });
        }
    }, [session]);

    return <>{children}</>;
}
