'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { type GenerateDishInput, type GenerateDishOutput } from '@my-app/types';

/**
 * Mutation wrapper around `POST /ai/generate-dish`.
 *
 * The backend enforces a PRO plan and rate limits (5 req/min). Callers should
 * inspect `error` (an `ApiError`) to surface the right UX:
 *  - status 403 with `data.code === 'PRO_PLAN_REQUIRED'` → open the upgrade dialog
 *  - status 429 → "Too many requests" message
 */
export const useGenerateDish = () => {
    return useMutation<GenerateDishOutput, unknown, GenerateDishInput>({
        mutationFn: async (input) => {
            const res = await apiClient<GenerateDishOutput>('/ai/generate-dish', {
                method: 'POST',
                body: JSON.stringify(input),
            });
            return res.data;
        },
    });
};
