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
