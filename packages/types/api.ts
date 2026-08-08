import { z } from 'zod';

export const CreateTenantSchema = z.object({
    name: z.string().min(2, 'Name is required').max(50, 'Name must be less than 50 characters'),
    slug: z
        .string()
        .min(2, 'URL is required')
        .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
});

export type CreateTenantDTO = z.infer<typeof CreateTenantSchema>;
