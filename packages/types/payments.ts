import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Enums & Types                                                     */
/* ------------------------------------------------------------------ */

export const PAYMENT_STATUSES = ['pending', 'partially_paid', 'paid', 'failed'] as const;
export type PaymentStatusType = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_TRANSACTION_STATUSES = ['pending', 'succeeded', 'failed', 'cancelled'] as const;
export type PaymentTransactionStatusType = (typeof PAYMENT_TRANSACTION_STATUSES)[number];

export const SPLIT_TYPES = ['full', 'equal', 'by_item', 'custom'] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];

/* ------------------------------------------------------------------ */
/*  Order Payment DTOs (Zod Schemas)                                  */
/* ------------------------------------------------------------------ */

export const createOrderPaymentSchema = z.object({
    tipAmount: z.number().nonnegative().default(0),
    guestSessionId: z.string().optional(),
    guestName: z.string().optional(),
    originUrl: z.string().url().optional(),
});
export type CreateOrderPaymentDto = z.infer<typeof createOrderPaymentSchema>;

export const createEqualSplitPaymentSchema = z.object({
    totalParts: z.number().int().min(2, 'Must be at least 2 people').max(12, 'Maximum 12 people'),
    tipAmount: z.number().nonnegative().default(0),
    guestSessionId: z.string().min(1, 'Guest session ID is required'),
    guestName: z.string().optional(),
    originUrl: z.string().url().optional(),
});
export type CreateEqualSplitPaymentDto = z.infer<typeof createEqualSplitPaymentSchema>;

export const createItemSplitPaymentSchema = z.object({
    itemIds: z.array(z.string().min(1)).min(1, 'Select at least one item to pay'),
    tipAmount: z.number().nonnegative().default(0),
    guestSessionId: z.string().min(1, 'Guest session ID is required'),
    guestName: z.string().optional(),
    originUrl: z.string().url().optional(),
});
export type CreateItemSplitPaymentDto = z.infer<typeof createItemSplitPaymentSchema>;

export const unlockSplitItemsSchema = z.object({
    guestSessionId: z.string().min(1, 'Guest session ID is required'),
});
export type UnlockSplitItemsDto = z.infer<typeof unlockSplitItemsSchema>;

export const verifyOrderPaymentSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
});
export type VerifyOrderPaymentDto = z.infer<typeof verifyOrderPaymentSchema>;

/* ------------------------------------------------------------------ */
/*  Order Bill & Payment Responses                                    */
/* ------------------------------------------------------------------ */

export interface OrderPaymentSessionResponse {
    url: string;
    transactionId: string;
    amount: number;
    tipAmount: number;
    total: number;
}

export interface OrderBillItemResponse {
    id: string;
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    priceAtOrder: number;
    guestSessionId: string | null;
    guestName: string | null;
    paidByGuestId: string | null;
    isLocked: boolean;
    lockedBySessionId: string | null;
    isMine: boolean;
}

export interface OrderBillTransactionResponse {
    id: string;
    guestName: string | null;
    amount: number;
    tipAmount: number;
    totalCharged: number;
    status: PaymentTransactionStatusType;
    splitType: SplitType;
    paidAt: string | null;
}

export interface OrderBillStatusResponse {
    orderId: string;
    tableId: string | null;
    tableName: string | null;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: PaymentStatusType;
    items: OrderBillItemResponse[];
    transactions: OrderBillTransactionResponse[];
}

export interface VerifyPaymentResponse {
    paid: boolean;
    paymentStatus: PaymentStatusType;
    paidAmount: number;
    totalAmount: number;
    remainingAmount: number;
}
