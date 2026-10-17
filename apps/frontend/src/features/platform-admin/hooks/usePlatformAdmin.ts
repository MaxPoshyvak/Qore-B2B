'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { PlatformAdminApi } from '../api/platform-admin.service';
import type { PlatformStatsResponse } from '@my-app/types';

export function usePlatformAuth() {
    const queryClient = useQueryClient();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        let mounted = true;
        PlatformAdminApi.checkMe().then((authed) => {
            if (mounted) setIsAuthenticated(authed);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const logout = () => {
        PlatformAdminApi.clearToken();
        setIsAuthenticated(false);
        queryClient.removeQueries({ queryKey: ['platform-stats'] });
    };

    return {
        isAuthenticated,
        setIsAuthenticated,
        logout,
    };
}

export function usePlatformStats(enabled: boolean) {
    return useQuery<PlatformStatsResponse>({
        queryKey: ['platform-stats'],
        queryFn: () => PlatformAdminApi.getStats(),
        enabled,
        refetchInterval: 15000, // 15 seconds real-time live pulse
        staleTime: 5000,
    });
}

export function usePlatformLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (password: string) => PlatformAdminApi.login(password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
        },
    });
}
