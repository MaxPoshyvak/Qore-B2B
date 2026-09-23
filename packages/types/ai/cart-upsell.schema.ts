import { z } from 'zod';
import type { MenuItemResponse } from '../menu';
import type { SuccessResponse } from '../common';

export const cartUpsellInputSchema = z.object({
    venueSlug: z.string().min(1, 'Venue slug is required'),
    cartItemIds: z.array(z.string()).default([]),
    language: z.string().default('en'),
});

export const aiRecommendationItemSchema = z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    pairingReason: z.string().min(1, 'Pairing reason is required'),
});

export const aiCartUpsellRawOutputSchema = z.object({
    recommendations: z.array(aiRecommendationItemSchema).transform((arr) => arr.slice(0, 2)),
});

export const cartUpsellRecommendationItemSchema = z.object({
    item: z.custom<MenuItemResponse>((val) => typeof val === 'object' && val !== null),
    pairingReason: z.string(),
    hasRequiredModifiers: z.boolean(),
});

export const cartUpsellResponseDataSchema = z.object({
    recommendations: z.array(cartUpsellRecommendationItemSchema),
});

export const cartUpsellResponseSchema = z.object({
    success: z.literal(true),
    data: cartUpsellResponseDataSchema,
    message: z.string().optional(),
});

export type CartUpsellInput = z.infer<typeof cartUpsellInputSchema>;
export type AiRecommendationItem = z.infer<typeof aiRecommendationItemSchema>;
export type AiCartUpsellRawOutput = z.infer<typeof aiCartUpsellRawOutputSchema>;

export interface CartUpsellRecommendationItem {
    item: MenuItemResponse;
    pairingReason: string;
    hasRequiredModifiers: boolean;
}

export interface CartUpsellResponseData {
    recommendations: CartUpsellRecommendationItem[];
}

export type CartUpsellResponse = SuccessResponse<CartUpsellResponseData>;
