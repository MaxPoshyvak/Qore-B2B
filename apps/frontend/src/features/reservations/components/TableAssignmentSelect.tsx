'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Table as TableIcon, X } from 'lucide-react';

import { type Table } from '@my-app/database';

export function TableAssignmentSelect({
    tables,
    currentTableId,
    onAssign,
    disabled,
    disabledTableIds,
}: {
    tables: Table[];
    currentTableId: string | null;
    onAssign: (tableId: string | null) => void;
    disabled?: boolean;
    disabledTableIds?: string[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const current = tables.find((t) => t.id === currentTableId) ?? null;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#E7E5E0] bg-white/70 px-3 py-2 text-[13px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]">
                <span className="flex items-center gap-1.5 truncate">
                    <TableIcon size={14} className="text-[#6B6A65] dark:text-[#94938D]" />
                    {current ? current.name : 'Assign table'}
                </span>
                <ChevronDown size={15} className={`shrink-0 text-[#9C9B95] transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-full z-20 mb-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-[#E7E5E0]/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#121215]/95">
                        {current && (
                            <button
                                type="button"
                                onClick={() => {
                                    onAssign(null);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-[#6B6A65] transition-colors hover:bg-black/5 dark:text-[#94938D] dark:hover:bg-white/5">
                                <X size={14} /> Unassign
                            </button>
                        )}
                        {tables.map((t) => {
                            const selected = t.id === currentTableId;
                            const isDisabled = disabledTableIds?.includes(t.id) && !selected;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        if (isDisabled) return;
                                        onAssign(t.id);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                                        selected
                                            ? 'bg-[#3B82F6]/10 font-medium text-[#2563EB] dark:text-[#60A5FA]'
                                            : isDisabled
                                              ? 'cursor-not-allowed text-[#9C9B95] opacity-60 dark:text-[#6E6D68]'
                                              : 'text-[#0A0A0C] hover:bg-black/5 dark:text-[#F5F4F2] dark:hover:bg-white/5'
                                    }`}>
                                    <span className="flex items-center gap-2 truncate">
                                        {t.name}
                                        {isDisabled && (
                                            <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-medium text-[#9C9B95] dark:bg-white/10 dark:text-[#6E6D68]">
                                                Booked
                                            </span>
                                        )}
                                    </span>
                                    {selected && <Check size={14} className="shrink-0" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
