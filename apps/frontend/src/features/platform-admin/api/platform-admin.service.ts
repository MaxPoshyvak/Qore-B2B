import { apiClient } from '@/lib/api-client';
import type { PlatformStatsResponse } from '@my-app/types';

export const PLATFORM_TOKEN_KEY = 'qore_master_token';

export const PlatformAdminApi = {
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(PLATFORM_TOKEN_KEY);
    },

    setToken(token: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(PLATFORM_TOKEN_KEY, token);
        document.cookie = `qore_owner_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax; Secure`;
    },

    clearToken() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(PLATFORM_TOKEN_KEY);
        document.cookie = 'qore_owner_token=; path=/; max-age=0; SameSite=Lax; Secure';
    },

    async login(password: string): Promise<{ token: string; expiresIn: number }> {
        const res = await apiClient<{ token: string; expiresIn: number }>(
            '/platform-admin/login',
            {
                method: 'POST',
                body: JSON.stringify({ password }),
            },
            false,
        );
        if (res.token) {
            this.setToken(res.token);
        }
        return res;
    },

    async checkMe(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;
        try {
            await apiClient(
                '/platform-admin/me',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'x-platform-admin-token': token,
                    },
                    allow401: true,
                } as any,
                false,
            );
            return true;
        } catch {
            this.clearToken();
            return false;
        }
    },

    async getStats(): Promise<PlatformStatsResponse> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated as platform owner');
        return apiClient<PlatformStatsResponse>(
            '/platform-admin/stats',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-platform-admin-token': token,
                },
                allow401: true,
            } as any,
            false,
        );
    },
};
