import { z } from 'zod';

export const generateDishOptionSchema = z.object({
    name: z.string(),
    priceAdjustment: z.number().nonnegative(),
});

export const generateDishModifierSchema = z.object({
    name: z.string(),
    required: z.boolean(),
    minSelections: z.number().int().min(0),
    maxSelections: z.number().int().min(1),
    options: z.array(generateDishOptionSchema),
});

export const generateDishOutputSchema = z.object({
    name: z.string(),
    description: z.string(),
    suggestedCategory: z.string(),
    allergens: z.array(z.string()),
    dietary: z.array(z.string()),
    modifiers: z.array(generateDishModifierSchema),
});

export const generateDishInputSchema = z.object({
    prompt: z.string().trim().min(3).max(500),
    language: z.string().optional(),
});

export type GenerateDishInput = z.infer<typeof generateDishInputSchema>;
export type GenerateDishOutput = z.infer<typeof generateDishOutputSchema>;
export type GenerateDishOption = z.infer<typeof generateDishOptionSchema>;
export type GenerateDishModifier = z.infer<typeof generateDishModifierSchema>;
