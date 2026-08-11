'use client';

import { useParams } from 'next/navigation';

import { useGetPublicMenu } from '@/entities/menu/hooks/useGetPublicMenu';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import { PublicMenuList } from '@/features/public-menu/components/PublicMenuList';
import { PublicMenuSkeleton } from '@/features/public-menu/components/PublicMenuSkeleton';
import { StickyCategoryNav } from '@/features/public-menu/components/StickyCategoryNav';
import { VenueHeader } from '@/features/public-menu/components/VenueHeader';

export default function PublicMenuPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { theme, toggle, mounted } = useTheme();
    const { data, isLoading } = useGetPublicMenu(resolvedSlug);

    return (
        <main className="relative min-h-screen bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader>{mounted && <ThemeToggle theme={theme} toggle={toggle} />}</BaseHeader>

            <div className="mx-auto max-w-3xl px-4 pb-24">
                {isLoading ? (
                    <PublicMenuSkeleton />
                ) : !data ? (
                    <MenuNotFound slug={resolvedSlug} />
                ) : (
                    <>
                        <VenueHeader venue={data.venue} />
                        <StickyCategoryNav categories={data.categories} />
                        <PublicMenuList categories={data.categories} />
                    </>
                )}
            </div>
        </main>
    );
}
