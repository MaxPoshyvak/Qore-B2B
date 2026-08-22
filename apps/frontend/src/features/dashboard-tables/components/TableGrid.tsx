'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { type Table } from '@my-app/database';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useTables } from '../hooks/useTables';
import { useUpdateTable } from '../hooks/useUpdateTable';
import { useDeleteTable } from '../hooks/useDeleteTable';
import { TableCard } from './TableCard';
import { TableFormModal } from './TableFormModal';
import { TableQrModal } from './TableQrModal';
import { TablesEmptyState } from './TablesEmptyState';

type TableGridProps = {
    slug: string;
    venueName?: string;
};

export function TableGrid({ slug, venueName }: TableGridProps) {
    const { data: tables, isLoading } = useTables(slug);
    const updateTable = useUpdateTable(slug);
    const deleteTable = useDeleteTable(slug);

    const [formOpen, setFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    const [qrTable, setQrTable] = useState<Table | null>(null);
    const [qrOpen, setQrOpen] = useState(false);

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
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                    {tables && tables.length > 0
                        ? `${tables.length} table${tables.length === 1 ? '' : 's'}`
                        : 'Manage seating and guest QR codes'}
                </p>
                {tables && tables.length > 0 && (
                    <button
                        type="button"
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                        <Plus size={16} strokeWidth={2.4} />
                        Add table
                    </button>
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

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete table?"
                description={
                    deleteTarget
                        ? `"${deleteTarget.name}" will be permanently removed. Any active guest sessions on this table will be disconnected.`
                        : ''
                }
                confirmLabel="Delete table"
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
