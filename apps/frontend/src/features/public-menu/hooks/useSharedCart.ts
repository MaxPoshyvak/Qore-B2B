'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    buildCartItemConfigKey,
    parseSelectedModifiers,
    type AddCartItemDto,
    type CartItemResponse,
    type CartSessionResponse,
    type MenuItemResponse,
    type ModifierOptionResponse,
    type UpdateCartItemDto,
} from '@my-app/types';
import { CartApi } from '../api/cart.api';
import { useCartStore } from '../store/useCartStore';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';

type CartMutationContext = { previousCart?: CartSessionResponse };

/** Страва, сконфігурована гостем у `GuestItemModal`, готова до відправки. */
export type ConfiguredCartAddition = {
    item: MenuItemResponse;
    /** Повний перелік обраних опцій модифікаторів. */
    selectedOptions: ModifierOptionResponse[];
    /** Ціна однієї одиниці: база + сума `priceAdjustment` обраних опцій. */
    unitPrice: number;
    quantity: number;
    guestSessionId: string;
    guestName: string;
};

/** Resolves the cache key shared by the query and its mutations for a given cart. */
const cartKey = (tableId: string | null, sessionId: string | null) => sessionId ?? tableId;

/**
 * Live shared cart — polls every 3s for a real-time feel.
 * - Dine-in:  polls `GET /cart/table/:tableId`.
 * - Takeaway: polls `GET /cart/session/:sessionId`.
 */
export const useSharedCart = (tableId: string | null, sessionId: string | null = null) => {
    const key = cartKey(tableId, sessionId);
    return useQuery({
        queryKey: ['shared-cart', key],
        queryFn: () =>
            sessionId ? CartApi.getSessionById(sessionId) : CartApi.getSession(tableId as string),
        enabled: Boolean(key),
        refetchInterval: 3000,
    });
};

export const useAddCartItem = (tableId: string | null, sessionId: string | null = null) => {
    const queryClient = useQueryClient();
    const key = cartKey(tableId, sessionId);

    return useMutation<CartSessionResponse, Error, AddCartItemDto, CartMutationContext>({
        mutationFn: (dto: AddCartItemDto) =>
            sessionId ? CartApi.addItemBySession(sessionId, dto) : CartApi.addItem(tableId as string, dto),
        onMutate: async (dto) => {
            if (!key) return {};
            await queryClient.cancelQueries({ queryKey: ['shared-cart', key] });

            const previousCart = queryClient.getQueryData<CartSessionResponse>(['shared-cart', key]);

            queryClient.setQueryData<CartSessionResponse>(['shared-cart', key], (old) => {
                if (!old) return old;

                const items = [...old.items];
                /*
                 * Оптимістичне злиття мусить повторювати серверну логіку:
                 * позиції зливаються лише за ІДЕНТИЧНОЮ конфігурацією опцій,
                 * інакше UI на мить показав би «×2» там, де насправді два
                 * різні рядки, і блимнув би після рефетчу.
                 */
                const incomingKey = buildCartItemConfigKey(dto.menuItemId, dto.selectedOptionIds);
                const existing = items.find(
                    (i) =>
                        i.guestSessionId === dto.guestSessionId &&
                        buildCartItemConfigKey(
                            i.menuItemId,
                            parseSelectedModifiers(i.selectedModifiers).map((m) => m.id),
                        ) === incomingKey,
                );

                if (existing) {
                    return {
                        ...old,
                        items: items.map((i) =>
                            i.id === existing.id ? { ...i, quantity: i.quantity + dto.quantity } : i,
                        ),
                    };
                }

                const mockItem: CartItemResponse = {
                    id: `temp-${incomingKey}-${dto.guestSessionId}`,
                    cartSessionId: old.id,
                    menuItemId: dto.menuItemId,
                    menuItem: null,
                    quantity: dto.quantity,
                    /*
                     * Назви й надбавки знає лише сервер, тому тут `null`:
                     * рядок домалюється точними даними після `onSettled`.
                     */
                    selectedModifiers: null,
                    guestSessionId: dto.guestSessionId,
                    guestName: dto.guestName,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                return { ...old, items: [...items, mockItem] };
            });

            return { previousCart };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(['shared-cart', key], context.previousCart);
            }
        },
        onSettled: () => {
            if (key) queryClient.invalidateQueries({ queryKey: ['shared-cart', key] });
        },
    });
};

/**
 * Додає у кошик страву, сконфігурувану в `GuestItemModal`.
 *
 * На сервер летять ЛИШЕ `selectedOptionIds`: назви та надбавки бекенд читає з
 * `ModifierOption` і сам збирає знімок, тому підмінити ціну з клієнта не вийде.
 * `unitPrice` тут — суто для оптимістичного UI та аналітики.
 */
export const useAddConfiguredCartItem = (tableId: string | null, sessionId: string | null = null) => {
    const addItem = useAddCartItem(tableId, sessionId);

    return {
        ...addItem,
        addConfigured: (addition: ConfiguredCartAddition) =>
            addItem.mutate({
                menuItemId: addition.item.id,
                quantity: addition.quantity,
                guestSessionId: addition.guestSessionId,
                guestName: addition.guestName,
                selectedOptionIds: addition.selectedOptions.map((option) => option.id),
            }),
    };
};

export const useUpdateCartItem = (tableId: string | null, sessionId: string | null = null) => {    const queryClient = useQueryClient();
    const key = cartKey(tableId, sessionId);

    return useMutation<CartItemResponse | null, Error, { itemId: string; dto: UpdateCartItemDto }, CartMutationContext>({
        mutationFn: ({ itemId, dto }: { itemId: string; dto: UpdateCartItemDto }) =>
            CartApi.updateItem(itemId, dto),
        onMutate: async ({ itemId, dto }) => {
            if (!key) return {};
            await queryClient.cancelQueries({ queryKey: ['shared-cart', key] });

            const previousCart = queryClient.getQueryData<CartSessionResponse>(['shared-cart', key]);

            queryClient.setQueryData<CartSessionResponse>(['shared-cart', key], (old) => {
                if (!old) return old;

                // Remove when quantity hits zero, otherwise update in place.
                const items =
                    dto.quantity === 0
                        ? old.items.filter((i) => i.id !== itemId)
                        : old.items.map((i) => (i.id === itemId ? { ...i, quantity: dto.quantity } : i));

                return { ...old, items };
            });

            return { previousCart };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(['shared-cart', key], context.previousCart);
            }
        },
        onSettled: () => {
            if (key) queryClient.invalidateQueries({ queryKey: ['shared-cart', key] });
        },
    });
};

export const useRemoveCartItem = (tableId: string | null, sessionId: string | null = null) => {
    const queryClient = useQueryClient();
    const key = cartKey(tableId, sessionId);

    return useMutation<CartItemResponse, Error, { itemId: string; guestSessionId: string }, CartMutationContext>({
        mutationFn: ({ itemId, guestSessionId }: { itemId: string; guestSessionId: string }) =>
            CartApi.removeItem(itemId, guestSessionId),
        onMutate: async ({ itemId }) => {
            if (!key) return {};
            await queryClient.cancelQueries({ queryKey: ['shared-cart', key] });

            const previousCart = queryClient.getQueryData<CartSessionResponse>(['shared-cart', key]);

            queryClient.setQueryData<CartSessionResponse>(['shared-cart', key], (old) => {
                if (!old) return old;

                return { ...old, items: old.items.filter((i) => i.id !== itemId) };
            });

            return { previousCart };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(['shared-cart', key], context.previousCart);
            }
        },
        onSettled: () => {
            if (key) queryClient.invalidateQueries({ queryKey: ['shared-cart', key] });
        },
    });
};

/** Dine-in only: toggles the current guest's readiness (no-op in takeaway mode). */
export const useToggleCartReady = (tableId: string) => {
    const queryClient = useQueryClient();

    return useMutation<CartSessionResponse, Error, string, CartMutationContext>({
        mutationFn: (guestSessionId: string) => CartApi.toggleCartReady(tableId, guestSessionId),
        // Повертаємо й `createdOrderId`, щоб сторінка могла перенаправити гостя
        // на трекінг замовлення (лише той гість, що «закрив» замовлення).
        onSuccess: (data) => {
            if (data.createdOrderId) {
                queryClient.setQueryData<string>(['last-created-order', tableId], data.createdOrderId);
            }
        },
        onMutate: async (guestSessionId) => {
            await queryClient.cancelQueries({ queryKey: ['shared-cart', tableId] });

            const previousCart = queryClient.getQueryData<CartSessionResponse>(['shared-cart', tableId]);

            queryClient.setQueryData<CartSessionResponse>(['shared-cart', tableId], (old) => {
                if (!old) return old;

                const confirmed = old.confirmedGuests ?? [];
                const next = confirmed.includes(guestSessionId)
                    ? confirmed.filter((id) => id !== guestSessionId)
                    : [...confirmed, guestSessionId];

                return { ...old, confirmedGuests: next };
            });

            return { previousCart };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(['shared-cart', tableId], context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['shared-cart', tableId] });
        },
    });
};

/** Creates a takeaway (single-player) cart session and stores its id locally. */
export const useCreateTakeawaySession = () => {
    const queryClient = useQueryClient();
    const setTakeawaySessionId = useCartStore((s) => s.setTakeawaySessionId);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);
    const ensureGuestSessionId = useTableSessionStore((s) => s.ensureGuestSessionId);

    return useMutation<CartSessionResponse, Error, void, unknown>({
        mutationFn: () => CartApi.createTakeawaySession(),
        onSuccess: (session) => {
            // Takeaway guests never scan a table, so their identity is minted here.
            ensureGuestSessionId();
            setTakeawaySessionId(session.id);
            setOrderTypeModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['shared-cart', session.id] });
        },
    });
};

/**
 * "Start new order" for a dine-in table: asks the API for a fresh ACTIVE session and
 * refreshes the shared cart cache. The local table session (table id, guest identity,
 * guest name) is intentionally left untouched — the guest is still sitting at the table.
 */
export const useStartNewCartSession = (tableId: string | null) => {
    const queryClient = useQueryClient();

    return useMutation<CartSessionResponse, Error, void, unknown>({
        mutationFn: () => CartApi.startNewSession(tableId as string),
        onSuccess: (session) => {
            if (!tableId) return;
            // Paint the fresh (empty, active) cart immediately, then re-sync.
            queryClient.setQueryData<CartSessionResponse>(['shared-cart', tableId], session);
        },
        onSettled: () => {
            if (tableId) queryClient.invalidateQueries({ queryKey: ['shared-cart', tableId] });
        },
    });
};
