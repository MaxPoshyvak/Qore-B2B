'use client';

import { Loader2, QrCode, ShoppingBag } from 'lucide-react';

import { Modal } from '@/shared/ui/Modal';
import { useCartStore } from '../store/useCartStore';
import { useCreateTakeawaySession } from '../hooks/useSharedCart';

export function OrderTypeModal() {
    const isOpen = useCartStore((s) => s.isOrderTypeModalOpen);
    const setOpen = useCartStore((s) => s.setOrderTypeModalOpen);
    const createTakeaway = useCreateTakeawaySession();

    return (
        <Modal
            open={isOpen}
            onClose={() => setOpen(false)}
            title="How are you ordering?"
            description="Choose how you'd like to enjoy your meal.">
            <div className="flex flex-col gap-3">
                {/* Dine-in — informational (requires scanning the table QR) */}
                <div className="rounded-2xl border border-black/5 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                            <QrCode size={18} />
                        </span>
                        <div>
                            <p className="text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                Dine-in
                            </p>
                            <p className="text-[12.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                Scan the QR code on your table to join the shared cart.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-3 w-full rounded-xl border border-black/10 py-2.5 text-[13px] font-medium text-[#6B6A65] transition-colors hover:border-black/20 dark:border-white/15 dark:text-[#94938D]">
                        I&apos;ll scan my table
                    </button>
                </div>

                {/* Takeaway — single-player, creates its own session */}
                <button
                    type="button"
                    onClick={() => createTakeaway.mutate()}
                    disabled={createTakeaway.isPending}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                    {createTakeaway.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <ShoppingBag size={16} />
                    )}
                    Order Takeaway
                </button>
            </div>
        </Modal>
    );
}
