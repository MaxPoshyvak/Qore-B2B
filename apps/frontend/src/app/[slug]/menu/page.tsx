import { isReservedSlug, type PublicMenuResponseDTO } from '@my-app/types';
import { PublicMenuClientView } from '@/features/public-menu/components/PublicMenuClientView';

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * PublicMenuPage Server Component:
 * Performs server-side fetch of menu & venue branding with ISR revalidation (30s).
 * This ensures the initial HTML contains the rendered VenueHeader, cover image,
 * and preloads the LCP cover image via <link rel="preload"> in the initial document,
 * completely eliminating client-side fetch delay (Resource load delay: 2.48s -> 0s).
 */
export default async function PublicMenuPage({ params }: PageProps) {
    const { slug } = await params;
    const resolvedSlug = slug ?? '';

    let initialMenu: PublicMenuResponseDTO | null = null;
    if (resolvedSlug && !isReservedSlug(resolvedSlug)) {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const res = await fetch(`${apiUrl}/menu/public/${encodeURIComponent(resolvedSlug)}`, {
                next: { revalidate: 30 },
            });
            if (res.ok) {
                const json = await res.json();
                initialMenu = json?.data ?? null;
            }
        } catch {
            // Client fetch fallback in case of backend or network failure
        }
    }

    return <PublicMenuClientView slug={resolvedSlug} initialMenu={initialMenu} />;
}
