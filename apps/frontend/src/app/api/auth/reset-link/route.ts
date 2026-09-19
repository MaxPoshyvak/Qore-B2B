import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    const origin = req.nextUrl.origin;

    if (!token) {
        return NextResponse.redirect(new URL('/login?reset=invalid', origin));
    }

    return NextResponse.redirect(new URL(`/auth/reset-password?token=${encodeURIComponent(token)}`, origin));
}
