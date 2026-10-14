import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://useqore.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/about',
                    '/contact',
                    '/privacy',
                    '/terms',
                    '/login',
                    '/register',
                ],
                disallow: [
                    '/api/',
                    '/dashboard/',
                    '/kds/',
                    '/onboarding/',
                    '/auth/',
                    '/t/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
