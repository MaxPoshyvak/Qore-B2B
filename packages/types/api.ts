import { z } from 'zod';

export const CreateTenantSchema = z.object({
    name: z.string().min(2, "Назва закладу обов'язкова"),
    slug: z
        .string()
        .min(2, "URL закладу обов'язковий")
        .regex(/^[a-z0-9-]+$/, 'Тільки маленькі латинські літери, цифри та дефіс'),
});

export type CreateTenantDTO = z.infer<typeof CreateTenantSchema>;
