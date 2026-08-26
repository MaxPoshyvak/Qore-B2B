import { z } from 'zod';

/**
 * Full TenantSettings payload (read side). `kdsToken`/`kdsPin` are the Magic-Link +
 * PIN credentials used by the isolated Kitchen Display System — they are `null` until
 * the owner generates KDS access in Settings.
 */
export const tenantSettingsSchema = z.object({
    id: z.string(),
    tenantId: z.string(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    coverUrl: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    instagramUrl: z.string().nullable().optional(),
    googleMapsUrl: z.string().nullable().optional(),
    workingHours: z.unknown().nullable().optional(),
    wifiSsid: z.string().nullable().optional(),
    wifiPassword: z.string().nullable().optional(),
    reservationStepMinutes: z.number().optional(),
    minReservationTime: z.number().optional(),
    maxGuestsPerReservation: z.number().optional(),
    kdsToken: z.string().nullable().optional(),
    kdsPin: z.string().nullable().optional(),
});

export type TenantSettingsResponse = z.infer<typeof tenantSettingsSchema>;

/** Response of the KDS auth endpoints (generate / revoke). */
export const kdsAuthResponseSchema = z.object({
    kdsToken: z.string().nullable(),
    kdsPin: z.string().nullable(),
});

export type KdsAuthResponse = z.infer<typeof kdsAuthResponseSchema>;
