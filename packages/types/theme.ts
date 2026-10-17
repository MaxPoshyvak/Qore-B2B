import { z } from 'zod';

export const THEME_PRESET_IDS = [
    'modern-minimal',
    'tuscan-osteria',
    'monarch-luxury',
    'tokyo-cyber',
    'botanical-garden',
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export const themeFontHeadingSchema = z.enum([
    'space-grotesk',
    'playfair',
    'plus-jakarta',
    'syne',
    'inter',
]);

export type ThemeFontHeading = z.infer<typeof themeFontHeadingSchema>;

export const themeFontBodySchema = z.enum([
    'inter',
    'lora',
    'plus-jakarta',
    'space-grotesk',
]);

export type ThemeFontBody = z.infer<typeof themeFontBodySchema>;

export const themeRadiusSchema = z.enum([
    'sharp',   // 8px
    'classic', // 14px
    'modern',  // 20px
    'pill',    // 28px
]);

export type ThemeRadius = z.infer<typeof themeRadiusSchema>;

export const themeCardStyleSchema = z.enum([
    'glass',    // backdrop-blur + semi-transparent
    'solid',    // opaque card
    'bordered', // distinct border accent
]);

export type ThemeCardStyle = z.infer<typeof themeCardStyleSchema>;

export const themeColorPaletteSchema = z.object({
    primary: z.string(),
    primaryHover: z.string(),
    primaryText: z.string(),
    bg: z.string(),
    surface: z.string(),
    surfaceBorder: z.string(),
    textPrimary: z.string(),
    textSecondary: z.string(),
    accent: z.string().optional(),
});

export type ThemeColorPalette = z.infer<typeof themeColorPaletteSchema>;

export const themeAtmosphereSchema = z.enum([
    'minimal-grid',
    'warm-grain',
    'noir-gold',
    'cyber-glow',
    'organic-soft',
]);

export type ThemeAtmosphere = z.infer<typeof themeAtmosphereSchema>;

export const themeCardVariantSchema = z.enum([
    'glass',
    'editorial',
    'luxury',
    'cyber',
    'organic',
]);

export type ThemeCardVariant = z.infer<typeof themeCardVariantSchema>;

export const themeButtonVariantSchema = z.enum([
    'solid-rounded',
    'warm-terracotta',
    'gilded',
    'neon-glow',
    'organic-pill',
]);

export type ThemeButtonVariant = z.infer<typeof themeButtonVariantSchema>;

export const themeBadgeVariantSchema = z.enum([
    'minimal',
    'editorial-flourish',
    'luxury-crest',
    'cyber-tag',
    'organic-leaf',
]);

export type ThemeBadgeVariant = z.infer<typeof themeBadgeVariantSchema>;

export const themeConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isPreset: z.boolean().default(true),
    fontHeading: themeFontHeadingSchema,
    fontBody: themeFontBodySchema,
    radius: themeRadiusSchema,
    cardStyle: themeCardStyleSchema,
    atmosphere: themeAtmosphereSchema.optional().default('minimal-grid'),
    cardVariant: themeCardVariantSchema.optional().default('glass'),
    buttonVariant: themeButtonVariantSchema.optional().default('solid-rounded'),
    badgeVariant: themeBadgeVariantSchema.optional().default('minimal'),
    brandStamp: z.string().optional(),
    light: themeColorPaletteSchema,
    dark: themeColorPaletteSchema,
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export const updateTenantThemeSchema = z.object({
    presetId: z.enum(THEME_PRESET_IDS).optional(),
    customConfig: themeConfigSchema.optional(),
});

export type UpdateTenantThemeDto = z.infer<typeof updateTenantThemeSchema>;

export const tenantThemeResponseSchema = z.object({
    id: z.string(),
    tenantId: z.string(),
    themeConfig: themeConfigSchema,
    isAiGenerated: z.boolean(),
    createdAt: z.string(),
});

export type TenantThemeResponse = z.infer<typeof tenantThemeResponseSchema>;

export const generateThemeInputSchema = z.object({
    prompt: z.string().trim().min(2).max(400),
    venueName: z.string().optional(),
    venueType: z.string().optional(),
    currentTheme: themeConfigSchema.optional(),
    mode: z.enum(['create', 'refine']).optional().default('create'),
});

export type GenerateThemeInput = z.infer<typeof generateThemeInputSchema>;

export const generateThemeOutputSchema = z.object({
    themeConfig: themeConfigSchema,
    explanation: z.string().optional(),
});

export type GenerateThemeOutput = z.infer<typeof generateThemeOutputSchema>;
