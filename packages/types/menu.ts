import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Menu Category                                                     */
/* ------------------------------------------------------------------ */

export const CreateCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    tenantId: z.string().min(1, 'Tenant id is required'),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;

/* ------------------------------------------------------------------ */
/*  Menu Item                                                         */
/* ------------------------------------------------------------------ */

export const CreateMenuItemSchema = z.object({
    name: z.string().min(1, 'Name is required').max(80, 'Name must be less than 80 characters'),
    price: z.number().nonnegative('Price must be zero or greater'),
    description: z.string().max(500, 'Description too long').optional(),
    categoryId: z.string().min(1, 'Category id is required'),
    tenantId: z.string().min(1, 'Tenant id is required'),
    // Public contract uses `isAvailable`; the DB column is `isActive`.
    isAvailable: z.boolean().default(true),
});

export const UpdateMenuItemSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    price: z.number().nonnegative().optional(),
    description: z.string().max(500).optional(),
    categoryId: z.string().min(1).optional(),
    isAvailable: z.boolean().optional(),
});

export type CreateMenuItemDTO = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemDTO = z.infer<typeof UpdateMenuItemSchema>;

/**
 * Form-input shape of `CreateMenuItemSchema`.
 *
 * `isAvailable` uses `.default(true)`, so the schema input and output types
 * diverge. `zodResolver` is typed `Resolver<z.input, Context, z.output>`,
 * which means React Hook Form must be generic over the *input* type.
 */
export type CreateMenuItemInput = z.input<typeof CreateMenuItemSchema>;

/* ------------------------------------------------------------------ */
/*  Menu API response contracts                                       */
/* ------------------------------------------------------------------ */

/**
 * A menu item exactly as it arrives over HTTP.
 *
 * Note: the menu endpoints return raw Prisma rows, so the persisted column
 * name `isActive` is used here — the *write* contract exposes it as
 * `isAvailable`. Prisma `Decimal` columns are serialized to strings in JSON,
 * hence `price` / `happyHourPrice` are strings rather than numbers.
 */
export interface MenuItemResponse {
    id: string;
    tenantId: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: string;
    happyHourPrice: string | null;
    imageUrl: string | null;
    allergens: unknown;
    tags: unknown;
    isActive: boolean;
    sortOrder: number;
}

export interface MenuCategoryResponse {
    id: string;
    tenantId: string;
    name: string;
    icon: string | null;
    color: string | null;
    sortOrder: number;
    isActive: boolean;
}

/** `GET /menu/categories/:tenantId` returns every category with its items. */
export interface MenuCategoryWithItemsResponse extends MenuCategoryResponse {
    items: MenuItemResponse[];
}

/* ------------------------------------------------------------------ */
/*  Public (B2C) menu                                                 */
/* ------------------------------------------------------------------ */

/** Guest-facing venue info — never expose owner id or internal flags. */
export interface PublicMenuVenueResponse {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
}

/** Public category payload — only categories that still contain items. */
export interface PublicMenuCategoryResponse extends MenuCategoryResponse {
    items: MenuItemResponse[];
}

export interface PublicMenuResponseDTO {
    venue: PublicMenuVenueResponse;
    categories: PublicMenuCategoryResponse[];
}
