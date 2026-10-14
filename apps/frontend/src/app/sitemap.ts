import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://useqore.app';
    const now = new Date();

    const staticRoutes = [
        { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
        { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
        { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.8 },
        { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.5 },
        { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.5 },
        { path: '/login', changeFrequency: 'monthly' as const, priority: 0.6 },
        { path: '/register', changeFrequency: 'monthly' as const, priority: 0.8 },
    ];

    return staticRoutes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
