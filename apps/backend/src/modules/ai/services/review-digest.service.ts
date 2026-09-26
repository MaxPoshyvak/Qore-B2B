import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import OpenAI from 'openai';
import { env } from 'src/config/env';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
    REVIEW_DIGEST_SYSTEM_PROMPT,
    buildReviewDigestUserPrompt,
} from '../prompts/review-digest.prompt';
import {
    ReviewDigestResponse,
    ReviewDigestRawOutput,
    reviewDigestRawOutputSchema,
} from '@my-app/types';

const MIN_REVIEWS_FOR_DIGEST = 3;

@Injectable()
export class ReviewDigestService {
    private readonly logger = new Logger(ReviewDigestService.name);
    private readonly client: OpenAI;
    private readonly model: string;

    constructor(private readonly prisma: PrismaService) {
        this.model = env.OPENROUTER_UPSELL_MODEL || 'openai/gpt-4o-mini';
        this.client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: env.OPENROUTER_API_KEY,
            defaultHeaders: {
                'HTTP-Referer': env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'Qore HoReCa OS',
            },
        });
    }

    /**
     * Main entry point: returns cached digest if reviews haven't changed,
     * or generates a fresh one via LLM and persists it.
     */
    async getOrGenerateDigest(tenantId: string): Promise<ReviewDigestResponse> {
        // 1. Fetch the latest 100 published feedbacks with text
        const recentFeedbacks = await this.prisma.feedback.findMany({
            where: {
                tenantId,
                status: 'published',
                comment: { not: null },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
                id: true,
                rating: true,
                comment: true,
            },
        });

        // Filter out empty comments (whitespace-only)
        const textFeedbacks = recentFeedbacks.filter(
            (f) => f.comment && f.comment.trim().length > 0,
        );

        // 2. Check minimum threshold
        if (textFeedbacks.length < MIN_REVIEWS_FOR_DIGEST) {
            return {
                hasEnoughData: false,
                reviewCount: textFeedbacks.length,
                averageRating: this.computeAverageRating(textFeedbacks),
                analyzedAt: null,
                digest: null,
            };
        }

        // 3. Compute deterministic content hash
        const contentHash = this.computeContentHash(textFeedbacks);

        // 4. Check existing digest in DB
        const existingDigest = await this.prisma.feedbackDigest.findUnique({
            where: { tenantId },
        });

        if (existingDigest && existingDigest.contentHash === contentHash) {
            // Cache hit — return persisted digest without LLM call
            this.logger.debug(`Digest cache hit for tenant ${tenantId}`);
            return {
                hasEnoughData: true,
                reviewCount: existingDigest.reviewCount,
                averageRating: existingDigest.averageRating,
                analyzedAt: existingDigest.analyzedAt.toISOString(),
                digest: {
                    summary: existingDigest.summary,
                    overallSentiment: existingDigest.overallSentiment as ReviewDigestRawOutput['overallSentiment'],
                    sentimentScore: existingDigest.sentimentScore,
                    topics: existingDigest.topics as ReviewDigestRawOutput['topics'],
                    strengths: existingDigest.strengths,
                    improvements: existingDigest.improvements,
                    actionableTip: existingDigest.actionableTip,
                },
            };
        }

        // 5. Generate fresh digest via LLM
        const averageRating = this.computeAverageRating(textFeedbacks);
        const digest = await this.callLlm(textFeedbacks, 'en');

        if (!digest) {
            // LLM call failed — return stale digest if available, else empty
            if (existingDigest) {
                this.logger.warn(`LLM failed for tenant ${tenantId}, returning stale digest`);
                return {
                    hasEnoughData: true,
                    reviewCount: existingDigest.reviewCount,
                    averageRating: existingDigest.averageRating,
                    analyzedAt: existingDigest.analyzedAt.toISOString(),
                    digest: {
                        summary: existingDigest.summary,
                        overallSentiment: existingDigest.overallSentiment as ReviewDigestRawOutput['overallSentiment'],
                        sentimentScore: existingDigest.sentimentScore,
                        topics: existingDigest.topics as ReviewDigestRawOutput['topics'],
                        strengths: existingDigest.strengths,
                        improvements: existingDigest.improvements,
                        actionableTip: existingDigest.actionableTip,
                    },
                };
            }

            return {
                hasEnoughData: true,
                reviewCount: textFeedbacks.length,
                averageRating,
                analyzedAt: null,
                digest: null,
            };
        }

        // 6. Upsert digest to DB
        const now = new Date();
        await this.prisma.feedbackDigest.upsert({
            where: { tenantId },
            create: {
                tenantId,
                contentHash,
                summary: digest.summary,
                overallSentiment: digest.overallSentiment,
                sentimentScore: digest.sentimentScore,
                topics: digest.topics as any,
                strengths: digest.strengths,
                improvements: digest.improvements,
                actionableTip: digest.actionableTip,
                reviewCount: textFeedbacks.length,
                averageRating,
                analyzedAt: now,
            },
            update: {
                contentHash,
                summary: digest.summary,
                overallSentiment: digest.overallSentiment,
                sentimentScore: digest.sentimentScore,
                topics: digest.topics as any,
                strengths: digest.strengths,
                improvements: digest.improvements,
                actionableTip: digest.actionableTip,
                reviewCount: textFeedbacks.length,
                averageRating,
                analyzedAt: now,
            },
        });

        this.logger.log(`Generated fresh digest for tenant ${tenantId} (${textFeedbacks.length} reviews)`);

        return {
            hasEnoughData: true,
            reviewCount: textFeedbacks.length,
            averageRating,
            analyzedAt: now.toISOString(),
            digest,
        };
    }

    /**
     * Deterministic SHA-256 hash of the review corpus.
     * Changes when reviews are added, removed, or modified.
     */
    private computeContentHash(
        feedbacks: { id: string; rating: number; comment: string | null }[],
    ): string {
        const hashPayload = feedbacks
            .map((f) => `${f.id}:${f.rating}:${f.comment?.trim()}`)
            .join('|');
        return createHash('sha256').update(hashPayload).digest('hex');
    }

    private computeAverageRating(
        feedbacks: { rating: number }[],
    ): number {
        if (feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        return Math.round((sum / feedbacks.length) * 100) / 100;
    }

    /**
     * Calls OpenRouter LLM with an 8-second timeout.
     * Returns validated digest or null on failure.
     */
    private async callLlm(
        feedbacks: { rating: number; comment: string | null }[],
        language: string,
    ): Promise<ReviewDigestRawOutput | null> {
        if (!env.OPENROUTER_API_KEY) {
            this.logger.warn('OpenRouter API key is not configured for review digest');
            return null;
        }

        const reviews = feedbacks
            .filter((f) => f.comment && f.comment.trim().length > 0)
            .map((f) => ({ rating: f.rating, comment: f.comment! }));

        const userPrompt = buildReviewDigestUserPrompt(reviews, language);

        let content: string | null = null;

        try {
            const response = await this.client.chat.completions.create(
                {
                    model: this.model,
                    response_format: { type: 'json_object' },
                    temperature: 0.3,
                    max_tokens: 650,
                    messages: [
                        { role: 'system', content: REVIEW_DIGEST_SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                },
                { timeout: 8000 },
            );

            content = response.choices?.[0]?.message?.content ?? null;
        } catch (err) {
            this.logger.warn(
                `Review digest LLM call failed or timed out: ${(err as Error)?.message || 'unknown error'}`,
            );
            return null;
        }

        if (!content) {
            this.logger.warn('Review digest LLM returned empty response');
            return null;
        }

        // Parse and validate with Zod
        try {
            const cleanedContent = content
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();
            const parsed = JSON.parse(cleanedContent);
            const validated = reviewDigestRawOutputSchema.parse(parsed);
            return validated;
        } catch (err) {
            this.logger.warn(
                `Review digest LLM response validation failed: ${(err as Error)?.message}`,
            );
            return null;
        }
    }
}
