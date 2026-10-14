import type { Tenant, TenantSettings } from '@my-app/database';

/**
 * Tenant as returned by the public, unauthenticated `GET /tenants/public/:slug`
 * endpoint. Always includes the `settings` relation so the B2C venue page can
 * render hours, Wi-Fi and location without a JWT.
 */
export type PublicTenantResponse = Tenant & {
    settings: TenantSettings | null;
};

/**
 * System, static, and framework routes that cannot be claimed as a tenant slug.
 */
export const RESERVED_SLUGS = [
    'about',
    'admin',
    'api',
    'auth',
    'billing',
    'contact',
    'dashboard',
    'faq',
    'favicon.ico',
    'forgot-password',
    'help',
    'icon.svg',
    'kds',
    'login',
    'manifest.json',
    'onboarding',
    'pricing',
    'privacy',
    'register',
    'reset-password',
    'robots.txt',
    'settings',
    'sitemap.xml',
    'static',
    'status',
    'support',
    't',
    'terms',
    'verify-email',
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

export const RESERVED_SLUGS_SET: ReadonlySet<string> = new Set<string>(RESERVED_SLUGS);

export function isReservedSlug(slug?: string | null): boolean {
    if (!slug) return false;
    return RESERVED_SLUGS_SET.has(slug.trim().toLowerCase());
}
