'use client';

import { useQuery } from '@tanstack/react-query';

import { DashboardApi } from '../api/dashboard.api';

/**
 * Дані головного дашборду за сьогодні. Опитування кожні 15с, щоб плитки
 * відчувалися "живими" без явного перезавантаження сторінки.
 */
export const useDashboardToday = (tenantId?: string) =>
    useQuery({
        queryKey: ['dashboard', 'today', tenantId],
        queryFn: () => DashboardApi.getToday(tenantId as string),
        enabled: Boolean(tenantId),
        refetchInterval: 15_000,
    });
