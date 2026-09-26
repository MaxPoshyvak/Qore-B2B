import { z } from 'zod';

export const subscriptionPlanIdSchema = z.enum(['free', 'pro', 'business']);
export type SubscriptionPlanId = z.infer<typeof subscriptionPlanIdSchema>;

export const pricingPlanSchema = z.object({
    id: subscriptionPlanIdSchema,
    tier: z.string(),
    price: z.string(),
    period: z.string().optional(),
    description: z.string(),
    features: z.array(z.string()),
    featured: z.boolean().optional(),
    ctaText: z.string(),
});

export type PricingPlan = z.infer<typeof pricingPlanSchema>;

export const PRICING_PLANS: readonly PricingPlan[] = [
    {
        id: 'free',
        tier: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Everything you need to launch one venue.',
        ctaText: 'Start for free',
        features: [
            'Menu, categories, table QR codes',
            'Reservations and calendar',
            'Live table cart and split billing',
            'Order-ahead and the 86 list',
            'Dynamic happy hour',
            'Basic analytics and NPS',
        ],
    },
    {
        id: 'pro',
        tier: 'Pro',
        price: '$29',
        period: '/mo',
        description: 'Everything in Free, plus the AI growth engine.',
        featured: true,
        ctaText: 'Upgrade to Pro',
        features: [
            'Everything in Free',
            'AI waiter concierge',
            'AI menu design generator',
            'AI upselling in cart',
            'AI sentiment analysis on NPS',
            'Advanced analytics and forecasts',
        ],
    },
    {
        id: 'business',
        tier: 'Business',
        price: '$79',
        period: '/mo',
        description: 'For restaurant groups and custom infrastructure.',
        ctaText: 'Upgrade to Business',
        features: [
            'Everything in Pro',
            'POS integrations (Square, Toast, Lightspeed)',
            'Custom domain and white-label',
            'Multi-location support',
            'Priority support',
        ],
    },
] as const;

export const PLAN_RANK: Record<SubscriptionPlanId, number> = {
    free: 0,
    pro: 1,
    business: 2,
};

/* ------------------------------------------------------------------ */
/*  Billing DTOs (Stripe Checkout & Portal)                            */
/* ------------------------------------------------------------------ */

/** DTO for creating a Stripe Checkout session. */
export const createCheckoutSessionSchema = z.object({
    plan: z.enum(['pro', 'business']),
});
export type CreateCheckoutSessionDto = z.infer<typeof createCheckoutSessionSchema>;

/** Response containing a Stripe redirect URL or immediate upgrade status. */
export const checkoutSessionResponseSchema = z.object({
    url: z.string().url().nullable().optional(),
    upgradedImmediately: z.boolean().optional(),
    plan: subscriptionPlanIdSchema.optional(),
});
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;

/** Response from creating a Stripe Customer Portal session. */
export const portalSessionResponseSchema = z.object({
    url: z.string().url(),
});
export type PortalSessionResponse = z.infer<typeof portalSessionResponseSchema>;

/** DTO for verifying a completed Stripe Checkout session upon redirect. */
export const verifyCheckoutSessionSchema = z.object({
    sessionId: z.string().min(1),
});
export type VerifyCheckoutSessionDto = z.infer<typeof verifyCheckoutSessionSchema>;

/** Response from verifying a checkout session. */
export const verifyCheckoutSessionResponseSchema = z.object({
    plan: subscriptionPlanIdSchema,
    subscriptionStatus: z.string(),
});
export type VerifyCheckoutSessionResponse = z.infer<typeof verifyCheckoutSessionResponseSchema>;
