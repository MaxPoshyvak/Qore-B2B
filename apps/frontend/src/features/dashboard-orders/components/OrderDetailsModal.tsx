'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, XCircle, ShoppingBag, Utensils, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrencyPrice, type OrderResponse, type OrderStatusType } from '@my-app/types';
import { Modal } from '@/shared/ui/Modal';
import { display, mono } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';

type OrderDetailsModalProps = {
    order: OrderResponse | null;
    open: boolean;
    onClose: () => void;
    currency?: string;
};

const STATUS_CONFIG: Record<
    OrderStatusType,
    { label: string; bg: string; text: string; icon: typeof CheckCircle2 }
> = {
    new: { label: 'New', bg: 'bg-blue-500/10 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
    preparing: { label: 'Preparing', bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', icon: Clock },
    ready: { label: 'Ready', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
    delivered: { label: 'Delivered', bg: 'bg-green-500/10 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-400', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', bg: 'bg-red-500/10 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', icon: XCircle },
};

export function OrderDetailsModal({ order, open, onClose, currency = 'USD' }: OrderDetailsModalProps) {
    const t = useTranslations('liveOrders');
    if (!order) return null;

    const shortId = `#${order.id.slice(-4).toUpperCase()}`;
    const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new;
    const StatusIcon = statusCfg.icon;

    const createdFormatted = new Date(order.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'COMPLETED';

    return (
        <Modal open={open} onClose={onClose} title={`Order ${shortId}`} className="max-w-lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#E7E5E0] pb-4 dark:border-[#232327]">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className={`${mono.className} text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                {shortId}
                            </span>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                    statusCfg.bg,
                                    statusCfg.text,
                                )}>
                                <StatusIcon size={13} />
                                {statusCfg.label}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                            {createdFormatted}
                        </p>
                    </div>

                    <div className="text-right">
                        <span className={`${display.className} text-xl font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {formatCurrencyPrice(Number(order.totalAmount), currency)}
                        </span>
                        <div className="mt-0.5 flex items-center justify-end gap-1.5 text-xs">
                            <span
                                className={cn(
                                    'font-medium',
                                    isPaid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400',
                                )}>
                                {isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                            {order.paymentMethod && (
                                <span className="text-[#6B6A65] dark:text-[#94938D]">
                                    · {order.paymentMethod.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Venue Table / Context */}
                <div className="rounded-2xl border border-[#E7E5E0] bg-[#F2F1EE]/50 p-4 dark:border-[#232327] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            {order.isOrderAhead ? (
                                <>
                                    <ShoppingBag size={16} className="text-[#3B82F6]" />
                                    <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        Takeaway / Order-Ahead
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Utensils size={16} className="text-[#3B82F6]" />
                                    <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {order.table?.name ? `Table ${order.table.name}` : 'Dine-In Table'}
                                    </span>
                                </>
                            )}
                        </div>

                        {order.pickupAt && (
                            <span className="text-xs text-[#6B6A65] dark:text-[#94938D]">
                                Pickup: {order.pickupAt}
                            </span>
                        )}
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                        Items ({order.items.reduce((s, it) => s + it.quantity, 0)})
                    </h3>

                    <div className="divide-y divide-[#E7E5E0] rounded-2xl border border-[#E7E5E0] bg-white dark:divide-[#232327] dark:border-[#232327] dark:bg-[#141417]">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between p-3.5 text-sm">
                                <div className="flex items-start gap-3">
                                    <span className={`${mono.className} flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/5 text-xs font-bold text-[#0A0A0C] dark:bg-white/10 dark:text-[#F5F4F2]`}>
                                        {item.quantity}×
                                    </span>
                                    <div>
                                        <p className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            {item.menuItem?.name ?? 'Menu Item'}
                                        </p>
                                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                            <p className="mt-0.5 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                {item.selectedModifiers.map((m) => m.name).join(', ')}
                                            </p>
                                        )}
                                        {item.guestName && (
                                            <p className="mt-0.5 text-[11px] text-[#3B82F6]">
                                                Ordered by {item.guestName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <span className={`${mono.className} shrink-0 text-xs font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {formatCurrencyPrice(Number(item.priceAtOrder) * item.quantity, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total breakdown */}
                <div className="rounded-2xl border border-[#E7E5E0] bg-[#FAFAF8] p-4 text-xs dark:border-[#232327] dark:bg-white/[0.02]">
                    <div className="flex justify-between font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                        <span>Grand Total</span>
                        <span className={`${display.className} text-base`}>
                            {formatCurrencyPrice(Number(order.totalAmount), currency)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#E7E5E0] bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
