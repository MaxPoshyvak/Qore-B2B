'use client';

import { useState } from 'react';
import { Loader2, Plus, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type Table } from '@my-app/database';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useTables } from '../hooks/useTables';
import { useUpdateTable } from '../hooks/useUpdateTable';
import { useDeleteTable } from '../hooks/useDeleteTable';
import { TableCard } from './TableCard';
import { TableFormModal } from './TableFormModal';
import { TableQrModal } from './TableQrModal';
import { BulkQrPrintModal } from './BulkQrPrintModal';
import { TablesEmptyState } from './TablesEmptyState';
import { Tooltip } from '@/shared/ui/Tooltip';

type TableGridProps = {
    slug: string;
    venueName?: string;
};

export function TableGrid({ slug, venueName }: TableGridProps) {
    const t = useTranslations('tablesFloor');
    const { data: tables, isLoading } = useTables(slug);
    const updateTable = useUpdateTable(slug);
    const deleteTable = useDeleteTable(slug);

    const [formOpen, setFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    const [qrTable, setQrTable] = useState<Table | null>(null);
    const [qrOpen, setQrOpen] = useState(false);
    const [bulkPrintOpen, setBulkPrintOpen] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Table | null>(null);

    function openAdd() {
        setEditingTable(null);
        setFormOpen(true);
    }

    function openEdit(table: Table) {
        setEditingTable(table);
        setFormOpen(true);
    }

    function openQr(table: Table) {
        setQrTable(table);
        setQrOpen(true);
    }

    async function handleToggleActive(table: Table, next: boolean) {
        await updateTable.mutateAsync({ tableId: table.id, dto: { isActive: next } });
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                    {tables && tables.length > 0
                        ? t('tableCount', { count: tables.length })
                        : t('manageSeating')}
                </p>
                {tables && tables.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Tooltip content={t('bulkPrintTooltip')} side="bottom">
                            <button
                                type="button"
                                onClick={() => setBulkPrintOpen(true)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-[#E7E5E0] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0A0A0C] shadow-sm transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] cursor-pointer">
                                <Printer size={16} />
                                <span>{t('printAllQr')}</span>
                            </button>
                        </Tooltip>

                        <button
                            type="button"
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 cursor-pointer">
                            <Plus size={16} strokeWidth={2.4} />
                            {t('addTable')}
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center rounded-3xl border border-[#E7E5E0] bg-white/60 py-16 dark:border-[#232327] dark:bg-white/[0.03]">
                    <Loader2 size={22} className="animate-spin text-[#3B82F6]" />
                </div>
            ) : !tables || tables.length === 0 ? (
                <TablesEmptyState onAdd={openAdd} />
            ) : (
                <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onViewQr={openQr}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            <TableFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                slug={slug}
                table={editingTable}
            />

            {qrTable && (
                <TableQrModal
                    open={qrOpen}
                    onClose={() => setQrOpen(false)}
                    slug={slug}
                    table={qrTable}
                    venueName={venueName}
                    onRegenerated={(updated) => setQrTable(updated)}
                />
            )}

            {tables && (
                <BulkQrPrintModal
                    open={bulkPrintOpen}
                    onClose={() => setBulkPrintOpen(false)}
                    tables={tables}
                    slug={slug}
                    venueName={venueName}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={t('deleteTitle')}
                description={
                    deleteTarget
                        ? t('deleteDesc', { name: deleteTarget.name })
                        : ''
                }
                confirmLabel={t('deleteConfirm')}
                cancelLabel={t('cancel')}
                loading={deleteTable.isPending}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    await deleteTable.mutateAsync(deleteTarget.id);
                    setDeleteTarget(null);
                }}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    );
}
