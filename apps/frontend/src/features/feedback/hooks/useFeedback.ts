'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FeedbackApi, type SubmitFeedbackInput } from '../api/feedback.api';

const publicFeedbacksKey = (slug: string) => ['feedbacks', 'public', slug] as const;
const dashboardFeedbacksKey = (tenantId: string) => ['feedbacks', 'dashboard', tenantId] as const;

/** Опубліковані відгуки публічної сторінки веню. */
export const usePublicFeedbacks = (slug: string) =>
    useQuery({
        queryKey: publicFeedbacksKey(slug),
        queryFn: () => FeedbackApi.getPublicFeedbacks(slug),
        enabled: Boolean(slug),
    });

/** Усі відгуки веню для дашборду власника. */
export const useDashboardFeedbacks = (tenantId?: string) =>
    useQuery({
        queryKey: dashboardFeedbacksKey(tenantId ?? ''),
        queryFn: () => FeedbackApi.getDashboardFeedbacks(tenantId as string),
        enabled: Boolean(tenantId),
    });

/** Створення відгуку гостем (публічний потік). */
export const useSubmitFeedback = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: SubmitFeedbackInput) => FeedbackApi.submitFeedback(slug, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedbacks', 'public', slug] });
        },
    });
};

/** Схвалення прихованого відгуку власником. */
export const useApproveFeedback = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (feedbackId: string) => FeedbackApi.approveFeedback(tenantId, feedbackId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedbacks', 'dashboard', tenantId] });
        },
    });
};
