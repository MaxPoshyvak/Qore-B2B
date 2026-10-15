'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnalyticsApi } from '../api/analytics.service';
import { cn } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui/Tooltip';

export function ExportCsvDropdown({ tenantId }: { tenantId: string }) {
    const t = useTranslations('dashboard.analytics');
    const [isOpen, setIsOpen] = useState(false);
    const [exportingType, setExportingType] = useState<'orders' | 'sales' | null>(null);
    const [justExported, setJustExported] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function handleExport(type: 'orders' | 'sales') {
        try {
            setExportingType(type);
            setIsOpen(false);
            if (type === 'orders') {
                await AnalyticsApi.downloadOrdersCsv(tenantId);
            } else {
                await AnalyticsApi.downloadSalesCsv(tenantId);
            }
            setJustExported(true);
            setTimeout(() => setJustExported(false), 2500);
        } catch (error) {
            console.error('CSV export failed:', error);
            alert(t('exportFailed', { defaultValue: 'Failed to export CSV. Please try again.' }));
        } finally {
            setExportingType(null);
        }
    }

    const isLoading = exportingType !== null;

    return (
        <div ref={containerRef} className="relative inline-block text-left">
            <Tooltip content={t('exportCsvTooltip')} side="bottom">
                <button
                    type="button"
                    onClick={() => !isLoading && setIsOpen(!isOpen)}
                    disabled={isLoading}
                    className={cn(
                        'group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#0A0A0C] shadow-sm backdrop-blur-xl transition-all hover:border-[#3B82F6]/40 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-[#F5F4F2] dark:hover:border-white/20 dark:hover:bg-white/10',
                        isOpen && 'border-[#3B82F6]/50 ring-2 ring-[#3B82F6]/20',
                        isLoading && 'cursor-not-allowed opacity-75',
                    )}>
                    {isLoading ? (
                        <Loader2 size={15} className="animate-spin text-[#3B82F6]" />
                    ) : justExported ? (
                        <Check size={15} className="text-[#10B981]" />
                    ) : (
                        <Download size={15} className="text-[#3B82F6] transition-transform group-hover:-translate-y-0.5" />
                    )}
                    <span>
                        {isLoading
                            ? t('exporting')
                            : justExported
                              ? t('exportSuccess')
                              : t('exportCsv')}
                    </span>
                    <ChevronDown
                        size={14}
                        className={cn(
                            'text-[#6B6A65] transition-transform duration-200 dark:text-[#94938D]',
                            isOpen && 'rotate-180',
                        )}
                    />
                </button>
            </Tooltip>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 transition-all dark:border-white/15 dark:bg-[#141417]/95 dark:ring-white/10">
                    <button
                        type="button"
                        onClick={() => handleExport('orders')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#0A0A0C] transition-colors hover:bg-black/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
                            <FileSpreadsheet size={15} />
                        </span>
                        <div>
                            <p className="font-semibold">{t('exportOrders')}</p>
                            <p className="text-[10.5px] text-[#6B6A65] dark:text-[#94938D]">
                                Revenue, tips, dates & payment statuses
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleExport('sales')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#0A0A0C] transition-colors hover:bg-black/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]">
                            <FileSpreadsheet size={15} />
                        </span>
                        <div>
                            <p className="font-semibold">{t('exportSales')}</p>
                            <p className="text-[10.5px] text-[#6B6A65] dark:text-[#94938D]">
                                Best-sellers, categories & quantities sold
                            </p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
