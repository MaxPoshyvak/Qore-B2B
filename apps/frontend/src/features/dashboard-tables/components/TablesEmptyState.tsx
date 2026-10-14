'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, Plus } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { useTranslations } from 'next-intl';

type TablesEmptyStateProps = {
    onAdd: () => void;
};

export function TablesEmptyState({ onAdd }: TablesEmptyStateProps) {
    const t = useTranslations('tablesFloor');

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E7E5E0] bg-white/60 px-6 py-16 text-center dark:border-[#232327] dark:bg-white/[0.03]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                <LayoutGrid size={24} />
            </div>
            <h3 className={`mt-5 text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                {t('emptyTitle')}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                {t('emptyDesc')}
            </p>
            <button
                type="button"
                onClick={onAdd}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                <Plus size={17} strokeWidth={2.4} />
                {t('addTable')}
            </button>
        </motion.div>
    );
}
