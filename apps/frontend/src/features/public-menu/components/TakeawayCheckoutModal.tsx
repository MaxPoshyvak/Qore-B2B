'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, Loader2, ShoppingBag } from 'lucide-react';

import { Modal } from '@/shared/ui/Modal';
import { EASE } from '@/shared/config/animations';
import { display, mono } from '@/shared/lib/fonts';
import { formatPrice } from '@/shared/lib/utils';
import { useCartStore } from '../store/useCartStore';
import { useSharedCart } from '../hooks/useSharedCart';
import { useCreatePublicOrder } from '@/features/dashboard-orders/hooks/useOrders';

type TakeawayCheckoutModalProps = {
    onComplete?: () => void;
};

const PICKUP_OPTIONS = [
    { value: 'asap', label: 'ASAP' },
    { value: 'scheduled', label: 'Schedule' },
] as const;

export function TakeawayCheckoutModal({ onComplete }: TakeawayCheckoutModalProps) {
    const isOpen = useCartStore((s) => s.isTakeawayCheckoutOpen);
    const setOpen = useCartStore((s) => s.setTakeawayCheckoutOpen);
    const guestName = useCartStore((s) => s.guestName);
    const setGuestName = useCartStore((s) => s.setGuestName);
    const pickupMode = useCartStore((s) => s.pickupMode);
    const setPickupMode = useCartStore((s) => s.setPickupMode);
    const pickupTime = useCartStore((s) => s.pickupTime);
    const setPickupTime = useCartStore((s) => s.setPickupTime);
    const takeawaySessionId = useCartStore((s) => s.takeawaySessionId);
    const setTakeawaySessionId = useCartStore((s) => s.setTakeawaySessionId);
    const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);

    const { data: cart } = useSharedCart(null, takeawaySessionId);
    const placeOrder = useCreatePublicOrder();

    const [name, setName] = useState(guestName ?? '');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(guestName ?? '');
            setError(null);
            setSubmitted(false);
        }
    }, [isOpen, guestName]);

    const items = cart?.items ?? [];
    const total = items.reduce((sum, item) => sum + item.quantity * Number(item.menuItem?.price ?? 0), 0);

    function close() {
        setOpen(false);
    }

    function handleSubmit() {
        if (name.trim().length < 2) {
            setError('Please enter at least 2 characters');
            return;
        }
        if (pickupMode === 'scheduled' && !pickupTime) {
            setError('Please choose a pickup time');
            return;
        }
        if (!takeawaySessionId) {
            setError('Your cart session expired. Please start a new order.');
            return;
        }

        // Persist the name locally so the success overlay / future steps can use it.
        setGuestName(name);

        placeOrder.mutate(
            {
                cartSessionId: takeawaySessionId,
                customerName: name.trim(),
                pickupTime: pickupMode === 'scheduled' ? (pickupTime ?? undefined) : undefined,
            },
            {
                onSuccess: () => {
                    // Drop the (now closed) session id locally so the cart query stops
                    // pointing at it; the page-level success overlay takes over.
                    setTakeawaySessionId(null);
                    setCartDrawerOpen(false);
                    setOpen(false);
                    setSubmitted(true);
                    onComplete?.();
                },
                onError: (err) => {
                    setError(err.message || 'Something went wrong placing your order.');
                },
            },
        );
    }

    function handleDone() {
        setCartDrawerOpen(false);
        setOpen(false);
        onComplete?.();
    }

    return (
        <Modal
            open={isOpen}
            onClose={close}
            title="Takeaway checkout"
            description="Almost ready — just a couple of details before we fire up the kitchen.">
            {submitted ? (
                <div className="flex flex-col items-center py-6 text-center">
                    <motion.span
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#04916C]/15 text-[#04916C] dark:text-[#10B981]">
                        <Check size={28} strokeWidth={3} />
                    </motion.span>
                    <p className={`${display.className} mt-4 text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Order confirmed!
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {pickupMode === 'asap'
                            ? "We'll have it ready as soon as possible."
                            : `See you at ${pickupTime}.`}
                    </p>
                    <button
                        type="button"
                        onClick={handleDone}
                        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                        Done
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {/* Name */}
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                            Who is this order for?
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder="e.g. Alex"
                            className={`w-full rounded-2xl border bg-white/70 px-4 py-3 text-[14px] text-[#0A0A0C] outline-none transition-colors focus:border-[#3B82F6]/60 dark:bg-white/[0.04] dark:text-[#F5F4F2] ${
                                error ? 'border-red-400/70' : 'border-black/10 dark:border-white/15'
                            }`}
                        />
                    </label>

                    {/* Pickup mode segmented control */}
                    <div>
                        <span
                            className={`${mono.className} mb-2 block text-[10.5px] uppercase tracking-widest text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                            Pickup time
                        </span>
                        <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-black/10 bg-black/[0.03] p-1 dark:border-white/15 dark:bg-white/[0.04]">
                            {PICKUP_OPTIONS.map((opt) => {
                                const active = pickupMode === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setPickupMode(opt.value)}
                                        className="relative rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors">
                                        {active && (
                                            <motion.span
                                                layoutId="takeaway-pickup-indicator"
                                                transition={{ duration: 0.25, ease: EASE }}
                                                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-sm"
                                            />
                                        )}
                                        <span
                                            className={`relative z-10 ${
                                                active ? 'text-white' : 'text-[#6B6A65] dark:text-[#94938D]'
                                            }`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scheduled time reveal */}
                    <AnimatePresence initial={false}>
                        {pickupMode === 'scheduled' && (
                            <motion.div
                                key="time"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="overflow-hidden">
                                <label className="block">
                                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                                        <Clock size={14} /> Choose a time
                                    </span>
                                    <input
                                        type="time"
                                        value={pickupTime ?? ''}
                                        onChange={(e) => setPickupTime(e.target.value)}
                                        className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-[14px] text-[#0A0A0C] outline-none transition-colors focus:border-[#3B82F6]/60 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]"
                                    />
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-[12.5px] text-red-500">{error}</p>}

                    {/* Summary */}
                    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <span className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                        <span
                            className={`${display.className} text-[15px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {formatPrice(total)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={placeOrder.isPending}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                        {placeOrder.isPending ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Placing order...
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={16} />
                                Confirm &amp; Pay
                            </>
                        )}
                    </button>
                </div>
            )}
        </Modal>
    );
}
