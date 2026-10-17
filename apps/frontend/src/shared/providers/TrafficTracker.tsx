'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function TrafficTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname) return;

        // Ignore platform admin HQ routes and API routes
        if (pathname.startsWith('/qore-hq') || pathname.startsWith('/api')) {
            return;
        }

        // Avoid double-tracking the identical path in quick succession
        if (lastTrackedPath.current === pathname) {
            return;
        }
        lastTrackedPath.current = pathname;

        // Retrieve or generate an anonymous, non-PII visitor identifier
        let visitorId = '';
        try {
            visitorId = localStorage.getItem('qore_vid') || '';
            if (!visitorId) {
                visitorId = 'vid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                localStorage.setItem('qore_vid', visitorId);
            }
        } catch {
            visitorId = 'anon_' + Date.now();
        }

        const payload = JSON.stringify({
            path: pathname,
            visitorId,
            referrer: typeof document !== 'undefined' ? document.referrer || null : null,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent || null : null,
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const apiUrl = `${baseUrl}/platform-admin/track`;

        try {
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(apiUrl, blob);
            } else {
                fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                }).catch(() => {});
            }
        } catch {
            // Silently ignore network failures to ensure zero user-facing impact
        }
    }, [pathname]);

    return null;
}
