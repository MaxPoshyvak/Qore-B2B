'use client';

import { motion } from 'framer-motion';
import { formatPrice } from '@/shared/lib/utils';

type SplitProgressBarProps = {
    totalAmount: number;
    paidAmount: number;
};

export function SplitProgressBar({ totalAmount, paidAmount }: SplitProgressBarProps) {
    const percentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
    const remaining = Math.max(0, totalAmount - paidAmount);

    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#6B6A65] dark:text-[#94938D]">
                    Bill Progress
                </span>
                <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                    {formatPrice(paidAmount)} of {formatPrice(totalAmount)} paid ({percentage}%)
                </span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
                />
            </div>

            {remaining > 0 ? (
                <p className="text-right text-[11px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                    {formatPrice(remaining)} remaining
                </p>
            ) : (
                <p className="text-right text-[11px] font-bold text-[#10B981]">
                    Fully paid ✓
                </p>
            )}
        </div>
    );
}
