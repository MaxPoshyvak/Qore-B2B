'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage, type HappyHourRuleResponse } from '@my-app/types';
import { toast } from '@/shared/ui/Toaster';

import { HappyHourApi } from '../api/happy-hour.service';

const rulesKey = (tenantId: string) => ['happy-hour', 'rules', tenantId] as const;

/** Усі правила Happy Hour веню для дашборду власника. */
export const useHappyHours = (tenantId?: string) =>
    useQuery({
        queryKey: rulesKey(tenantId ?? ''),
        queryFn: () => HappyHourApi.getRules(tenantId as string),
        enabled: Boolean(tenantId),
    });

/** Створення нового правила Happy Hour. */
export const useCreateHappyHour = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof HappyHourApi.createRule>[1]) =>
            HappyHourApi.createRule(tenantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rulesKey(tenantId) });
            toast.success('Happy hour rule created');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
};

/** Оновлення існуючого правила Happy Hour. */
export const useUpdateHappyHour = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation<
        HappyHourRuleResponse,
        Error,
        { id: string; data: Parameters<typeof HappyHourApi.updateRule>[2] },
        { previous?: HappyHourRuleResponse[] }
    >({
        mutationFn: (input: { id: string; data: Parameters<typeof HappyHourApi.updateRule>[2] }) =>
            HappyHourApi.updateRule(tenantId, input.id, input.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rulesKey(tenantId) });
            toast.success('Happy hour rule updated');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
};

/** Видалення правила Happy Hour. */
export const useDeleteHappyHour = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => HappyHourApi.deleteRule(tenantId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rulesKey(tenantId) });
            toast.success('Happy hour rule deleted');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
};
