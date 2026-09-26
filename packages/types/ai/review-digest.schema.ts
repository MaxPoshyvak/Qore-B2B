import { z } from 'zod';

export const reviewDigestTopicSchema = z.object({
    label: z.string().describe('Short category name, e.g. Coffee, Wait Time, Ambience'),
    emoji: z.string().describe('Single emoji representing the topic, e.g. ☕, ⏱, 🪑'),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
});

export const reviewDigestRawOutputSchema = z.object({
    summary: z.string().describe('Executive summary paragraph highlighting key praises and frictions'),
    overallSentiment: z.enum(['positive', 'mixed', 'negative']),
    sentimentScore: z.number().int().min(0).max(100).describe('Customer satisfaction score 0-100%'),
    topics: z.array(reviewDigestTopicSchema).min(2).max(6),
    strengths: z.array(z.string()).min(1).max(4).describe('Key positive aspects'),
    improvements: z.array(z.string()).min(1).max(4).describe('Actionable areas to improve'),
    actionableTip: z.string().describe('1 concrete, high-impact suggestion for the venue owner'),
});

export const reviewDigestResponseSchema = z.object({
    hasEnoughData: z.boolean(),
    reviewCount: z.number(),
    averageRating: z.number(),
    analyzedAt: z.string().nullable(),
    digest: reviewDigestRawOutputSchema.nullable(),
});

export type ReviewDigestTopic = z.infer<typeof reviewDigestTopicSchema>;
export type ReviewDigestRawOutput = z.infer<typeof reviewDigestRawOutputSchema>;
export type ReviewDigestResponse = z.infer<typeof reviewDigestResponseSchema>;
