'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    type CreateEqualSplitPaymentDto,
    type CreateItemSplitPaymentDto,
    type CreateOrderPaymentDto,
    type OrderBillStatusResponse,
    type OrderPaymentSessionResponse,
    type VerifyOrderPaymentDto,
    type VerifyPaymentResponse,
} from '@my-app/types';
import { PaymentsApi } from '../api/payments.api';

export const billKey = (orderId: string) => ['order-bill', orderId] as const;

/**
 * Polls the live bill status (total, paid, remaining, item locks) every 3 seconds
 * for a live multi-guest dining experience. Stops polling once fully paid.
 */
export const useOrderBill = (orderId: string | undefined, guestSessionId?: string) => {
    return useQuery<OrderBillStatusResponse>({
        queryKey: ['order-bill', orderId, guestSessionId],
        queryFn: () => PaymentsApi.getBillStatus(orderId as string, guestSessionId),
        enabled: Boolean(orderId),
        refetchInterval: (query) => {
            const status = query.state.data?.paymentStatus;
            return status === 'paid' ? false : 3000;
        },
    });
};

export const useCreateFullPayment = (orderId: string) => {
    return useMutation<OrderPaymentSessionResponse, Error, CreateOrderPaymentDto>({
        mutationFn: (dto) => PaymentsApi.payFull(orderId, dto),
    });
};

export const useCreateEqualSplit = (orderId: string) => {
    return useMutation<OrderPaymentSessionResponse, Error, CreateEqualSplitPaymentDto>({
        mutationFn: (dto) => PaymentsApi.splitEqual(orderId, dto),
    });
};

export const useCreateItemSplit = (orderId: string) => {
    const queryClient = useQueryClient();

    return useMutation<OrderPaymentSessionResponse, Error, CreateItemSplitPaymentDto>({
        mutationFn: (dto) => PaymentsApi.splitByItems(orderId, dto),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: billKey(orderId) });
        },
    });
};

export const useUnlockItems = (orderId: string) => {
    const queryClient = useQueryClient();

    return useMutation<{ unlocked: number }, Error, string>({
        mutationFn: (guestSessionId) => PaymentsApi.unlockItems(orderId, guestSessionId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: billKey(orderId) });
        },
    });
};

export const useVerifyOrderPayment = (orderId: string) => {
    const queryClient = useQueryClient();

    return useMutation<VerifyPaymentResponse, Error, VerifyOrderPaymentDto>({
        mutationFn: (dto) => PaymentsApi.verifySession(orderId, dto),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: billKey(orderId) });
            queryClient.invalidateQueries({ queryKey: ['order-tracking', orderId] });
        },
    });
};
