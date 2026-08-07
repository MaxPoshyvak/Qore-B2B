// lib/api-client.ts
import { env } from '@/env';
import { ErrorResponse, SuccessResponse } from '@my-app/types';
import { getSession } from 'next-auth/react';

// Допоміжна функція для отримання токена в будь-якому середовищі
async function getAuthToken(): Promise<string | undefined> {
    if (typeof window !== 'undefined') {
        // Клієнтське середовище
        const session = await getSession();
        return session?.accessToken as string | undefined;
    } else {
        // Серверне середовище (динамічний імпорт, щоб не ламати клієнтський бандл)
        const { getServerSession } = await import('next-auth/next');
        const { authOptions } = await import('@/features/auth/api/next-auth.config');
        const session = await getServerSession(authOptions);
        return session?.accessToken as string | undefined;
    }
}

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<SuccessResponse<T>> => {
    const token = await getAuthToken();

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    // Додаємо токен для NestJS, якщо юзер авторизований
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers,
        // Залишаємо credentials, якщо NestJS додатково використовує HttpOnly куки для якихось цілей
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

    if (!json.success) {
        throw new Error(json.error || `API Error ${response.status}`);
    }

    return json as SuccessResponse<T>;
};
