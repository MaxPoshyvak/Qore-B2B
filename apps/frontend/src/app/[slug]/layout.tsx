import type { Metadata, ResolvingMetadata } from 'next';
import { isReservedSlug, type ThemeConfig } from '@my-app/types';
import { DemoTopBanner } from '@/features/public-menu/components/DemoTopBanner';
import { PublicThemeInjector } from '@/features/public-venue/theme/PublicThemeInjector';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(
    props: LayoutProps,
    _parent: ResolvingMetadata,
): Promise<Metadata> {
    const { slug } = await props.params;

    if (!slug || isReservedSlug(slug)) {
        return {};
    }

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/tenants/public/${encodeURIComponent(slug)}`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            return {
                title: `${slug} | Qore`,
            };
        }

        const json = await res.json();
        const tenant = json?.data;
        if (!tenant) return {};

        const venueName = tenant.name || slug;
        const description =
            tenant.settings?.description ||
            `Browse the digital menu, place table orders, and book a table at ${venueName}. Powered by Qore.`;

        const ogImages: string[] = [];
        if (tenant.settings?.bannerUrl) {
            ogImages.push(tenant.settings.bannerUrl);
        } else if (tenant.settings?.logoUrl) {
            ogImages.push(tenant.settings.logoUrl);
        }

        return {
            title: `${venueName} — Menu, Orders & Reservations`,
            description,
            openGraph: {
                title: `${venueName} — Digital Menu & Table Orders`,
                description,
                type: 'website',
                images: ogImages.length > 0 ? ogImages : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title: `${venueName} — Digital Menu & Table Orders`,
                description,
                images: ogImages.length > 0 ? ogImages : undefined,
            },
        };
    } catch {
        return {
            title: `${slug} | Qore`,
        };
    }
}

export default async function VenueLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    let activeTheme: ThemeConfig | null = null;
    if (slug && !isReservedSlug(slug)) {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const res = await fetch(`${apiUrl}/tenants/public/${encodeURIComponent(slug)}`, {
                cache: 'no-store',
            });
            if (res.ok) {
                const json = await res.json();
                activeTheme = (json?.data?.activeTheme?.themeConfig as ThemeConfig) ?? null;
            }
        } catch {
            // fallback to default
        }
    }

    return (
        <>
            <PublicThemeInjector theme={activeTheme} slug={slug} />
            <DemoTopBanner slug={slug} />
            {children}
        </>
    );
}

