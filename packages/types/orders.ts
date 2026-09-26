import { z } from 'zod';
import type { MenuItemResponse, SelectedModifier } from './menu';

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export const ORDER_STATUSES = ['new', 'preparing', 'ready', 'delivered', 'cancelled'] as const;
export type OrderStatusType = (typeof ORDER_STATUSES)[number];

/* ------------------------------------------------------------------ */
/*  Order DTOs                                                        */
/* ------------------------------------------------------------------ */

export const createOrderSchema = z.object({
    cartSessionId: z.string().min(1, 'Cart session id is required'),
    /** Guest-visible name for the receipt — required for takeaway/order-ahead. */
    customerName: z.string().optional(),
    pickupTime: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
    status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

/* ------------------------------------------------------------------ */
/*  Order API response contracts                                      */
/* ------------------------------------------------------------------ */

export interface OrderItemResponse {
    id: string;
    orderId: string;
    menuItemId: string;
    menuItem: MenuItemResponse | null;
    quantity: number;
    /** Persisted unit price (Decimal serialized to string over HTTP). */
    priceAtOrder: string;
    /** Історичний знімок модифікаторів цього рядка чека. */
    selectedModifiers: SelectedModifier[] | null;
    guestSessionId: string | null;
    guestName: string | null;
    paidByGuestId: string | null;
    isLockedForPayment: boolean;
    lockedAt: string | null;
}

export interface OrderTableResponse {
    id: string;
    name: string;
    capacity: number;
}

/* ------------------------------------------------------------------ */
/*  Public order tracking (guest-facing, minimal payload)             */
/* ------------------------------------------------------------------ */

export interface PublicOrderItemResponse {
    id: string;
    menuItemName: string;
    quantity: number;
    /** Persisted unit price (Decimal → number for the tracking view). */
    priceAtOrder: number;
    /** Обрані модифікатори — щоб гість бачив, що саме він замовив. */
    selectedModifiers: SelectedModifier[];
}

export interface PublicOrderResponse {
    id: string;
    status: OrderStatusType;
    paymentStatus: string;
    isOrderAhead: boolean;
    /** Decimal → number. */
    totalAmount: number;
    paidAmount: number;
    paymentMethod?: string | null;
    items: PublicOrderItemResponse[];
    createdAt: string;
}

export interface OrderResponse {
    id: string;
    tenantId: string;
    tableId: string | null;
    status: OrderStatusType;
    paymentStatus: string;
    paidAmount: string;
    paymentMethod: string | null;
    isOrderAhead: boolean;
    pickupAt: string | null;
    /** Decimal serialized to string over HTTP. */
    totalAmount: string;
    items: OrderItemResponse[];
    table: OrderTableResponse | null;
    createdAt: string;
    updatedAt: string;
}
