import { env } from '@/env';
import { ErrorResponse, SuccessResponse } from '@my-app/types';

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<SuccessResponse<T>> => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = '/login';
            return new Promise(() => {});
        }

        let errorData: Partial<ErrorResponse> = {};
        try {
            errorData = await response.json();
        } catch (e) {
            console.error('Failed to parse error response');
        }

        throw new Error(errorData.error || `API Error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.error || `API Error ${response.status}`);
    }

    return json as SuccessResponse<T>;
};
