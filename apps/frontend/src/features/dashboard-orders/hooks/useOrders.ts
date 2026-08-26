'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CreateOrderDto, type OrderResponse, type OrderStatusType } from '@my-app/types';
import { OrdersApi } from '../api/orders.api';
import { useKdsStore } from '@/shared/store/useKdsStore';
import { ApiError } from '@/lib/api-client';

const activeOrdersKey = (tenantId: string) => ['orders', 'active', tenantId] as const;

/** Polls live orders every 5s for a near-real-time kitchen view. */
export const useActiveOrders = (tenantId: string | undefined) => {
    return useQuery({
        queryKey: activeOrdersKey(tenantId ?? ''),
        queryFn: () => OrdersApi.getActive(tenantId as string),
        enabled: Boolean(tenantId),
        refetchInterval: 5000,
    });
};

export const useUpdateOrderStatus = (
    tenantId: string,
    mutateFn?: (vars: { orderId: string; status: OrderStatusType }) => Promise<OrderResponse>,
) => {
    const queryClient = useQueryClient();
    const key = activeOrdersKey(tenantId);

    return useMutation({
        mutationFn: mutateFn ?? (({ orderId, status }) => OrdersApi.updateStatus(tenantId, orderId, status)),
        onMutate: async ({ orderId, status }) => {
            await queryClient.cancelQueries({ queryKey: key });

            const previous = queryClient.getQueryData<OrderResponse[]>(key);

            queryClient.setQueryData<OrderResponse[]>(key, (old) =>
                old?.map((order) => (order.id === orderId ? { ...order, status } : order)) ?? old,
            );

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(key, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key });
        },
    });
};

/**
 * Public guest checkout (takeaway / dine-in). Creates an Order from the cart session
 * and closes that session so it can't be submitted twice. `onSuccess` handles the
 * local side-effects (clearing the session id + re-syncing the cart query).
 */
export const useCreatePublicOrder = () => {
    const queryClient = useQueryClient();

    return useMutation<OrderResponse, Error, CreateOrderDto>({
        mutationFn: (dto) => OrdersApi.createPublicOrder(dto),
        onSuccess: (_order, dto) => {
            if (dto.cartSessionId) {
                queryClient.invalidateQueries({ queryKey: ['shared-cart', dto.cartSessionId] });
            }
        },
    });
};

const kdsOrdersKey = (token: string) => ['orders', 'kds', token] as const;

/** Live orders for the isolated KDS board, authenticated by token + PIN header. */
export const useKdsOrders = (token: string, pin: string | null) => {
    const key = kdsOrdersKey(token);
    return useQuery({
        queryKey: key,
        queryFn: () => OrdersApi.getKdsOrders(token, pin as string),
        enabled: Boolean(token && pin),
        refetchInterval: 5000,
        retry: false,
    });
};

/**
 * Advances an order's status from the KDS board. On a 401 the PIN is rejected, so we
 * clear it from the store and let the lock screen re-appear.
 */
export const useUpdateKdsOrderStatus = (token: string, pin: string | null) => {
    const queryClient = useQueryClient();
    const key = kdsOrdersKey(token);
    const clearPin = useKdsStore.getState().clearPin;

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatusType }) =>
            OrdersApi.updateKdsStatus(token, pin as string, orderId, status),
        onMutate: async ({ orderId, status }) => {
            await queryClient.cancelQueries({ queryKey: key });

            const previous = queryClient.getQueryData<OrderResponse[]>(key);

            queryClient.setQueryData<OrderResponse[]>(key, (old) =>
                old?.map((order) => (order.id === orderId ? { ...order, status } : order)) ?? old,
            );

            return { previous };
        },
        onError: (err: Error) => {
            const status = err instanceof ApiError ? err.status : 0;
            if (status === 401 || /401|unauthorized/i.test(err.message)) {
                clearPin();
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key });
        },
    });
};
