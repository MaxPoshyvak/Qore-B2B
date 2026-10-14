'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Sparkles } from 'lucide-react';
import { type Table } from '@my-app/database';
import { Modal } from '@/shared/ui/Modal';
import { display, mono } from '@/shared/lib/fonts';
import { Logo } from '@/shared/ui/Logo';

type BulkQrPrintModalProps = {
    open: boolean;
    onClose: () => void;
    tables: Table[];
    slug: string;
    venueName?: string;
};

export function BulkQrPrintModal({
    open,
    onClose,
    tables,
    slug,
    venueName = 'Qore Venue',
}: BulkQrPrintModalProps) {
    const t = useTranslations('tablesFloor');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useqore.app';

    function handlePrint() {
        window.print();
    }

    if (!open) return null;

    const activeTables = tables.filter((t) => t.isActive);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('bulkPrintTitle')}
            description={t('bulkPrintDesc', { count: activeTables.length })}
            className="max-w-4xl max-h-[90vh]">
            <div className="space-y-6">
                {/* Print Action Header */}
                <div className="flex items-center justify-between rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 p-4 dark:border-[#3B82F6]/20 dark:bg-[#3B82F6]/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6] text-white shadow-sm">
                            <Printer size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                {t('readyForA4')}
                            </h4>
                            <p className="text-xs text-[#6B6A65] dark:text-[#94938D]">
                                {t('readyForA4Desc')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:opacity-95 cursor-pointer">
                        <Printer size={15} />
                        <span>{t('printSheet')}</span>
                    </button>
                </div>

                {/* Printable Area / Preview */}
                <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-[#E7E5E0] bg-[#FAFAF8] p-6 dark:border-[#232327] dark:bg-black/20">
                    <div
                        id="printable-bulk-qr-sheet"
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-2 print:gap-4">
                        {activeTables.map((table) => {
                            const tableUrl = `${origin}/t/${table.qrToken}`;

                            return (
                                <div
                                    key={table.id}
                                    className="page-break-avoid flex flex-col items-center justify-between rounded-2xl border-2 border-dashed border-[#E7E5E0] bg-white p-6 text-center shadow-sm dark:border-[#232327] dark:bg-[#141417] print:border-solid print:border-black print:bg-white print:text-black print:shadow-none">
                                    {/* Venue Branding */}
                                    <div className="mb-3">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#3B82F6] print:text-black">
                                            {venueName}
                                        </p>
                                        <h3
                                            className={`${display.className} mt-1 text-2xl font-bold tracking-tight text-[#0A0A0C] print:text-black`}>
                                            {table.name}
                                        </h3>
                                    </div>

                                    {/* QR Code */}
                                    <div className="my-2 rounded-2xl border border-black/5 bg-white p-3.5 shadow-sm print:border-none print:shadow-none">
                                        <QRCodeSVG
                                            value={tableUrl}
                                            size={140}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>

                                    {/* Scan Instruction */}
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-[#0A0A0C] print:text-black">
                                            {t('scanForMenu')}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-[#6B6A65] print:text-gray-600">
                                            {t('pointCamera')}
                                        </p>
                                        <p
                                            className={`${mono.className} mt-2 text-[9px] text-[#94938D] print:text-gray-500`}>
                                            useqore.app/t/{table.qrToken.slice(-6)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#E7E5E0] bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] cursor-pointer">
                        ✕
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:opacity-95 cursor-pointer">
                        <Printer size={15} />
                        <span>{t('printSheet')}</span>
                    </button>
                </div>
            </div>

            {/* Print Specific CSS */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-bulk-qr-sheet,
                    #printable-bulk-qr-sheet * {
                        visibility: visible;
                    }
                    #printable-bulk-qr-sheet {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        padding: 10mm;
                        margin: 0;
                    }
                    .page-break-avoid {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </Modal>
    );
}
