'use client';

import { useQuery } from '@tanstack/react-query';

import { AnalyticsApi, type AnalyticsDateRange } from '../api/analytics.service';

export const useAnalyticsOverview = (tenantId?: string, range?: AnalyticsDateRange) =>
    useQuery({
        queryKey: ['analytics', 'overview', tenantId, range],
        queryFn: () => AnalyticsApi.getOverview(tenantId as string, range),
        enabled: Boolean(tenantId),
    });

export const useAnalyticsSales = (tenantId?: string, range?: AnalyticsDateRange) =>
    useQuery({
        queryKey: ['analytics', 'sales', tenantId, range],
        queryFn: () => AnalyticsApi.getSales(tenantId as string, range),
        enabled: Boolean(tenantId),
    });

export const useAnalyticsTraffic = (tenantId?: string, range?: AnalyticsDateRange) =>
    useQuery({
        queryKey: ['analytics', 'traffic', tenantId, range],
        queryFn: () => AnalyticsApi.getTraffic(tenantId as string, range),
        enabled: Boolean(tenantId),
    });
