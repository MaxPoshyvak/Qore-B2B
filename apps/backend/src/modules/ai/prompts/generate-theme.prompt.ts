import {
    ThemeConfig,
    ThemeFontHeading,
    ThemeFontBody,
    ThemeRadius,
    ThemeCardStyle,
    ThemeAtmosphere,
    ThemeCardVariant,
    ThemeButtonVariant,
    ThemeBadgeVariant,
    GenerateThemeOutput,
} from '@my-app/types';

export const GENERATE_THEME_SYSTEM_PROMPT = `You are an elite HoReCa Brand Art Director & Digital Menu Theme Architect.
Generate a bespoke, visually stunning design theme tailored to the restaurant's vibe and cuisine.

OUTPUT ONLY A VALID JSON OBJECT conforming to this exact structure:
{
  "name": "Short evocative title (e.g. 'Noir Velvet Speakeasy', 'Sakura Garden')",
  "description": "One crisp sentence describing the mood and atmosphere",
  "fontHeading": "space-grotesk" | "playfair" | "plus-jakarta" | "syne" | "inter",
  "fontBody": "inter" | "lora" | "plus-jakarta" | "space-grotesk",
  "radius": "sharp" | "classic" | "modern" | "pill",
  "cardStyle": "glass" | "solid" | "bordered",
  "atmosphere": "minimal-grid" | "warm-grain" | "noir-gold" | "cyber-glow" | "organic-soft",
  "cardVariant": "glass" | "editorial" | "luxury" | "cyber" | "organic",
  "buttonVariant": "solid-rounded" | "warm-terracotta" | "gilded" | "neon-glow" | "organic-pill",
  "badgeVariant": "minimal" | "editorial-flourish" | "luxury-crest" | "cyber-tag" | "organic-leaf",
  "brandStamp": "2-4 uppercase words (e.g. 'NEON RAMEN LAB', 'ARTISAN PATISSERIE')",
  "light": {
    "primary": "#HEX",
    "primaryHover": "#HEX",
    "primaryText": "#HEX (contrast text on primary)",
    "bg": "#HEX (light background e.g. #FAF9F6)",
    "surface": "#HEX or rgba (light translucent surface)",
    "surfaceBorder": "#HEX or rgba",
    "textPrimary": "#HEX (dark high contrast)",
    "textSecondary": "#HEX (muted neutral)",
    "accent": "#HEX"
  },
  "dark": {
    "primary": "#HEX (luminous signature accent)",
    "primaryHover": "#HEX",
    "primaryText": "#HEX (contrast text on primary)",
    "bg": "#HEX (deep dark background e.g. #0B0B0E)",
    "surface": "#HEX or rgba (dark translucent surface)",
    "surfaceBorder": "#HEX or rgba",
    "textPrimary": "#HEX (light high contrast)",
    "textSecondary": "#HEX (muted slate/stone)",
    "accent": "#HEX"
  },
  "explanation": "1 short sentence explaining why this visual identity elevates the venue's guest experience"
}

RULES:
1. Colors MUST have strong WCAG contrast.
2. Select atmosphere & variants that authentically embody the cuisine & mood.
3. No markdown, no prose, only the raw JSON object.`;

export function buildGenerateThemeUserPrompt(
    prompt: string,
    venueName?: string,
    venueType?: string,
    currentTheme?: ThemeConfig,
    mode?: 'create' | 'refine',
): string {
    const parts: string[] = [];
    if (venueName) parts.push(`Venue Name: "${venueName}"`);
    if (venueType) parts.push(`Type: "${venueType}"`);

    if (mode === 'refine' && currentTheme) {
        parts.push(`TASK: REFINE EXISTING THEME`);
        parts.push(
            `Base Theme to Modify:\n${JSON.stringify({
                name: currentTheme.name,
                fontHeading: currentTheme.fontHeading,
                fontBody: currentTheme.fontBody,
                radius: currentTheme.radius,
                cardStyle: currentTheme.cardStyle,
                atmosphere: currentTheme.atmosphere,
                cardVariant: currentTheme.cardVariant,
                buttonVariant: currentTheme.buttonVariant,
                badgeVariant: currentTheme.badgeVariant,
                brandStamp: currentTheme.brandStamp,
                light: currentTheme.light,
                dark: currentTheme.dark,
            })}`,
        );
        parts.push(`User Change Request: "${prompt}"`);
        parts.push(
            `INSTRUCTION: Keep the core visual identity intact, but apply the user's requested adjustments precisely (e.g. adjust specific colors, change radius, switch atmosphere, modify contrast).`,
        );
    } else {
        parts.push(`Desired Aesthetic / Vibe: "${prompt}"`);
    }

    return parts.join('\n');
}

const VALID_HEADINGS: ThemeFontHeading[] = ['space-grotesk', 'playfair', 'plus-jakarta', 'syne', 'inter'];
const VALID_BODIES: ThemeFontBody[] = ['inter', 'lora', 'plus-jakarta', 'space-grotesk'];
const VALID_RADII: ThemeRadius[] = ['sharp', 'classic', 'modern', 'pill'];
const VALID_CARD_STYLES: ThemeCardStyle[] = ['glass', 'solid', 'bordered'];
const VALID_ATMOSPHERES: ThemeAtmosphere[] = ['minimal-grid', 'warm-grain', 'noir-gold', 'cyber-glow', 'organic-soft'];
const VALID_CARD_VARIANTS: ThemeCardVariant[] = ['glass', 'editorial', 'luxury', 'cyber', 'organic'];
const VALID_BUTTON_VARIANTS: ThemeButtonVariant[] = ['solid-rounded', 'warm-terracotta', 'gilded', 'neon-glow', 'organic-pill'];
const VALID_BADGE_VARIANTS: ThemeBadgeVariant[] = ['minimal', 'editorial-flourish', 'luxury-crest', 'cyber-tag', 'organic-leaf'];

export function sanitizeAiThemeOutput(raw: any): GenerateThemeOutput {
    const id = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'AI Custom Theme';
    const description = typeof raw.description === 'string' ? raw.description.trim() : 'Custom generated visual identity';

    const fontHeading: ThemeFontHeading = VALID_HEADINGS.includes(raw.fontHeading) ? raw.fontHeading : 'plus-jakarta';
    const fontBody: ThemeFontBody = VALID_BODIES.includes(raw.fontBody) ? raw.fontBody : 'inter';
    const radius: ThemeRadius = VALID_RADII.includes(raw.radius) ? raw.radius : 'modern';
    const cardStyle: ThemeCardStyle = VALID_CARD_STYLES.includes(raw.cardStyle) ? raw.cardStyle : 'glass';
    const atmosphere: ThemeAtmosphere = VALID_ATMOSPHERES.includes(raw.atmosphere) ? raw.atmosphere : 'minimal-grid';
    const cardVariant: ThemeCardVariant = VALID_CARD_VARIANTS.includes(raw.cardVariant) ? raw.cardVariant : 'glass';
    const buttonVariant: ThemeButtonVariant = VALID_BUTTON_VARIANTS.includes(raw.buttonVariant) ? raw.buttonVariant : 'solid-rounded';
    const badgeVariant: ThemeBadgeVariant = VALID_BADGE_VARIANTS.includes(raw.badgeVariant) ? raw.badgeVariant : 'minimal';
    const brandStamp = typeof raw.brandStamp === 'string' ? raw.brandStamp.trim().toUpperCase() : undefined;

    const sanitizeColor = (val: unknown, fallback: string) =>
        typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb')) ? val : fallback;

    const light = {
        primary: sanitizeColor(raw.light?.primary, '#2563EB'),
        primaryHover: sanitizeColor(raw.light?.primaryHover, '#1D4ED8'),
        primaryText: sanitizeColor(raw.light?.primaryText, '#FFFFFF'),
        bg: sanitizeColor(raw.light?.bg, '#FAF9F6'),
        surface: sanitizeColor(raw.light?.surface, '#FFFFFF'),
        surfaceBorder: sanitizeColor(raw.light?.surfaceBorder, 'rgba(0, 0, 0, 0.08)'),
        textPrimary: sanitizeColor(raw.light?.textPrimary, '#0F172A'),
        textSecondary: sanitizeColor(raw.light?.textSecondary, '#64748B'),
        accent: sanitizeColor(raw.light?.accent, '#F59E0B'),
    };

    const dark = {
        primary: sanitizeColor(raw.dark?.primary, '#3B82F6'),
        primaryHover: sanitizeColor(raw.dark?.primaryHover, '#60A5FA'),
        primaryText: sanitizeColor(raw.dark?.primaryText, '#FFFFFF'),
        bg: sanitizeColor(raw.dark?.bg, '#0B0B0E'),
        surface: sanitizeColor(raw.dark?.surface, 'rgba(20, 20, 24, 0.85)'),
        surfaceBorder: sanitizeColor(raw.dark?.surfaceBorder, 'rgba(255, 255, 255, 0.1)'),
        textPrimary: sanitizeColor(raw.dark?.textPrimary, '#F8FAFC'),
        textSecondary: sanitizeColor(raw.dark?.textSecondary, '#94A3B8'),
        accent: sanitizeColor(raw.dark?.accent, '#FBBF24'),
    };

    const themeConfig: ThemeConfig = {
        id,
        name,
        description,
        isPreset: false,
        fontHeading,
        fontBody,
        radius,
        cardStyle,
        atmosphere,
        cardVariant,
        buttonVariant,
        badgeVariant,
        brandStamp,
        light,
        dark,
    };

    return {
        themeConfig,
        explanation: typeof raw.explanation === 'string' ? raw.explanation : undefined,
    };
}
