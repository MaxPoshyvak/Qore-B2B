import { z } from 'zod';
import type { MenuItemResponse } from '../menu';
import type { SuccessResponse } from '../common';

export const aiWaiterChatMessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(1000),
});

export const aiWaiterChatInputSchema = z.object({
    venueSlug: z.string().min(1, 'Venue slug is required'),
    message: z.string().min(1, 'Message is required').max(500, 'Message is too long'),
    history: z.array(aiWaiterChatMessageSchema).max(6).default([]),
    cartItemIds: z.array(z.string()).default([]),
    language: z.string().default('en'),
});

export const aiWaiterRawOutputSchema = z.object({
    reply: z.string().min(1),
    recommendedItemIds: z.array(z.string()).max(3).default([]),
});

export const aiWaiterRecommendedDishSchema = z.object({
    item: z.custom<MenuItemResponse>((val) => typeof val === 'object' && val !== null),
    hasRequiredModifiers: z.boolean(),
});

export const aiWaiterChatResponseDataSchema = z.object({
    reply: z.string(),
    recommendedDishes: z.array(aiWaiterRecommendedDishSchema),
});

export const aiWaiterChatResponseSchema = z.object({
    success: z.literal(true),
    data: aiWaiterChatResponseDataSchema,
    message: z.string().optional(),
});

export type AiWaiterChatMessage = z.infer<typeof aiWaiterChatMessageSchema>;
export type AiWaiterChatInput = z.infer<typeof aiWaiterChatInputSchema>;
export type AiWaiterRawOutput = z.infer<typeof aiWaiterRawOutputSchema>;
export type AiWaiterRecommendedDish = z.infer<typeof aiWaiterRecommendedDishSchema>;
export type AiWaiterChatResponseData = z.infer<typeof aiWaiterChatResponseDataSchema>;
export type AiWaiterChatResponse = SuccessResponse<AiWaiterChatResponseData>;
