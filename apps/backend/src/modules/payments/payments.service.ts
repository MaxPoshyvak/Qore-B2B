import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { env } from 'src/config/env';
import {
    PaymentStatus,
    PaymentTransactionStatus,
    Prisma,
    SplitType,
} from '@my-app/database';
import {
    CreateEqualSplitPaymentDto,
    CreateItemSplitPaymentDto,
    CreateOrderPaymentDto,
    OrderBillStatusResponse,
    OrderPaymentSessionResponse,
    VerifyPaymentResponse,
} from '@my-app/types';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly stripe = new Stripe(env.STRIPE_SECRET_KEY);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get the live billing breakdown for an order: total, paid, remaining balance,
     * status of each dish (paid, locked, available), and transaction history.
     */
    async getBillStatus(orderId: string, guestSessionId?: string): Promise<OrderBillStatusResponse> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                table: true,
                items: {
                    include: { menuItem: true },
                    orderBy: { id: 'asc' },
                },
                payments: {
                    where: { status: PaymentTransactionStatus.succeeded },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Automatic lock cleanup for stale locks older than 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        await this.prisma.orderItem.updateMany({
            where: {
                orderId,
                isLockedForPayment: true,
                paidByGuestId: null,
                lockedAt: { lt: tenMinutesAgo },
            },
            data: {
                isLockedForPayment: false,
                lockedAt: null,
                lockedBySessionId: null,
            },
        });

        const totalAmount = Number(order.totalAmount);
        const paidAmount = Number(order.paidAmount);
        const remainingAmount = Math.max(0, totalAmount - paidAmount);

        return {
            orderId: order.id,
            tableId: order.tableId,
            tableName: order.table?.name ?? null,
            totalAmount,
            paidAmount,
            remainingAmount,
            paymentStatus: order.paymentStatus,
            items: order.items.map((item) => {
                const isLocked = Boolean(
                    item.isLockedForPayment &&
                    item.lockedAt &&
                    item.lockedAt > tenMinutesAgo,
                );
                return {
                    id: item.id,
                    menuItemId: item.menuItemId,
                    menuItemName: item.menuItem?.name ?? 'Item',
                    quantity: item.quantity,
                    priceAtOrder: Number(item.priceAtOrder),
                    guestSessionId: item.guestSessionId,
                    guestName: item.guestName,
                    paidByGuestId: item.paidByGuestId,
                    isLocked,
                    lockedBySessionId: isLocked ? item.lockedBySessionId : null,
                    isMine: Boolean(guestSessionId && item.guestSessionId === guestSessionId),
                };
            }),
            transactions: order.payments.map((p) => ({
                id: p.id,
                guestName: p.guestName,
                amount: Number(p.amount),
                tipAmount: Number(p.tipAmount),
                totalCharged: Number(p.totalCharged),
                status: p.status,
                splitType: p.splitType,
                paidAt: p.paidAt ? p.paidAt.toISOString() : null,
            })),
        };
    }

    /**
     * Creates a Stripe Checkout session to pay the entire unpaid balance (Phase 1).
     */
    async createFullPayment(
        orderId: string,
        dto: CreateOrderPaymentDto,
    ): Promise<OrderPaymentSessionResponse> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { tenant: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.paymentStatus === PaymentStatus.paid) {
            throw new BadRequestException('This order is already fully paid');
        }

        const remainingAmount = Math.max(0, Number(order.totalAmount) - Number(order.paidAmount));
        if (remainingAmount <= 0) {
            throw new BadRequestException('No remaining balance left on this order');
        }

        const tipAmount = dto.tipAmount > 0 ? dto.tipAmount : 0;
        const totalCharged = remainingAmount + tipAmount;

        const txn = await this.prisma.paymentTransaction.create({
            data: {
                orderId: order.id,
                tenantId: order.tenantId,
                guestSessionId: dto.guestSessionId ?? null,
                guestName: dto.guestName ?? null,
                amount: new Prisma.Decimal(remainingAmount),
                tipAmount: new Prisma.Decimal(tipAmount),
                totalCharged: new Prisma.Decimal(totalCharged),
                status: PaymentTransactionStatus.pending,
                splitType: SplitType.full,
            },
        });

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Order #${order.id.slice(-6).toUpperCase()} Payment`,
                        description: `Order at ${order.tenant.name}`,
                    },
                    unit_amount: Math.round(remainingAmount * 100),
                },
                quantity: 1,
            },
        ];

        if (tipAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Gratuity / Tip',
                        description: 'Tip for the staff',
                    },
                    unit_amount: Math.round(tipAmount * 100),
                },
                quantity: 1,
            });
        }

        const baseUrl = dto.originUrl || `${env.FRONTEND_URL}/${order.tenant.slug}/order/${order.id}`;
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}?payment=cancelled`,
            metadata: {
                type: 'order_payment',
                orderId: order.id,
                transactionId: txn.id,
                splitType: 'full',
                tenantId: order.tenantId,
            },
        });

        await this.prisma.paymentTransaction.update({
            where: { id: txn.id },
            data: { stripeSessionId: session.id },
        });

        return {
            url: session.url!,
            transactionId: txn.id,
            amount: remainingAmount,
            tipAmount,
            total: totalCharged,
        };
    }

    /**
     * Split bill equally among N people (Phase 2).
     */
    async createEqualSplitPayment(
        orderId: string,
        dto: CreateEqualSplitPaymentDto,
    ): Promise<OrderPaymentSessionResponse> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { tenant: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.paymentStatus === PaymentStatus.paid) {
            throw new BadRequestException('This order is already fully paid');
        }

        const remainingBalance = Math.max(0, Number(order.totalAmount) - Number(order.paidAmount));
        if (remainingBalance <= 0) {
            throw new BadRequestException('No remaining balance left on this order');
        }

        let share = Math.round((Number(order.totalAmount) / dto.totalParts) * 100) / 100;
        if (share > remainingBalance) {
            share = remainingBalance;
        }

        const tipAmount = dto.tipAmount > 0 ? dto.tipAmount : 0;
        const totalCharged = share + tipAmount;

        const txn = await this.prisma.paymentTransaction.create({
            data: {
                orderId: order.id,
                tenantId: order.tenantId,
                guestSessionId: dto.guestSessionId,
                guestName: dto.guestName ?? null,
                amount: new Prisma.Decimal(share),
                tipAmount: new Prisma.Decimal(tipAmount),
                totalCharged: new Prisma.Decimal(totalCharged),
                status: PaymentTransactionStatus.pending,
                splitType: SplitType.equal,
                splitPayerCount: dto.totalParts,
            },
        });

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Order #${order.id.slice(-6).toUpperCase()} Share (1 of ${dto.totalParts})`,
                        description: `Equal split payment for order at ${order.tenant.name}`,
                    },
                    unit_amount: Math.round(share * 100),
                },
                quantity: 1,
            },
        ];

        if (tipAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Gratuity / Tip',
                        description: 'Tip for the staff',
                    },
                    unit_amount: Math.round(tipAmount * 100),
                },
                quantity: 1,
            });
        }

        const baseUrl = dto.originUrl || `${env.FRONTEND_URL}/${order.tenant.slug}/order/${order.id}`;
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}?payment=cancelled`,
            metadata: {
                type: 'order_payment',
                orderId: order.id,
                transactionId: txn.id,
                splitType: 'equal',
                tenantId: order.tenantId,
            },
        });

        await this.prisma.paymentTransaction.update({
            where: { id: txn.id },
            data: { stripeSessionId: session.id },
        });

        return {
            url: session.url!,
            transactionId: txn.id,
            amount: share,
            tipAmount,
            total: totalCharged,
        };
    }

    /**
     * Split bill by selecting specific dishes (Phase 2).
     * Locks items atomically to prevent concurrent double-charging.
     */
    async createItemSplitPayment(
        orderId: string,
        dto: CreateItemSplitPaymentDto,
    ): Promise<OrderPaymentSessionResponse> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { tenant: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.paymentStatus === PaymentStatus.paid) {
            throw new BadRequestException('This order is already fully paid');
        }

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        // Atomic selection, verification and lock
        const { txn, itemsSum, totalCharged } = await this.prisma.$transaction(async (tx) => {
            const items = await tx.orderItem.findMany({
                where: { id: { in: dto.itemIds }, orderId },
                include: { menuItem: true },
            });

            if (items.length !== dto.itemIds.length) {
                throw new NotFoundException('One or more selected items were not found in this order');
            }

            for (const item of items) {
                if (item.paidByGuestId) {
                    throw new BadRequestException(`"${item.menuItem?.name || 'Item'}" has already been paid`);
                }
                const isLockedByOther =
                    item.isLockedForPayment &&
                    item.lockedBySessionId !== dto.guestSessionId &&
                    item.lockedAt &&
                    item.lockedAt > tenMinutesAgo;

                if (isLockedByOther) {
                    throw new ConflictException(
                        `"${item.menuItem?.name || 'Item'}" is currently being paid by another guest`,
                    );
                }
            }

            const itemsSum = items.reduce(
                (sum, item) => sum + Number(item.priceAtOrder) * item.quantity,
                0,
            );
            const tipAmount = dto.tipAmount > 0 ? dto.tipAmount : 0;
            const totalCharged = itemsSum + tipAmount;

            const txn = await tx.paymentTransaction.create({
                data: {
                    orderId: order.id,
                    tenantId: order.tenantId,
                    guestSessionId: dto.guestSessionId,
                    guestName: dto.guestName ?? null,
                    amount: new Prisma.Decimal(itemsSum),
                    tipAmount: new Prisma.Decimal(tipAmount),
                    totalCharged: new Prisma.Decimal(totalCharged),
                    status: PaymentTransactionStatus.pending,
                    splitType: SplitType.by_item,
                },
            });

            // Lock the selected items
            await tx.orderItem.updateMany({
                where: { id: { in: dto.itemIds } },
                data: {
                    isLockedForPayment: true,
                    lockedAt: new Date(),
                    lockedBySessionId: dto.guestSessionId,
                    paymentTransactionId: txn.id,
                },
            });

            return { txn, itemsSum, totalCharged, items };
        });

        // Fetch locked items for building line items
        const lockedItems = await this.prisma.orderItem.findMany({
            where: { id: { in: dto.itemIds } },
            include: { menuItem: true },
        });

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lockedItems.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${item.menuItem?.name || 'Dish'} (x${item.quantity})`,
                    description: `Item payment for order #${order.id.slice(-6).toUpperCase()}`,
                },
                unit_amount: Math.round(Number(item.priceAtOrder) * 100),
            },
            quantity: item.quantity,
        }));

        if (dto.tipAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Gratuity / Tip',
                        description: 'Tip for the staff',
                    },
                    unit_amount: Math.round(dto.tipAmount * 100),
                },
                quantity: 1,
            });
        }

        const baseUrl = dto.originUrl || `${env.FRONTEND_URL}/${order.tenant.slug}/order/${order.id}`;
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}?payment=cancelled`,
            metadata: {
                type: 'order_payment',
                orderId: order.id,
                transactionId: txn.id,
                splitType: 'by_item',
                tenantId: order.tenantId,
                itemIds: JSON.stringify(dto.itemIds),
            },
        });

        await this.prisma.paymentTransaction.update({
            where: { id: txn.id },
            data: { stripeSessionId: session.id },
        });

        return {
            url: session.url!,
            transactionId: txn.id,
            amount: itemsSum,
            tipAmount: dto.tipAmount || 0,
            total: totalCharged,
        };
    }

    /**
     * Unlock items when guest cancels payment or closes the split modal.
     */
    async unlockItems(orderId: string, guestSessionId: string): Promise<{ unlocked: number }> {
        const { count } = await this.prisma.orderItem.updateMany({
            where: {
                orderId,
                lockedBySessionId: guestSessionId,
                paidByGuestId: null,
            },
            data: {
                isLockedForPayment: false,
                lockedAt: null,
                lockedBySessionId: null,
                paymentTransactionId: null,
            },
        });

        return { unlocked: count };
    }

    /**
     * Fulfill payment transaction atomically. Safe to call multiple times (idempotent).
     */
    async fulfillPaymentTransaction(
        transactionId: string,
        stripePaymentIntentId?: string,
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const txn = await tx.paymentTransaction.findUnique({
                where: { id: transactionId },
                include: { order: true },
            });

            if (!txn) {
                this.logger.warn(`Payment transaction ${transactionId} not found for fulfillment`);
                return;
            }

            if (txn.status === PaymentTransactionStatus.succeeded) {
                return; // Already fulfilled
            }

            await tx.paymentTransaction.update({
                where: { id: txn.id },
                data: {
                    status: PaymentTransactionStatus.succeeded,
                    stripePaymentIntentId: stripePaymentIntentId ?? txn.stripePaymentIntentId,
                    paidAt: new Date(),
                },
            });

            // If split by items, mark those items as paid
            if (txn.splitType === SplitType.by_item) {
                await tx.orderItem.updateMany({
                    where: { paymentTransactionId: txn.id },
                    data: {
                        paidByGuestId: txn.guestSessionId || 'guest',
                        isLockedForPayment: false,
                        lockedAt: null,
                        lockedBySessionId: null,
                    },
                });
            }

            // Increment paidAmount on order
            const updatedOrder = await tx.order.update({
                where: { id: txn.orderId },
                data: {
                    paidAmount: { increment: txn.amount },
                },
            });

            // Check if order is fully paid or partially paid
            const isFullyPaid = Number(updatedOrder.paidAmount) >= Number(updatedOrder.totalAmount);
            await tx.order.update({
                where: { id: txn.orderId },
                data: {
                    paymentStatus: isFullyPaid ? PaymentStatus.paid : PaymentStatus.partially_paid,
                    paymentMethod: 'stripe',
                },
            });

            this.logger.log(
                `Payment fulfilled for Order #${txn.orderId}. New paidAmount: $${updatedOrder.paidAmount}. Status: ${
                    isFullyPaid ? 'paid' : 'partially_paid'
                }`,
            );
        });
    }

    /**
     * Verify payment status directly with Stripe upon return from Checkout.
     */
    async verifyPaymentSession(orderId: string, sessionId: string): Promise<VerifyPaymentResponse> {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const transactionId = session.metadata?.transactionId;
            if (transactionId) {
                await this.fulfillPaymentTransaction(
                    transactionId,
                    session.payment_intent as string,
                );
            }
        }

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const totalAmount = Number(order.totalAmount);
        const paidAmount = Number(order.paidAmount);
        const remainingAmount = Math.max(0, totalAmount - paidAmount);

        return {
            paid: session.payment_status === 'paid',
            paymentStatus: order.paymentStatus,
            paidAmount,
            totalAmount,
            remainingAmount,
        };
    }

    /**
     * Handles Stripe Webhook events for order payments.
     */
    async handleWebhook(payload: Buffer, signature: string): Promise<{ received: true }> {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                env.STRIPE_WEBHOOK_SECRET,
            );
        } catch (err: any) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    if (session.metadata?.type === 'order_payment' && session.metadata?.transactionId) {
                        await this.fulfillPaymentTransaction(
                            session.metadata.transactionId,
                            session.payment_intent as string,
                        );
                    }
                    break;
                }

                case 'checkout.session.expired': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    if (session.metadata?.type === 'order_payment' && session.metadata?.transactionId) {
                        const txnId = session.metadata.transactionId;
                        await this.prisma.paymentTransaction.update({
                            where: { id: txnId },
                            data: { status: PaymentTransactionStatus.cancelled },
                        });

                        // Release any locks
                        await this.prisma.orderItem.updateMany({
                            where: { paymentTransactionId: txnId, paidByGuestId: null },
                            data: {
                                isLockedForPayment: false,
                                lockedAt: null,
                                lockedBySessionId: null,
                                paymentTransactionId: null,
                            },
                        });
                    }
                    break;
                }
            }
        } catch (error) {
            this.logger.error(`Error processing webhook event ${event.type}:`, error);
        }

        return { received: true };
    }
}
