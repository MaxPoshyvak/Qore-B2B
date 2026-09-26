'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Loader2, X } from 'lucide-react';
import { display, body } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { cn } from '@/shared/lib/utils';

export type UpgradeConfirmModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    currentPlanTier?: string;
    currentPlanPrice?: string;
    targetPlanTier?: string;
    targetPlanPrice?: string;
};

export function UpgradeConfirmModal({
    open,
    onClose,
    onConfirm,
    isLoading = false,
    currentPlanTier = 'Pro',
    currentPlanPrice = '$29/mo',
    targetPlanTier = 'Business',
    targetPlanPrice = '$79/mo',
}: UpgradeConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle Escape key and lock document body scroll
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, isLoading, onClose]);

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md sm:p-6"
                    onClick={(e) => {
                        // Click on backdrop outside dialog box closes modal
                        if (e.target === e.currentTarget && !isLoading) {
                            onClose();
                        }
                    }}>
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="upgrade-modal-title"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative my-auto w-full max-w-[92vw] rounded-2xl border border-white/10 bg-[#141417] p-6 shadow-2xl sm:max-w-lg sm:p-8">
                        {/* Close button in top-right corner for touch and pointer devices */}
                        <button
                            type="button"
                            onClick={() => {
                                if (!isLoading) onClose();
                            }}
                            disabled={isLoading}
                            aria-label="Close modal"
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#94938D] transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:right-6 sm:top-6">
                            <X size={16} />
                        </button>

                        {/* Header */}
                        <div className="pr-8">
                            <h2
                                id="upgrade-modal-title"
                                className={`${display.className} text-xl font-bold tracking-tight text-[#F5F4F2] sm:text-2xl`}>
                                Upgrade to {targetPlanTier}
                            </h2>
                            <p className={`${body.className} mt-2 text-[13.5px] leading-relaxed text-[#94938D] sm:text-sm`}>
                                You are upgrading from {currentPlanTier} ({currentPlanPrice}) to {targetPlanTier} ({targetPlanPrice}). Your card on file will be charged the prorated difference for the remainder of your current billing cycle. Starting next cycle, your subscription will renew at {targetPlanPrice}.
                            </p>
                        </div>

                        {/* Breakdown Box */}
                        <div className="mt-6 flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13.5px] sm:text-sm">
                            <div className="flex items-center justify-between pb-3">
                                <span className="text-[#94938D]">Current plan</span>
                                <span className="font-medium text-[#F5F4F2]">
                                    {currentPlanTier} ({currentPlanPrice})
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <span className="text-[#94938D]">New plan</span>
                                <span className="font-semibold text-blue-400">
                                    {targetPlanTier} ({targetPlanPrice})
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3">
                                <span className="text-[#94938D]">Payment method</span>
                                <span className="flex items-center gap-1.5 font-medium text-[#F5F4F2]">
                                    <CreditCard size={15} className="text-blue-400" />
                                    Card on file (Stripe)
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className={cn(
                                    body.className,
                                    'w-full rounded-xl border border-white/10 px-5 py-2.5 text-center text-sm font-medium text-[#F5F4F2] transition-colors md:hover:bg-white/5 sm:w-auto',
                                    isLoading && 'cursor-not-allowed opacity-50',
                                )}>
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={cn(
                                    body.className,
                                    'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-colors md:hover:bg-blue-500 sm:w-auto',
                                    isLoading && 'cursor-not-allowed opacity-75',
                                )}>
                                {isLoading && <Loader2 size={15} className="animate-spin" />}
                                Confirm &amp; Upgrade
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
