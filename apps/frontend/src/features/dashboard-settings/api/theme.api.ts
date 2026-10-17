import { apiClient } from '@/lib/api-client';
import type {
    ThemeConfig,
    UpdateTenantThemeDto,
    GenerateThemeInput,
    GenerateThemeOutput,
} from '@my-app/types';

export class ThemeApi {
    static async get(slug: string): Promise<ThemeConfig> {
        const res = await apiClient<ThemeConfig>(`/tenants/${slug}/theme`, {
            method: 'GET',
        });
        return res.data;
    }

    static async update(
        slug: string,
        data: UpdateTenantThemeDto,
    ): Promise<{ id: string; themeConfig: ThemeConfig; isAiGenerated: boolean }> {
        const res = await apiClient<{ id: string; themeConfig: ThemeConfig; isAiGenerated: boolean }>(
            `/tenants/${slug}/theme`,
            {
                method: 'PATCH',
                body: JSON.stringify(data),
            },
        );
        return res.data;
    }

    static async generate(data: GenerateThemeInput): Promise<GenerateThemeOutput> {
        const res = await apiClient<GenerateThemeOutput>('/ai/generate-theme', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.data;
    }
}
