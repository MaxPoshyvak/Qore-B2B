import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    const frontendOrigin = req.nextUrl.origin;

    if (!token) {
        return NextResponse.redirect(new URL('/auth/verify-email?status=invalid', frontendOrigin));
    }

    // `NEXT_PUBLIC_API_URL` already includes the `/api` prefix
    // (e.g. http://localhost:4000/api), so we append the route path directly.
    const apiBase = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    const backendUrl = `${apiBase}/auth/verify-link?token=${encodeURIComponent(token)}`;

    try {
        const backendRes = await fetch(backendUrl, { redirect: 'manual' });

        const location = backendRes.headers.get('location');
        if (location) {
            // Resolve relative redirects against the frontend origin.
            return NextResponse.redirect(new URL(location, location.startsWith('http') ? undefined : frontendOrigin));
        }

        if (backendRes.ok) {
            return NextResponse.redirect(new URL('/onboarding?verified=1', frontendOrigin));
        }

        return NextResponse.redirect(new URL('/auth/verify-email?status=error', frontendOrigin));
    } catch {
        return NextResponse.redirect(new URL('/auth/verify-email?status=error', frontendOrigin));
    }
}
