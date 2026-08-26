'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Download, Printer, RefreshCw, Loader2 } from 'lucide-react';

import { type Table } from '@my-app/database';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { useRefreshQrToken } from '../hooks/useRefreshQrToken';

type TableQrModalProps = {
    open: boolean;
    onClose: () => void;
    slug: string;
    table: Table;
    venueName?: string;
    /** Called with the refreshed table so the parent grid can update its row. */
    onRegenerated?: (table: Table) => void;
};

export function TableQrModal({ open, onClose, slug, table, venueName, onRegenerated }: TableQrModalProps) {
    const [currentTable, setCurrentTable] = useState<Table>(table);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const refreshMutation = useRefreshQrToken(slug);

    useEffect(() => {
        if (open) setCurrentTable(table);
    }, [open, table]);

    const qrValue =
        typeof window !== 'undefined'
            ? `${window.location.origin}/t/${currentTable.qrToken}`
            : `/t/${currentTable.qrToken}`;

    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `table-${currentTable.name.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
        link.click();
    }

    async function handleRefresh() {
        setConfirmOpen(false);
        try {
            const updated = await refreshMutation.mutateAsync(currentTable.id);
            setCurrentTable(updated);
            onRegenerated?.(updated);
        } catch {
            /* error surfaced via toast in the hook */
        }
    }

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title="Table QR code"
                description="Guests scan this code to open your menu and start a session.">
                <div className="print:hidden">
                    <div className="flex flex-col items-center">
                        <div className="rounded-3xl border border-[#E7E5E0] bg-white p-5 dark:border-[#232327] dark:bg-[#141417]">
                            <QRCodeCanvas ref={canvasRef} value={qrValue} size={220} level="M" includeMargin />
                        </div>

                        <p className="mt-4 text-center text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {currentTable.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]">
                            {currentTable.capacity} seats · {currentTable.isActive ? 'Active' : 'Inactive'}
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <PrimaryButton
                            type="button"
                            className="flex-1"
                            onClick={handleDownload}
                            icon={<Download size={16} />}>
                            Download PNG
                        </PrimaryButton>
                        <SecondaryButton type="button" className="flex-1" onClick={() => window.print()}>
                            <Printer size={16} className="mr-1.5" />
                            Print QR
                        </SecondaryButton>
                        <SecondaryButton
                            type="button"
                            className="flex-1"
                            onClick={() => setConfirmOpen(true)}
                            disabled={refreshMutation.isPending}>
                            {refreshMutation.isPending ? (
                                <Loader2 size={16} className="mr-1.5 animate-spin" />
                            ) : (
                                <RefreshCw size={16} className="mr-1.5" />
                            )}
                            Regenerate
                        </SecondaryButton>
                    </div>
                </div>

                {/* Printable sheet — only visible when printing. */}
                <div className="hidden print:block">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Qore</p>
                        <h1 className="text-2xl font-bold text-black">{venueName ?? 'Your venue'}</h1>
                        <QRCodeSVG value={qrValue} size={240} level="M" includeMargin />
                        <p className="text-lg font-bold text-black">{currentTable.name}</p>
                        <p className="max-w-xs text-sm text-black/70">
                            Scan this code with your phone camera to open the menu and start your order.
                        </p>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                open={confirmOpen}
                title="Regenerate QR token?"
                description="The current QR code will stop working immediately. Printed or displayed codes using the old token will no longer resolve to this table."
                confirmLabel="Regenerate"
                loading={refreshMutation.isPending}
                onConfirm={handleRefresh}
                onClose={() => setConfirmOpen(false)}
            />
        </>
    );
}
