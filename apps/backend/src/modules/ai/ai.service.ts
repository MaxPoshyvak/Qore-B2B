import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from 'src/config/env';
import { GENERATE_DISH_SYSTEM_PROMPT, buildGenerateDishUserPrompt } from './prompts/generate-dish.prompt';
import { generateDishOutputSchema, GenerateDishInput, GenerateDishOutput } from '@my-app/types';

@Injectable()
export class AiService {
    private readonly client: OpenAI;
    private readonly model: string;

    constructor() {
        this.model = env.OPENROUTER_MODEL;
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
                model: this.model,
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
}
