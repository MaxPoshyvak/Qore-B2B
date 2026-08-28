'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquareHeart, Star, PencilLine } from 'lucide-react';

import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { Modal } from '@/shared/ui/Modal';
import { Reveal } from '@/shared/ui/Reveal';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { Toaster } from '@/shared/ui/Toaster';
import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { VenueFooter } from '@/features/public-venue/components';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import { PostOrderFeedback, usePublicFeedbacks } from '@/features/feedback';

function DisplayStars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    className={
                        i < rating ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[#E7E5E0] dark:text-white/10'
                    }
                />
            ))}
        </div>
    );
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '';
    }
}

export default function PublicReviewsPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant, isLoading, isError } = useGetPublicTenant(resolvedSlug);
    const { data: feedbacks, isLoading: isLoadingFeedbacks } = usePublicFeedbacks(resolvedSlug);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <main className="relative min-h-screen bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader
                centerContent={
                    tenant?.name ? (
                        <span className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {tenant.name}
                        </span>
                    ) : null
                }>
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </BaseHeader>

            <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
                {isLoading ? (
                    <div className="mt-6 h-52 animate-pulse rounded-[2rem] bg-white/40 dark:bg-white/5" />
                ) : isError || !tenant ? (
                    <MenuNotFound slug={resolvedSlug} />
                ) : (
                    <>
                        <Reveal>
                            <div className="mt-6">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBBF24]/15 text-[#B45309] dark:text-[#FBBF24]">
                                        <MessageSquareHeart size={19} strokeWidth={1.9} />
                                    </span>
                                    <div>
                                        <p className="text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70">
                                            Guest Reviews
                                        </p>
                                        <h1
                                            className={`${display.className} text-2xl font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                            What guests are saying
                                        </h1>
                                    </div>
                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                    Real feedback from visitors at {tenant.name}.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setModalOpen(true)}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#E7E5E0] px-6 py-3.5 text-[14px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]">
                                    <PencilLine size={17} strokeWidth={1.9} />
                                    Leave a Review
                                </button>
                            </div>
                        </Reveal>

                        {/* Список опублікованих відгуків */}
                        <Reveal delay={0.1}>
                            <div className="mt-8 space-y-3">
                                {isLoadingFeedbacks ? (
                                    <div className="h-32 animate-pulse rounded-[1.75rem] bg-white/40 dark:bg-white/5" />
                                ) : feedbacks && feedbacks.length > 0 ? (
                                    feedbacks.map((review, index) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.04, ease: EASE }}
                                            className="rounded-[1.75rem] border border-white/60 bg-white/80 px-5 py-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-[14px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    {review.guestName ?? 'Anonymous'}
                                                </span>
                                                <span className="text-[10.5px] uppercase tracking-wider text-[#9C9B95]">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                            <div className="mt-1.5">
                                                <DisplayStars rating={review.rating} />
                                            </div>
                                            {review.comment && (
                                                <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.75rem] border border-white/60 bg-white/80 px-5 py-8 text-center shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                                            No reviews yet. Be the first to share your experience!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Reveal>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-10">
                            <VenueFooter />
                        </motion.div>
                    </>
                )}
            </div>

            {/* Модалка з формою відгуку (без orderId для прямого візиту) */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Leave a Review"
                description={`Share your experience at ${tenant?.name ?? 'this venue'}`}>
                <PostOrderFeedback slug={resolvedSlug} onSubmitted={() => setModalOpen(false)} />
            </Modal>

            <Toaster />
        </main>
    );
}
