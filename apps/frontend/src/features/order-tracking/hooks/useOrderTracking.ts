'use client';

import { useQuery } from '@tanstack/react-query';

import { OrderTrackingApi } from '../api/order-tracking.api';

/**
 * Полінг публічного замовлення кожні 5с. Зупиняємо опитування,
 * коли замовлення доставлено або скасовано (фінальні стани).
 */
export const useOrderTracking = (orderId: string | undefined) =>
    useQuery({
        queryKey: ['order-tracking', orderId],
        queryFn: () => OrderTrackingApi.getPublicOrder(orderId as string),
        enabled: Boolean(orderId),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === 'delivered' || status === 'cancelled') return false;
            return 5000;
        },
    });
