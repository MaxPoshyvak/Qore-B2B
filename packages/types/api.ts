import { z } from 'zod';

export const CreateTenantSchema = z.object({
    name: z.string().min(2, 'Name is required').max(50, 'Name must be less than 50 characters'),
    slug: z
        .string()
        .min(2, 'URL is required')
        .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
});

export type CreateTenantDTO = z.infer<typeof CreateTenantSchema>;

//settings
export const workingHoursDaySchema = z.object({
    isOpen: z.boolean(),
    openTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        .optional(),
    closeTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        .optional(),
});

export const workingHoursSchema = z.object({
    monday: workingHoursDaySchema,
    tuesday: workingHoursDaySchema,
    wednesday: workingHoursDaySchema,
    thursday: workingHoursDaySchema,
    friday: workingHoursDaySchema,
    saturday: workingHoursDaySchema,
    sunday: workingHoursDaySchema,
});

export const updateTenantSettingsSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
    logoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    coverUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),

    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    instagramUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    googleMapsUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),

    wifiName: z.string().optional().or(z.literal('')),
    wifiPassword: z.string().optional().or(z.literal('')),

    workingHours: workingHoursSchema.optional(),
});

export type UpdateTenantSettingsDto = z.infer<typeof updateTenantSettingsSchema>;
