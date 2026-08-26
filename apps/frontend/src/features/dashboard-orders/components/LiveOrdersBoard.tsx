'use client';

import Link from 'next/link';
import { createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChefHat, CheckCircle2, Clock, ShoppingBag, ArrowLeft } from 'lucide-react';

import { type OrderResponse, type OrderStatusType } from '@my-app/types';
import { display, mono } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';
import { useActiveOrders, useUpdateOrderStatus, useKdsOrders, useUpdateKdsOrderStatus } from '../hooks/useOrders';
import { useKdsStore } from '@/shared/store/useKdsStore';

type ColumnKey = 'new' | 'preparing' | 'ready';

const COLUMNS: { key: ColumnKey; label: string; accent: string; dot: string }[] = [
    { key: 'new', label: 'New', accent: 'text-[#3B82F6] dark:text-[#60A5FA]', dot: 'bg-[#3B82F6]' },
    { key: 'preparing', label: 'Preparing', accent: 'text-[#F59E0B] dark:text-[#FBBF24]', dot: 'bg-[#F59E0B]' },
    { key: 'ready', label: 'Ready', accent: 'text-[#04916C] dark:text-[#10B981]', dot: 'bg-[#10B981]' },
];

const NEXT_STATUS: Record<ColumnKey, OrderStatusType | undefined> = {
    new: 'preparing',
    preparing: 'ready',
    ready: undefined,
};

const PREV_STATUS: Record<ColumnKey, OrderStatusType | undefined> = {
    new: undefined,
    preparing: 'new',
    ready: 'preparing',
};

const ACTION_LABEL: Record<ColumnKey, string | undefined> = {
    new: 'Start Preparing',
    preparing: 'Mark as Ready',
    ready: undefined,
};

const KdsTokenContext = createContext<string>('');

function formatElapsed(createdAt: string): string {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
}

function orderShortId(id: string): string {
    return `#${id.slice(-4).toUpperCase()}`;
}

function formatPickupTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

function OrderCardView({
    order,
    column,
    onUpdate,
    isUpdating,
}: {
    order: OrderResponse;
    column: ColumnKey;
    onUpdate: (vars: { orderId: string; status: OrderStatusType }) => void;
    isUpdating: boolean;
}) {
    const next = NEXT_STATUS[column];
    const prev = PREV_STATUS[column];
    const actionLabel = ACTION_LABEL[column];

    const guestName = order.items.find((i) => i.guestName)?.guestName ?? null;
    const tableLabel = order.table?.name ? `Table: ${order.table.name}` : null;

    return (
        <motion.div
            layout
            layoutId={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="group rounded-2xl border border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur-2xl transition-colors hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl dark:hover:border-white/20">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span
                        className={`${mono.className} text-[12px] font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                        {orderShortId(order.id)}
                    </span>
                    {order.isOrderAhead ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8B5CF6] dark:text-[#C4B5FD]">
                            <ShoppingBag size={10} /> Takeaway
                        </span>
                    ) : (
                        tableLabel && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
                                {tableLabel}
                            </span>
                        )
                    )}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-[#9C9B95] dark:text-[#6E6D68]">
                    <Clock size={11} /> {formatElapsed(order.createdAt)}
                </span>
            </div>

            {order.isOrderAhead && order.pickupAt && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B]/15 px-2 py-1 text-[11px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                    <Clock size={11} /> Pick up at {formatPickupTime(order.pickupAt)}
                </div>
            )}

            {guestName && (
                <p className="mt-1 text-[12.5px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{guestName}</p>
            )}

            <ul className="mt-3 space-y-1.5 border-t border-black/5 pt-3 dark:border-white/10">
                {order.items.map((item) => (
                    <li key={item.id} className="flex items-baseline gap-2 text-[13.5px]">
                        <span className="font-semibold tabular-nums text-[#3B82F6] dark:text-[#60A5FA]">
                            {item.quantity}×
                        </span>
                        <span className="text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {item.menuItem?.name ?? 'Unavailable item'}
                        </span>
                    </li>
                ))}
            </ul>

            {(actionLabel && next) || prev ? (
                <div className="mt-4 flex items-center gap-2">
                    {actionLabel && next && (
                        <button
                            type="button"
                            onClick={() => onUpdate({ orderId: order.id, status: next })}
                            disabled={isUpdating}
                            className={cn(
                                'flex h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-[14px] font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60',
                                column === 'new' && 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]',
                                column === 'preparing' && 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0A0C]',
                            )}>
                            {column === 'new' ? <ChefHat size={16} /> : <CheckCircle2 size={16} />}
                            <span className="whitespace-nowrap">{actionLabel}</span>
                        </button>
                    )}

                    {prev && (
                        <button
                            type="button"
                            onClick={() => onUpdate({ orderId: order.id, status: prev })}
                            disabled={isUpdating}
                            aria-label="Undo status change"
                            title="Undo"
                            className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 text-[#6B6A65] transition-all hover:border-[#3B82F6]/40 hover:text-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-[#94938D] dark:hover:text-[#60A5FA]">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                </div>
            ) : null}
        </motion.div>
    );
}

function DashboardOrderCard({ order, column }: { order: OrderResponse; column: ColumnKey }) {
    const updateStatus = useUpdateOrderStatus(order.tenantId);
    return (
        <OrderCardView
            order={order}
            column={column}
            isUpdating={updateStatus.isPending}
            onUpdate={(vars) => updateStatus.mutate(vars)}
        />
    );
}

function KdsOrderCard({ order, column }: { order: OrderResponse; column: ColumnKey }) {
    const token = useContext(KdsTokenContext);
    const pin = useKdsStore((s) => s.pin);
    const updateStatus = useUpdateKdsOrderStatus(token, pin);
    return (
        <OrderCardView
            order={order}
            column={column}
            isUpdating={updateStatus.isPending}
            onUpdate={(vars) => updateStatus.mutate(vars)}
        />
    );
}

export function LiveOrdersBoard({
    slug,
    tenantId,
    kdsToken,
    isKds = false,
}: {
    slug: string;
    tenantId: string;
    kdsToken?: string;
    isKds?: boolean;
}) {
    const pin = useKdsStore((s) => s.pin);

    const dashboard = useActiveOrders(tenantId);
    const kds = useKdsOrders(kdsToken ?? '', isKds ? pin : null);

    const { data: orders, isLoading } = isKds ? kds : dashboard;

    const byColumn = (key: ColumnKey) => (orders ?? []).filter((o) => o.status === key);

    const Card = isKds ? KdsOrderCard : DashboardOrderCard;

    const board = (
        <div className="mx-auto max-w-6xl px-1">
            {!isKds && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.08] px-4 py-3 dark:border-[#F59E0B]/20 dark:bg-[#F59E0B]/[0.06]">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                    <p className="text-[13px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                            ⚠️ Do not use this page on shared kitchen tablets.
                        </span>{' '}
                        Generate a secure KDS link in{' '}
                        <Link
                            href={`/dashboard/${slug}/settings?section=kds`}
                            className="font-semibold text-[#3B82F6] underline-offset-2 hover:underline dark:text-[#60A5FA]">
                            Settings
                        </Link>{' '}
                        for your kitchen staff.
                    </p>
                </div>
            )}

            {isLoading ? (
                <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Loading live orders…</p>
            ) : (
                <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                    {COLUMNS.map((col) => {
                        const items = byColumn(col.key);
                        return (
                            <section key={col.key} className="flex min-w-72 flex-1 flex-col">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className={cn('h-2 w-2 rounded-full', col.dot)} />
                                    <h2
                                        className={cn(
                                            display.className,
                                            'text-[15px] font-bold tracking-tight',
                                            col.accent,
                                        )}>
                                        {col.label}
                                    </h2>
                                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/5 px-1.5 text-[11px] font-semibold tabular-nums text-[#6B6A65] dark:bg-white/10 dark:text-[#94938D]">
                                        {items.length}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <AnimatePresence initial={false}>
                                        {items.map((order) => (
                                            <Card key={order.id} order={order} column={col.key} />
                                        ))}
                                    </AnimatePresence>
                                    {items.length === 0 && (
                                        <p className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-center text-[12.5px] text-[#9C9B95] dark:border-white/10 dark:text-[#6E6D68]">
                                            No orders
                                        </p>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (isKds && kdsToken) {
        return <KdsTokenContext.Provider value={kdsToken}>{board}</KdsTokenContext.Provider>;
    }

    return board;
}
