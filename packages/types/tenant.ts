import type { Tenant, TenantSettings } from '@my-app/database';

/**
 * Tenant as returned by the public, unauthenticated `GET /tenants/public/:slug`
 * endpoint. Always includes the `settings` relation so the B2C venue page can
 * render hours, Wi-Fi and location without a JWT.
 */
export type PublicTenantResponse = Tenant & {
    settings: TenantSettings | null;
};
