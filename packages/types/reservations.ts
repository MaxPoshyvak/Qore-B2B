import { z } from 'zod';

export const RESERVATION_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type ReservationStatusType = (typeof RESERVATION_STATUSES)[number];

export const createReservationSchema = z.object({
    guestName: z.string().min(1, 'Guest name is required'),
    guestPhone: z.string().min(1, 'Phone number is required'),
    guestsCount: z.number().int().min(1, 'At least 1 guest').max(50, 'Too many guests for one reservation'),
    reservedAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid reservation date/time'),
    notes: z.string().max(500, 'Notes are too long').optional(),
});

export type CreateReservationDto = z.infer<typeof createReservationSchema>;

export const updateReservationSchema = z.object({
    status: z.enum(RESERVATION_STATUSES).optional(),
    tableId: z.string().nullable().optional(),
});

export type UpdateReservationDto = z.infer<typeof updateReservationSchema>;

export interface ReservationResponse {
    id: string;
    tenantId: string;
    tableId: string | null;
    guestName: string;
    guestPhone: string;
    guestsCount: number;
    reservedAt: string;
    status: ReservationStatusType;
    notes: string | null;
    createdAt: string;
}

export interface AvailabilitySlot {
    time: string;
    available: boolean;
    remaining: number;
}

export const bookingFormSchema = z.object({
    date: z.string().min(1, 'Please select a date'),
    time: z.string().min(1, 'Please select a time slot'),
    guestsCount: createReservationSchema.shape.guestsCount,
    guestName: createReservationSchema.shape.guestName,
    guestPhone: createReservationSchema.shape.guestPhone,
    notes: createReservationSchema.shape.notes,
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
