'use client';

import { motion } from 'framer-motion';
import { Pencil, QrCode, Trash2, Users } from 'lucide-react';

import { type Table } from '@my-app/database';
import { Badge } from '@/shared/ui/shadcn/Badge';
import { Switch } from '@/shared/ui/shadcn/Switch';
import { EASE } from '@/shared/config/animations';

type TableCardProps = {
    table: Table;
    onViewQr: (table: Table) => void;
    onEdit: (table: Table) => void;
    onDelete: (table: Table) => void;
    onToggleActive: (table: Table, next: boolean) => void;
};

export function TableCard({ table, onViewQr, onEdit, onDelete, onToggleActive }: TableCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-6 transition-colors duration-300 hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:hover:border-[#3B82F6]/40">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(300px circle at 80% 0%, rgba(59,130,246,0.07), transparent 70%)',
                    }}
                />
            </div>

            <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3
                        className={`${'font-display'} truncate text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        {table.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <Users size={12} />
                            {table.capacity} seats
                        </Badge>
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                table.isActive
                                    ? 'bg-[#10B981]/10 text-[#04916C] dark:text-[#10B981]'
                                    : 'bg-black/[0.06] text-[#6B6A65] dark:bg-white/[0.08] dark:text-[#94938D]'
                            }`}>
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    table.isActive ? 'bg-[#10B981]' : 'bg-[#9C9B95]'
                                }`}
                            />
                            {table.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <Switch
                    checked={table.isActive}
                    onCheckedChange={(next) => onToggleActive(table, next)}
                    aria-label={`Toggle ${table.name} active`}
                />
            </div>

            <div className="relative mt-6 flex items-center gap-2 border-t border-[#E7E5E0] pt-4 dark:border-[#232327]">
                <button
                    type="button"
                    onClick={() => onViewQr(table)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                    <QrCode size={16} />
                    View QR
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(table)}
                    aria-label={`Edit ${table.name}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/60 px-3 py-2.5 text-[#0A0A0C] transition-colors hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:border-white/20">
                    <Pencil size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(table)}
                    aria-label={`Delete ${table.name}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/60 px-3 py-2.5 text-red-500 transition-colors hover:border-red-400/40 hover:bg-red-500/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-400/40">
                    <Trash2 size={15} />
                </button>
            </div>
        </motion.div>
    );
}
