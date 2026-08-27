'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UtensilsCrossed, Store } from 'lucide-react';

import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { display } from '@/shared/lib/fonts';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { type ReservationResponse } from '@my-app/types';
import { BookingForm } from '@/features/reservations/components/BookingForm';
import { ReservationConfirmation } from '@/features/reservations/components/ReservationConfirmation';

export default function GuestBookingPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant, isLoading: tenantLoading } = useGetPublicTenant(resolvedSlug);
    const [created, setCreated] = useState<ReservationResponse | null>(null);

    const venueName = tenant?.name ?? 'Venue';

    return (
        <main className="relative min-h-screen bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />
            <BaseHeader
                centerContent={
                    <span className="text-[13px] font-semibold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                        {tenantLoading ? 'Loading…' : venueName}
                    </span>
                }>
                <Link
                    href={`/${resolvedSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E5E0]/80 bg-white/60 px-3 py-1.5 text-[12px] font-medium text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:text-[#60A5FA]">
                    <ArrowLeft size={13} />
                    <span className="hidden sm:inline">Back to {venueName}</span>
                    <span className="sm:hidden">Back</span>
                </Link>
                <Link
                    href={`/${resolvedSlug}/menu`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E5E0]/80 bg-white/60 px-3 py-1.5 text-[12px] font-medium text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:text-[#60A5FA]">
                    <UtensilsCrossed size={13} />
                    <span className="hidden sm:inline">View Menu</span>
                    <span className="sm:hidden">Menu</span>
                </Link>
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </BaseHeader>

            <div className="mx-auto max-w-6xl px-6 pb-24 pt-4">
                {/* Venue context (mobile) — desktop relies on the glass header above */}
                <div className="mb-6 md:hidden">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-[#9C9B95] dark:text-[#6E6D68]">
                        <Store size={12} /> Booking for
                    </span>
                    <h2 className={`${display.className} mt-1 text-[22px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        {venueName}
                    </h2>
                </div>

                <div className="mt-6">
                    {created ? (
                        <ReservationConfirmation reservation={created} onReset={() => setCreated(null)} />
                    ) : (
                        <BookingForm slug={resolvedSlug} onSuccess={setCreated} />
                    )}
                </div>
            </div>
        </main>
    );
}
