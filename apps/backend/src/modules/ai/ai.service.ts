import { BadGatewayException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from 'src/config/env';
import { GENERATE_DISH_SYSTEM_PROMPT, buildGenerateDishUserPrompt } from './prompts/generate-dish.prompt';
import {
    CART_UPSELL_SYSTEM_PROMPT,
    buildCartUpsellUserPrompt,
    filterCandidatesForCart,
} from './prompts/cart-upsell.prompt';
import {
    GenerateDishInput,
    GenerateDishOutput,
    CartUpsellInput,
    CartUpsellResponse,
    CartUpsellRecommendationItem,
    aiCartUpsellRawOutputSchema,
    MenuItemResponse,
    generateDishOutputSchema,
} from '@my-app/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpsellCacheService } from './services/upsell-cache.service';

const UPSELL_KEYWORDS = [
    'dessert',
    'drink',
    'beverage',
    'side',
    'appetizer',
    'starter',
    'snack',
    'sweet',
    'bakery',
    'pastry',
    'coffee',
    'tea',
    'cocktail',
    'wine',
    'beer',
    'десерт',
    'напій',
    'напої',
    'закуск',
    'випічка',
    'солодк',
    'кава',
    'чай',
    'коктейль',
    'вино',
    'пиво',
    'гарнір',
    'салат',
];

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly client: OpenAI;
    private readonly dishModel: string;
    private readonly upsellModel: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: UpsellCacheService,
    ) {
        this.dishModel = env.OPENROUTER_MODEL;
        this.upsellModel = env.OPENROUTER_UPSELL_MODEL || 'openai/gpt-4o-mini';
        this.client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: env.OPENROUTER_API_KEY,
            defaultHeaders: {
                'HTTP-Referer': env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'Qore HoReCa OS',
            },
        });
    }

    async generateDish(dto: GenerateDishInput): Promise<GenerateDishOutput> {
        if (!env.OPENROUTER_API_KEY) {
            throw new InternalServerErrorException('OpenRouter API key is not configured');
        }

        const userPrompt = buildGenerateDishUserPrompt(dto.prompt, dto.language);

        let content: string | null;

        try {
            const response = await this.client.chat.completions.create({
                model: this.dishModel,
                response_format: { type: 'json_object' },
                temperature: 0.7,
                messages: [
                    { role: 'system', content: GENERATE_DISH_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
            });

            content = response.choices?.[0]?.message?.content ?? null;
        } catch {
            throw new BadGatewayException('Failed to reach the AI provider');
        }

        if (!content) {
            throw new InternalServerErrorException('AI provider returned an empty response');
        }

        try {
            const parsed = JSON.parse(content);
            return generateDishOutputSchema.parse(parsed);
        } catch {
            throw new InternalServerErrorException('AI provider returned an invalid response');
        }
    }

    async getCartUpsell(dto: CartUpsellInput): Promise<CartUpsellResponse> {
        const fallbackResponse: CartUpsellResponse = {
            success: true,
            data: { recommendations: [] },
            message: 'No upsell recommendations available',
        };

        try {
            // 1. Check in-memory cache
            const cacheKey = this.cacheService.buildKey(dto.venueSlug, dto.cartItemIds, dto.language);
            const cached = this.cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }

            const tenant = await this.prisma.tenant.findUnique({
                where: { slug: dto.venueSlug },
                select: { id: true },
            });

            if (!tenant) {
                return fallbackResponse;
            }

            // 2. Fetch current items in cart
            const currentCartItems =
                dto.cartItemIds.length > 0
                    ? await this.prisma.menuItem.findMany({
                          where: {
                              id: { in: dto.cartItemIds },
                              tenantId: tenant.id,
                          },
                          include: {
                              category: { select: { id: true, name: true } },
                          },
                      })
                    : [];

            // 3. Fetch candidates from priority categories (NO naive padding to 25)
            const activeCategories = await this.prisma.menuCategory.findMany({
                where: { tenantId: tenant.id, isActive: true },
                select: { id: true, name: true },
            });

            const priorityCategoryIds = activeCategories
                .filter((cat) => {
                    const lower = cat.name.toLowerCase();
                    return UPSELL_KEYWORDS.some((kw) => lower.includes(kw));
                })
                .map((cat) => cat.id);

            let rawCandidates = await this.prisma.menuItem.findMany({
                where: {
                    tenantId: tenant.id,
                    isActive: true,
                    id: { notIn: dto.cartItemIds },
                    ...(priorityCategoryIds.length > 0 ? { categoryId: { in: priorityCategoryIds } } : {}),
                },
                take: 15,
                orderBy: { sortOrder: 'asc' },
                include: {
                    category: { select: { id: true, name: true } },
                    modifiers: {
                        orderBy: { sortOrder: 'asc' },
                        include: { options: { orderBy: { sortOrder: 'asc' } } },
                    },
                },
            });

            // Supplement candidate pool from other active categories if priority categories have few items
            if (rawCandidates.length < 10 && priorityCategoryIds.length > 0) {
                const excludedIds = [...dto.cartItemIds, ...rawCandidates.map((c) => c.id)];
                const additional = await this.prisma.menuItem.findMany({
                    where: {
                        tenantId: tenant.id,
                        isActive: true,
                        id: { notIn: excludedIds },
                    },
                    take: 15 - rawCandidates.length,
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        category: { select: { id: true, name: true } },
                        modifiers: {
                            orderBy: { sortOrder: 'asc' },
                            include: { options: { orderBy: { sortOrder: 'asc' } } },
                        },
                    },
                });
                rawCandidates = [...rawCandidates, ...additional];
            }

            // 4. Deterministic Pre-Filtering Engine (Cap to 8 items, complement rules, sanitizer)
            const candidateContexts = rawCandidates.map((c) => ({
                id: c.id,
                name: c.name,
                categoryName: c.category?.name,
                price: c.price.toString(),
                hasRequiredModifiers: c.modifiers.some((group) => group.minSelections > 0),
                raw: c,
            }));

            const filteredCandidates = filterCandidatesForCart(
                currentCartItems.map((i) => ({ name: i.name, categoryName: i.category?.name })),
                candidateContexts,
                8,
            );

            // 5. Zero-Candidate Early Return ($0, 0ms) - do not cache empty response
            if (filteredCandidates.length === 0) {
                return fallbackResponse;
            }

            if (!env.OPENROUTER_API_KEY) {
                this.logger.warn('OpenRouter API key is not configured for cart upsell');
                return fallbackResponse;
            }

            // 6. Build lean prompt
            const userPrompt = buildCartUpsellUserPrompt(
                currentCartItems.map((item) => ({
                    name: item.name,
                    categoryName: item.category?.name,
                })),
                filteredCandidates,
                dto.language || 'en',
            );

            // 7. Invoke LLM with strict parameters
            let content: string | null = null;
            try {
                const response = await this.client.chat.completions.create(
                    {
                        model: this.upsellModel,
                        response_format: { type: 'json_object' },
                        temperature: 0.2,
                        max_tokens: 250,
                        messages: [
                            { role: 'system', content: CART_UPSELL_SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt },
                        ],
                        reasoning_effort: 'low',
                    },
                    { timeout: 10000 },
                );
                content = response.choices?.[0]?.message?.content ?? null;
            } catch (err) {
                this.logger.warn(
                    `Cart upsell LLM call failed or timed out: ${(err as Error)?.message || 'unknown error'}`,
                );
                return fallbackResponse;
            }

            if (!content) {
                return fallbackResponse;
            }

            // 8. Validate output & deduplicate items
            const cleanedContent = content
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();
            const parsed = JSON.parse(cleanedContent);
            const validated = aiCartUpsellRawOutputSchema.safeParse(parsed);
            if (!validated.success) {
                this.logger.warn(`Cart upsell LLM response validation failed: ${validated.error.message}`);
                return fallbackResponse;
            }

            const candidateMap = new Map(filteredCandidates.map((c) => [c.id, c.raw]));
            const recommendations: CartUpsellRecommendationItem[] = [];
            const seen = new Set<string>();

            for (const rec of validated.data.recommendations) {
                if (seen.has(rec.itemId)) continue;
                const item = candidateMap.get(rec.itemId);
                if (!item) continue;
                seen.add(rec.itemId);

                const hasRequiredModifiers = item.modifiers.some((group) => group.minSelections > 0);

                const formattedItem: MenuItemResponse = {
                    id: item.id,
                    tenantId: item.tenantId,
                    categoryId: item.categoryId,
                    name: item.name,
                    description: item.description,
                    price: item.price.toString(),
                    happyHourPrice: item.happyHourPrice?.toString() ?? null,
                    imageUrl: item.imageUrl,
                    allergens: item.allergens,
                    tags: item.tags,
                    isActive: item.isActive,
                    sortOrder: item.sortOrder,
                    modifiers: item.modifiers.map((group) => ({
                        id: group.id,
                        menuItemId: group.menuItemId,
                        name: group.name,
                        minSelections: group.minSelections,
                        maxSelections: group.maxSelections,
                        sortOrder: group.sortOrder,
                        options: group.options.map((opt) => ({
                            id: opt.id,
                            groupId: opt.groupId,
                            name: opt.name,
                            priceAdjustment: opt.priceAdjustment.toString(),
                            sortOrder: opt.sortOrder,
                        })),
                    })),
                };

                recommendations.push({
                    item: formattedItem,
                    pairingReason: rec.pairingReason,
                    hasRequiredModifiers,
                });
            }

            const finalResponse: CartUpsellResponse = {
                success: true,
                data: { recommendations },
                message:
                    recommendations.length > 0
                        ? 'Upsell recommendations retrieved'
                        : 'No upsell recommendations available',
            };

            // 9. Store in cache only when recommendations exist
            if (recommendations.length > 0) {
                this.cacheService.set(cacheKey, dto.venueSlug, finalResponse);
            }
            return finalResponse;
        } catch (error) {
            this.logger.error(`Error processing cart upsell: ${(error as Error)?.message}`);
            return fallbackResponse;
        }
    }
}
