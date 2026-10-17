// lib/api-client.ts
import { env } from '@/env';
import { ErrorResponse, SuccessResponse } from '@my-app/types';
import { getSession } from 'next-auth/react';

/** Error thrown by `apiClient` that carries the originating HTTP status code. */
export class ApiError extends Error {
    status: number;
    /** Raw parsed error body from the API (e.g. `{ code, message }`). */
    data?: unknown;
    constructor(status: number, message: string, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

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
    const isPublicAuthEndpoint =
        endpoint.startsWith('/auth/register') ||
        endpoint.startsWith('/auth/login') ||
        endpoint.startsWith('/auth/forgot-password') ||
        endpoint.startsWith('/auth/reset-password');

    const isPlatformAdminEndpoint = endpoint.startsWith('/platform-admin');

    const token = (isPublicAuthEndpoint || isPlatformAdminEndpoint) ? undefined : await getAuthToken();

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const signal = options.signal ?? AbortSignal.timeout(15000);

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers,
        signal,
        credentials: 'include',
    });

    const isPublicEndpoint =
        isPublicAuthEndpoint ||
        endpoint.includes('/public') ||
        endpoint.startsWith('/cart') ||
        endpoint.startsWith('/payments');

    // KDS endpoints authenticate with Magic-Link token + PIN header.
    // Public guest routes (menus, reviews, tables, bookings) don't require dashboard sessions.
    // Only authenticated dashboard views should bounce to /login when a session expires.
    const allow401 = (options as { allow401?: boolean }).allow401 === true;
    const isDashboardRoute =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');

    if (!response.ok) {
        if (response.status === 401 && !allow401 && !isPublicEndpoint && isDashboardRoute) {
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

        throw new ApiError(
            response.status,
            errorData.error || `API Error ${response.status}: ${response.statusText}`,
            errorData,
        );
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
