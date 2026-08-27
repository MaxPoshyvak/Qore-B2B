'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReservationsApi } from '../api/reservations.api';
import { type CreateReservationDto, type UpdateReservationDto } from '@my-app/types';

const tenantReservationsKey = (tenantId: string) => ['reservations', tenantId] as const;

export const useAvailability = (slug: string, date: string | null) => {
    return useQuery({
        queryKey: ['reservations', 'availability', slug, date],
        queryFn: () => ReservationsApi.getAvailability(slug, date as string),
        enabled: Boolean(slug && date),
    });
};

export const useCreateReservation = (slug: string) => {
    return useMutation({
        mutationFn: (dto: CreateReservationDto) => ReservationsApi.create(slug, dto),
    });
};

export const useCancelReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ReservationsApi.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
};

export const useTenantReservations = (tenantId: string | undefined) => {
    return useQuery({
        queryKey: tenantReservationsKey(tenantId ?? ''),
        queryFn: () => ReservationsApi.getByTenant(tenantId as string),
        enabled: Boolean(tenantId),
    });
};

export const useUpdateReservation = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateReservationDto }) =>
            ReservationsApi.update(tenantId, id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
};

export const useTableUpcomingReservation = (slug: string, tableId: string | null) => {
    return useQuery({
        queryKey: ['reservations', 'table-upcoming', slug, tableId],
        queryFn: () => ReservationsApi.getTableUpcoming(slug, tableId as string),
        enabled: Boolean(slug && tableId),
        refetchInterval: 60_000,
    });
};
