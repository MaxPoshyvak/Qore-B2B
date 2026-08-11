/**
 * Query key factory for the menu entity.
 *
 * Menu items are never fetched on their own — the API nests them inside their
 * category — so item mutations invalidate `categories()` too. Invalidating the
 * shared `categories()` prefix refreshes every tenant's cached board at once.
 */
export const menuKeys = {
    all: ['menu'] as const,
    categories: () => [...menuKeys.all, 'categories'] as const,
    categoriesByTenant: (tenantId: string) => [...menuKeys.categories(), tenantId] as const,
};
