import { z } from 'zod';
import type { MenuItemResponse } from './menu';

export const addCartItemSchema = z.object({
    menuItemId: z.string().min(1, 'Menu item is required'),
    quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1').default(1),
    guestSessionId: z.string().min(1, 'Guest session is required'),
    guestName: z.string().min(1, 'Guest name is required'),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
    quantity: z.number().int('Quantity must be a whole number').min(0, 'Quantity cannot be negative'),
    guestSessionId: z.string().min(1, 'Guest session is required'),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

export const toggleReadySchema = z.object({
    guestSessionId: z.string().min(1, 'Guest session is required'),
});

export type ToggleReadyDto = z.infer<typeof toggleReadySchema>;

/* ------------------------------------------------------------------ */
/*  Shared (B2C) cart response contracts                              */
/* ------------------------------------------------------------------ */

/** A single line in a shared table cart. `menuItem` is always present. */
export interface CartItemResponse {
    id: string;
    cartSessionId: string;
    menuItemId: string;
    menuItem: MenuItemResponse | null;
    quantity: number;
    guestSessionId: string;
    guestName: string;
    createdAt: string;
    updatedAt: string;
}

/** The active cart session for a table, including all guests' items. */
export interface CartSessionResponse {
    id: string;
    tableId?: string | null;
    isActive: boolean;
    isTakeaway?: boolean;
    items: CartItemResponse[];
    /** Guest session ids that have marked their items as ready to submit. */
    confirmedGuests?: string[];
    createdAt: string;
    updatedAt: string;
}
