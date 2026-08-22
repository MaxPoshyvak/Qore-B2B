import { z } from 'zod';

export const createTableSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    capacity: z.number().int('Capacity must be a whole number').min(1, 'Capacity must be at least 1').max(50, 'Capacity must be at most 50').default(4),
    isActive: z.boolean().optional(),
});

export type CreateTableDto = z.infer<typeof createTableSchema>;

export const updateTableSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
    capacity: z.number().int('Capacity must be a whole number').min(1, 'Capacity must be at least 1').max(50, 'Capacity must be at most 50').optional(),
    isActive: z.boolean().optional(),
});

export type UpdateTableDto = z.infer<typeof updateTableSchema>;

export const resolvedTableSchema = z.object({
    table: z.object({
        id: z.string(),
        name: z.string(),
    }),
    tenant: z.object({
        slug: z.string(),
        name: z.string(),
    }),
});

export type ResolvedTableDto = z.infer<typeof resolvedTableSchema>;
