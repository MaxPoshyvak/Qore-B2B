'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, UtensilsCrossed } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

type OrderSuccessOverlayProps = {
    onRestart: () => void;
    /** True while a fresh cart session is being opened — blocks double submissions. */
    isRestarting?: boolean;
};

export function OrderSuccessOverlay({ onRestart, isRestarting = false }: OrderSuccessOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#08080A]/70 px-6 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(4,145,108,0.12),transparent_70%)]" />

                <div className="relative flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#04916C] text-white shadow-lg shadow-[#04916C]/30 dark:bg-[#10B981]">
                        <Check size={32} strokeWidth={3} />
                    </motion.div>

                    <h2
                        className={`${display.className} mt-5 text-[26px] font-bold leading-tight tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Order sent to kitchen!
                    </h2>

                    <p className="mt-2 flex items-center gap-2 text-sm text-[#6B6A65] dark:text-[#94938D]">
                        <UtensilsCrossed size={15} className="text-[#04916C] dark:text-[#10B981]" />
                        The staff will prepare your table&apos;s dishes shortly.
                    </p>

                    <button
                        type="button"
                        onClick={onRestart}
                        disabled={isRestarting}
                        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E7E5E0] px-5 py-3.5 text-[14px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#232327] dark:text-[#F5F4F2]">
                        {isRestarting && <Loader2 size={15} className="animate-spin" />}
                        {isRestarting ? 'Preparing your table...' : 'Start New Order'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
