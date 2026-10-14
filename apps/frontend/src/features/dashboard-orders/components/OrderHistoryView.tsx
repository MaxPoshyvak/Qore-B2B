'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Search,
    X,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Loader2,
    ShoppingBag,
    Utensils,
} from 'lucide-react';
import { formatCurrencyPrice, type OrderResponse, type OrderStatusType } from '@my-app/types';
import { display, mono } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';
import { useOrderHistory } from '../hooks/useOrders';
import { OrderDetailsModal } from './OrderDetailsModal';

type OrderHistoryViewProps = {
    tenantId: string;
    slug: string;
    currency?: string;
};

type DatePreset = 'all' | 'today' | 'yesterday' | '7days';

const STATUS_PILLS: { key: OrderStatusType | 'all'; label: string }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'ready', label: 'Ready' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'new', label: 'New' },
];

export function OrderHistoryView({ tenantId, currency = 'USD' }: OrderHistoryViewProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatusType | 'all'>('all');
    const [datePreset, setDatePreset] = useState<DatePreset>('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

    // Compute date ranges based on preset
    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        if (datePreset === 'today') {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return { startDate: start.toISOString(), endDate: undefined };
        }
        if (datePreset === 'yesterday') {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
            return { startDate: start.toISOString(), endDate: end.toISOString() };
        }
        if (datePreset === '7days') {
            const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return { startDate: start.toISOString(), endDate: undefined };
        }
        return { startDate: undefined, endDate: undefined };
    }, [datePreset]);

    const { data: orders, isLoading } = useOrderHistory(tenantId, {
        status: statusFilter,
        search: search.trim() || undefined,
        startDate,
        endDate,
        limit: 100,
    });

    const orderList = orders ?? [];

    return (
        <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 rounded-3xl border border-[#E7E5E0] bg-white p-5 shadow-sm dark:border-[#232327] dark:bg-[#121215]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6A65] dark:text-[#94938D]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order #, guest, or table..."
                            className="w-full rounded-2xl border border-[#E7E5E0] bg-[#FAFAF8] py-2.5 pl-10 pr-9 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#6B6A65] focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/[0.03] dark:text-[#F5F4F2] dark:placeholder:text-[#94938D]"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white">
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Date Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E7E5E0] bg-[#FAFAF8] p-1 text-xs dark:border-[#232327] dark:bg-white/[0.02]">
                        {(['all', 'today', 'yesterday', '7days'] as const).map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setDatePreset(preset)}
                                className={cn(
                                    'rounded-xl px-3 py-1.5 font-medium transition-colors cursor-pointer',
                                    datePreset === preset
                                        ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#232327] dark:text-white'
                                        : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white',
                                )}>
                                {preset === 'all' && 'All Time'}
                                {preset === 'today' && 'Today'}
                                {preset === 'yesterday' && 'Yesterday'}
                                {preset === '7days' && '7 Days'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[#E7E5E0] pt-4 dark:border-[#232327]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                        Status:
                    </span>
                    {STATUS_PILLS.map((pill) => (
                        <button
                            key={pill.key}
                            type="button"
                            onClick={() => setStatusFilter(pill.key)}
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer',
                                statusFilter === pill.key
                                    ? 'bg-[#3B82F6] text-white shadow-sm'
                                    : 'border border-[#E7E5E0] bg-white text-[#6B6A65] hover:border-[#3B82F6]/30 hover:text-[#0A0A0C] dark:border-[#232327] dark:bg-white/[0.03] dark:text-[#94938D] dark:hover:text-white',
                            )}>
                            {pill.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List / Table */}
            {isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#E7E5E0] bg-white dark:border-[#232327] dark:bg-[#121215]">
                    <Loader2 size={24} className="animate-spin text-[#3B82F6]" />
                </div>
            ) : orderList.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#E7E5E0] bg-white p-8 text-center dark:border-[#232327] dark:bg-[#121215]">
                    <Clock size={32} className="text-[#94938D]" />
                    <h3 className="mt-4 text-base font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                        No orders found
                    </h3>
                    <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                        Try adjusting your search query, status, or date range filters.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white shadow-sm dark:border-[#232327] dark:bg-[#121215]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E7E5E0] bg-[#FAFAF8] text-xs font-semibold uppercase tracking-wider text-[#6B6A65] dark:border-[#232327] dark:bg-white/[0.02] dark:text-[#94938D]">
                                <tr>
                                    <th className="px-6 py-4">Order #</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Table / Type</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7E5E0] dark:divide-[#232327]">
                                {orderList.map((order) => {
                                    const shortId = `#${order.id.slice(-4).toUpperCase()}`;
                                    const dateStr = new Date(order.createdAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                    const itemsSummary = order.items
                                        .map((it) => `${it.quantity}× ${it.menuItem?.name ?? 'Item'}`)
                                        .join(', ');

                                    return (
                                        <tr
                                            key={order.id}
                                            className="transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015]">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`${mono.className} font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                                    {shortId}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                {dateStr}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {order.isOrderAhead ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                                        <ShoppingBag size={12} />
                                                        Takeaway
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-[#0A0A0C] dark:bg-white/10 dark:text-[#F5F4F2]">
                                                        <Utensils size={12} />
                                                        {order.table?.name ? `Table ${order.table.name}` : 'Table'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="max-w-xs truncate px-6 py-4 text-xs text-[#6B6A65] dark:text-[#94938D]" title={itemsSummary}>
                                                {itemsSummary}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                {formatCurrencyPrice(Number(order.totalAmount), currency)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                        order.status === 'delivered' && 'bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400',
                                                        order.status === 'cancelled' && 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
                                                        order.status === 'ready' && 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
                                                        order.status === 'preparing' && 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
                                                        order.status === 'new' && 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
                                                    )}>
                                                    {order.status === 'delivered' && <CheckCircle2 size={12} />}
                                                    {order.status === 'cancelled' && <XCircle size={12} />}
                                                    {order.status === 'ready' && <CheckCircle2 size={12} />}
                                                    {order.status === 'preparing' && <Clock size={12} />}
                                                    {order.status === 'new' && <Clock size={12} />}
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E5E0] bg-white px-3 py-1.5 text-xs font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] cursor-pointer">
                                                    <Eye size={13} />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Order Details */}
            <OrderDetailsModal
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                currency={currency}
            />
        </div>
    );
}
