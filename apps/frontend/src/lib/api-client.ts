// lib/api-client.ts
import { env } from '@/env';
import { ErrorResponse, SuccessResponse } from '@my-app/types';
import { getSession } from 'next-auth/react';

async function getAuthToken(): Promise<string | undefined> {
    if (typeof window !== 'undefined') {
        const session = await getSession();
        return session?.accessToken as string | undefined;
    } else {
        const { getServerSession } = await import('next-auth/next');
        const { authOptions } = await import('@/features/auth/api/next-auth.config');
        const session = await getServerSession(authOptions);
        return session?.accessToken as string | undefined;
    }
}

// 🔥 1. Описуємо сценарій за замовчуванням (повертає SuccessResponse<T>)
export async function apiClient<T>(
    endpoint: string,
    options?: RequestInit,
    useBaseResType?: true,
): Promise<SuccessResponse<T>>;

// 🔥 2. Описуємо сценарій, коли передано false (повертає просто T)
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit | undefined,
    useBaseResType: false,
): Promise<T>;

// 🔥 3. Сама реалізація функції (її сигнатура об'єднує обидва варіанти)
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {},
    useBaseResType: boolean = true,
): Promise<SuccessResponse<T> | T> {
    const token = await getAuthToken();
    console.log('📝 TOKEN FROM SESSION:', token);

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
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

    // Логіка обробки
    if (useBaseResType) {
        if (json.success === false) {
            throw new Error(json.error || `API Error ${response.status}`);
        }
        return json as SuccessResponse<T>;
    }

    return json as T;
}
