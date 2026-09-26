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
            toast.success('Happy hour rule created');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: rulesKey(tenantId) });
            queryClient.invalidateQueries({ queryKey: ['public-happy-hour'] });
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
};

/** Оновлення існуючого правила Happy Hour (з оптимістичним оновленням для миттєвого перемикання). */
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
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: rulesKey(tenantId) });

            const previous = queryClient.getQueryData<HappyHourRuleResponse[]>(rulesKey(tenantId));

            queryClient.setQueryData<HappyHourRuleResponse[]>(rulesKey(tenantId), (old) => {
                if (!old) return old;
                return old.map((rule) => {
                    if (rule.id !== id) return rule;
                    return {
                        ...rule,
                        ...(data.name !== undefined ? { name: data.name } : {}),
                        ...(data.daysOfWeek !== undefined ? { daysOfWeek: data.daysOfWeek } : {}),
                        ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
                        ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
                        ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
                        ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
                        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
                    };
                });
            });

            return { previous };
        },
        onSuccess: (_res, variables) => {
            if (variables.data.isActive !== undefined && Object.keys(variables.data).length === 1) {
                toast.success(variables.data.isActive ? 'Happy Hour activated' : 'Happy Hour paused');
            } else {
                toast.success('Happy hour rule updated');
            }
        },
        onError: (error, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(rulesKey(tenantId), context.previous);
            }
            toast.error(getErrorMessage(error));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: rulesKey(tenantId) });
            queryClient.invalidateQueries({ queryKey: ['public-happy-hour'] });
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        },
    });
};

/** Видалення правила Happy Hour (з оптимістичним видаленням з кешу). */
export const useDeleteHappyHour = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation<{ id: string }, Error, string, { previous?: HappyHourRuleResponse[] }>({
        mutationFn: (id: string) => HappyHourApi.deleteRule(tenantId, id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: rulesKey(tenantId) });
            const previous = queryClient.getQueryData<HappyHourRuleResponse[]>(rulesKey(tenantId));

            queryClient.setQueryData<HappyHourRuleResponse[]>(rulesKey(tenantId), (old) =>
                old ? old.filter((rule) => rule.id !== id) : old,
            );

            return { previous };
        },
        onSuccess: () => {
            toast.success('Happy hour rule deleted');
        },
        onError: (error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(rulesKey(tenantId), context.previous);
            }
            toast.error(getErrorMessage(error));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: rulesKey(tenantId) });
            queryClient.invalidateQueries({ queryKey: ['public-happy-hour'] });
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        },
    });
};
