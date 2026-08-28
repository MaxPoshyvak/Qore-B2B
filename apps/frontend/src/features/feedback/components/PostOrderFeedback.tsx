'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { toast } from '@/shared/ui/Toaster';
import { useSubmitFeedback } from '../hooks/useFeedback';

type PostOrderFeedbackProps = {
    slug: string;
    orderId?: string;
    guestName?: string;
    className?: string;
    onSubmitted?: () => void;
};

// Справжній ключ sessionStorage для гостьової сесії кошика (zustand persist).
// Увага: у ТЗ фігурував `core_cart_session`, проте в кодовій базі він має назву `qore-cart-session`.
const CART_SESSION_STORAGE_KEY = 'qore-cart-session';

function getPrompt(rating: number): string {
    // За низького рейтингу змінюємо текст на співчутливий
    if (rating > 0 && rating <= 3) {
        return "We're sorry! What went wrong?";
    }
    return 'Tell us more (optional)';
}

export function PostOrderFeedback({
    slug,
    orderId,
    guestName: guestNameProp,
    className,
    onSubmitted,
}: PostOrderFeedbackProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [guestName, setGuestName] = useState(guestNameProp ?? '');
    const [submitted, setSubmitted] = useState(false);

    const submitMutation = useSubmitFeedback(slug);

    // Під час монтування намагаємося підставити ім'я гостя зі збереженої сесії кошика.
    useEffect(() => {
        if (guestNameProp) {
            setGuestName(guestNameProp);
            return;
        }
        try {
            const raw = sessionStorage.getItem(CART_SESSION_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as { state?: { guestName?: string | null } };
                const storedName = parsed.state?.guestName;
                if (storedName) setGuestName(storedName);
            }
        } catch {
            // Некоректний JSON у sessionStorage — ігноруємо, ім'я залишиться порожнім
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeRating = hoverRating || rating;
    const showDetails = rating > 0;

    const handleSubmit = async () => {
        if (rating === 0) return;
        try {
            await submitMutation.mutateAsync({
                rating,
                comment: comment.trim() ? comment.trim() : undefined,
                guestName: guestName.trim() ? guestName.trim() : undefined,
                orderId,
            });
            setSubmitted(true);
            onSubmitted?.();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
            toast.error(message);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={`flex flex-col items-center gap-3 py-6 text-center ${className ?? ''}`}>
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/15 text-[#04916C] dark:text-[#10B981]">
                    <Star size={26} className="fill-[#10B981] text-[#10B981]" />
                </motion.span>
                <p className={`${display.className} text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    Thank you for your feedback!
                </p>
                <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                    Your review helps us serve you better.
                </p>
            </motion.div>
        );
    }

    return (
        <div className={`${className ?? ''}`}>
            <h3 className={`${display.className} text-center text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                How was your experience?
            </h3>

            {/* Великі інтерактивні зірки */}
            <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    const filled = value <= activeRating;
                    return (
                        <motion.button
                            key={value}
                            type="button"
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.08 }}
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(0)}
                            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                            className="rounded-full p-1 transition-colors">
                            <Star
                                size={40}
                                strokeWidth={1.6}
                                className={
                                    filled
                                        ? 'fill-[#FBBF24] text-[#FBBF24]'
                                        : 'text-[#E7E5E0] dark:text-white/15'
                                }
                            />
                        </motion.button>
                    );
                })}
            </div>

            {/* Прогресивне розкриття: ім'я, текст + кнопка з'являються після вибору рейтингу */}
            <AnimatePresence initial={false}>
                {showDetails && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="overflow-hidden">
                        <div className="space-y-4 pt-5">
                            <label className="block">
                                <span className="mb-1.5 block text-[13px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                                    Your Name (optional)
                                </span>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    maxLength={60}
                                    placeholder="e.g. Alex"
                                    className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[#0A0A0C] outline-none transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6]/50 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]"
                                />
                            </label>

                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                                    {getPrompt(rating)}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Share the details of your visit…"
                                    className="w-full resize-none rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[#0A0A0C] outline-none transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6]/50 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]"
                                />
                            </div>

                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                disabled={submitMutation.isPending}
                                className="flex w-full items-center justify-center rounded-full bg-[#0A0A0C] px-6 py-3.5 text-[14px] font-medium text-white shadow-lg shadow-[#0A0A0C]/15 transition-colors hover:bg-[#232327] disabled:opacity-60 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:shadow-white/10 dark:hover:bg-white">
                                {submitMutation.isPending ? 'Submitting…' : 'Submit'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
