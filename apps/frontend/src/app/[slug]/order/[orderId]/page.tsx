'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CheckCircle2, Clock, CookingPot, RotateCcw, Star, Store } from 'lucide-react';

import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { Modal } from '@/shared/ui/Modal';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { toast, Toaster } from '@/shared/ui/Toaster';
import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { formatPrice } from '@/shared/lib/utils';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { useOrderTracking } from '@/features/order-tracking/hooks/useOrderTracking';
import { PostOrderFeedback } from '@/features/feedback';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { useCartStore } from '@/features/public-menu/store/useCartStore';
import { BillPaymentCard } from '@/features/public-menu/components/BillPaymentCard';
import { useUnlockItems, useVerifyOrderPayment } from '@/features/public-menu/hooks/useOrderPayment';

const STATUS_STEPS = [
    { value: 'new', label: 'Pending', icon: Clock, accent: 'text-[#6B6A65] dark:text-[#94938D]' },
    { value: 'preparing', label: 'Preparing', icon: CookingPot, accent: 'text-[#B45309] dark:text-[#FBBF24]' },
    { value: 'ready', label: 'Ready', icon: BellRing, accent: 'text-[#2563EB] dark:text-[#60A5FA]' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle2, accent: 'text-[#04916C] dark:text-[#10B981]' },
] as const;

type StatusValue = (typeof STATUS_STEPS)[number]['value'] | 'cancelled';

function statusMeta(status: StatusValue) {
    if (status === 'cancelled') {
        return { label: 'Cancelled', icon: Clock, accent: 'text-red-500' };
    }
    return STATUS_STEPS.find((s) => s.value === status) ?? STATUS_STEPS[0];
}

function getStatusLabel(value: StatusValue, t: (key: string) => string) {
    switch (value) {
        case 'new': return t('statusReceived');
        case 'preparing': return t('statusPreparing');
        case 'ready': return t('statusReady');
        case 'delivered': return t('statusDelivered');
        case 'cancelled': return t('statusCancelled');
        default: return t('statusReceived');
    }
}

export default function OrderTrackingPage() {
    const t = useTranslations('publicMenu');
    const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
    const resolvedSlug = slug ?? '';
    const resolvedOrderId = orderId ?? '';
    const { theme, toggle, mounted } = useTheme();

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);
    const guestName = useCartStore((s) => s.guestName);

    const { data: tenant } = useGetPublicTenant(resolvedSlug);
    const { data: order, isLoading, isError } = useOrderTracking(resolvedOrderId);

    const verifyMutation = useVerifyOrderPayment(resolvedOrderId);
    const unlockMutation = useUnlockItems(resolvedOrderId);

    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackShown, setFeedbackShown] = useState(false);

    // Auto-verify payment on return from Stripe Checkout
    useEffect(() => {
        const paymentParam = searchParams.get('payment');
        const sessionId = searchParams.get('session_id');

        if (paymentParam === 'success' && sessionId) {
            verifyMutation.mutate(
                { sessionId },
                {
                    onSuccess: (data) => {
                        if (data.paid) {
                            toast.success(
                                data.paymentStatus === 'paid'
                                    ? 'Bill settled in full! Thank you.'
                                    : 'Your share was paid successfully!',
                            );
                        }
                    },
                },
            );
            router.replace(pathname, { scroll: false });
        } else if (paymentParam === 'cancelled') {
            if (guestSessionId) {
                unlockMutation.mutate(guestSessionId);
            }
            toast.error('Payment was cancelled.');
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, resolvedOrderId, pathname, router, guestSessionId]);

    const status = (order?.status ?? 'new') as StatusValue;
    const currentStepIndex = STATUS_STEPS.findIndex((s) => s.value === status);

    // Автоматично відкриваємо відгук, коли замовлення доставлено
    useEffect(() => {
        if (status === 'delivered' && !feedbackShown) {
            setFeedbackShown(true);
            setFeedbackOpen(true);
        }
    }, [status, feedbackShown]);

    const meta = useMemo(() => statusMeta(status), [status]);
    const StatusIcon = meta.icon;

    return (
        <main className="relative min-h-screen overflow-x-clip bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader
                centerContent={
                    tenant?.name ? (
                        <span className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {tenant.name}
                        </span>
                    ) : null
                }>
                <LanguageSwitcher />
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </BaseHeader>

            <div className="mx-auto max-w-xl px-3 sm:px-6 pb-20 pt-6">
                {isLoading ? (
                    <div className="mt-6 h-72 animate-pulse rounded-[2rem] bg-white/40 dark:bg-white/5" />
                ) : isError || !order ? (
                    <div className="mt-6 rounded-[2rem] border border-white/60 bg-white/80 px-6 py-12 text-center shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                            {t('orderNotFound')}
                        </p>
                        <Link
                            href={`/${resolvedSlug}/menu`}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0A0A0C] px-6 py-3 text-[14px] font-medium text-white dark:bg-[#F5F4F2] dark:text-[#0A0A0C]">
                            <Store size={16} />
                            {t('backToMenu')}
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Великий індикатор статусу */}
                        <motion.div
                            key={status}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="rounded-[2rem] border border-white/60 bg-white/80 px-4 py-6 sm:px-6 sm:py-8 text-center shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                            <motion.span
                                initial={{ scale: 0.6, rotate: -8 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/5 ${meta.accent}`}>
                                <StatusIcon size={38} strokeWidth={1.8} />
                            </motion.span>

                            <p className={`${display.className} mt-5 text-2xl font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                {getStatusLabel(status, t)}
                            </p>
                            <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">
                                {status === 'delivered'
                                    ? t('orderCompleteEnjoy')
                                    : status === 'cancelled'
                                      ? t('orderWasCancelled')
                                      : t('orderOnIt')}
                            </p>

                            {/* Степпер прогресу */}
                            <div className="mt-7 flex items-center justify-between gap-1">
                                {STATUS_STEPS.map((step, i) => {
                                    const done = i < currentStepIndex || status === 'delivered';
                                    const active = i === currentStepIndex && status !== 'delivered';
                                    const StepIcon = step.icon;
                                    return (
                                        <div key={step.value} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                    done || active
                                                        ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 ' + step.accent
                                                        : 'border-black/10 text-[#9C9B95] dark:border-white/10'
                                                }`}>
                                                <StepIcon size={16} strokeWidth={1.9} />
                                            </div>
                                            <span
                                                className={`text-[9px] sm:text-[10px] uppercase tracking-normal sm:tracking-wider text-center leading-tight truncate max-w-full px-0.5 ${
                                                    done || active ? 'text-[#0A0A0C] dark:text-[#F5F4F2]' : 'text-[#9C9B95]'
                                                }`}>
                                                {getStatusLabel(step.value, t)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Bill & Payment Card */}
                        <BillPaymentCard
                            orderId={resolvedOrderId}
                            guestSessionId={guestSessionId}
                            guestName={guestName}
                            isDineIn={!order.isOrderAhead}
                        />

                        {/* Позиції та сума */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                            className="mt-4 rounded-[2rem] border border-white/60 bg-white/80 p-4 sm:p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                            <div className="flex items-center justify-between">
                                <span className={`${display.className} text-[16px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {t('yourOrder')}
                                </span>
                                <span
                                    className={`${display.className} text-[16px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {formatPrice(order.totalAmount, order.currency)}
                                </span>
                            </div>

                            <ul className="mt-4 space-y-3">
                                {order.items.map((item) => (
                                    <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex min-w-0 items-center gap-2 text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[11px] font-semibold dark:bg-white/10">
                                                {item.quantity}
                                            </span>
                                            <span className="truncate">{item.menuItemName}</span>
                                        </span>
                                        <span className="shrink-0 tabular-nums text-[#6B6A65] dark:text-[#94938D]">
                                            {formatPrice(item.priceAtOrder * item.quantity, order.currency)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Дії */}
                        <div className="mt-5 flex flex-col gap-3">
                            {status === 'delivered' && !feedbackShown && (
                                <button
                                    type="button"
                                    onClick={() => setFeedbackOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-6 py-3.5 text-[14px] font-medium text-[#0A0A0C] shadow-lg shadow-[#FBBF24]/20 transition-colors hover:bg-[#FCD34D]">
                                    <Star size={17} className="fill-[#0A0A0C] text-[#0A0A0C]" />
                                    {t('leaveReview')}
                                </button>
                            )}

                            <Link
                                href={`/${resolvedSlug}/menu`}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E7E5E0] px-6 py-3.5 text-[14px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]">
                                <RotateCcw size={17} strokeWidth={1.9} />
                                {t('makeAnotherOrder')}
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Авто-відгук після доставки (Verified Review завдяки orderId) */}
            <Modal
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                title={t('howWasYourOrder')}
                description={t('feedbackDesc')}>
                <PostOrderFeedback
                    slug={resolvedSlug}
                    orderId={resolvedOrderId}
                    onSubmitted={() => setFeedbackOpen(false)}
                />
            </Modal>

            <Toaster />
        </main>
    );
}
