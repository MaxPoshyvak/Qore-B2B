'use client';

import { motion } from 'framer-motion';
import {
    Lock,
    Sparkles,
    Star,
    MessageSquareHeart,
    BadgeCheck,
    ShieldAlert,
    Check,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Lightbulb,
    ThumbsUp,
    Target,
} from 'lucide-react';
import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { MagneticButton } from '@/shared/ui/MagneticButton';
import { Toaster, toast } from '@/shared/ui/Toaster';
import { useDashboardFeedbacks, useApproveFeedback, useReviewDigest } from '@/features/feedback';
import type { ReviewDigestResponse } from '@my-app/types';

function RowStars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={13}
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

const SENTIMENT_CONFIG = {
    positive: { icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Positive' },
    mixed: { icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Mixed' },
    negative: { icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Negative' },
} as const;

const TOPIC_SENTIMENT_STYLE = {
    positive: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    neutral: 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]',
    negative: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
} as const;

/** AI Digest section — real data from backend */
function AiDigestSection({ data, isLoading }: { data?: ReviewDigestResponse; isLoading: boolean }) {
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="rounded-[28px] border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-[#8B5CF6]/30 dark:bg-white/[0.04] dark:shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#8B5CF6]">
                        <Sparkles size={11} />
                        AI Pro
                    </span>
                    <h3 className={`${display.className} text-[20px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        AI Sentiment Analysis
                    </h3>
                </div>
                <div className="space-y-3">
                    <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
                        ))}
                    </div>
                    <div className="h-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
                </div>
            </motion.div>
        );
    }

    if (!data || !data.hasEnoughData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="rounded-[28px] border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-[#8B5CF6]/30 dark:bg-white/[0.04] dark:shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#8B5CF6]">
                        <Sparkles size={11} />
                        AI Pro
                    </span>
                    <h3 className={`${display.className} text-[20px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        AI Sentiment Analysis
                    </h3>
                </div>
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6]">
                        <MessageSquareHeart size={20} strokeWidth={1.9} />
                    </span>
                    <p className="max-w-sm text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Not enough text reviews to generate an AI digest yet. You need at least{' '}
                        <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">3 reviews with comments</span>{' '}
                        to unlock insights.
                    </p>
                    <p className={`${mono.className} text-[11px] uppercase tracking-wider text-[#9C9B95]`}>
                        {data?.reviewCount ?? 0} of 3 reviews collected
                    </p>
                </div>
            </motion.div>
        );
    }

    const digest = data.digest;
    if (!digest) return null;

    const sentimentCfg = SENTIMENT_CONFIG[digest.overallSentiment];
    const SentimentIcon = sentimentCfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="rounded-[28px] border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-[#8B5CF6]/30 dark:bg-white/[0.04] dark:shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#8B5CF6]">
                        <Sparkles size={11} />
                        AI Pro
                    </span>
                    <h3 className={`${display.className} text-[20px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        AI Sentiment Analysis
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    {/* Sentiment badge */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${sentimentCfg.bg} ${sentimentCfg.border} ${sentimentCfg.color}`}>
                        <SentimentIcon size={13} />
                        {sentimentCfg.label}
                    </span>
                    {/* Score */}
                    <span className={`${display.className} text-2xl font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        {digest.sentimentScore}%
                    </span>
                </div>
            </div>

            {/* Summary */}
            <p className="mb-4 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                &ldquo;{digest.summary}&rdquo;
            </p>

            {/* Topics */}
            <div className="mb-5 flex flex-wrap gap-2">
                {digest.topics.map((topic) => (
                    <span
                        key={topic.label}
                        className={`${mono.className} rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-wider ${TOPIC_SENTIMENT_STYLE[topic.sentiment]}`}>
                        {topic.emoji} {topic.label}
                    </span>
                ))}
            </div>

            {/* Strengths & Improvements grid */}
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Strengths */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="mb-2.5 flex items-center gap-1.5">
                        <ThumbsUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400`}>
                            Strengths
                        </span>
                    </div>
                    <ul className="space-y-1.5">
                        {digest.strengths.map((s, i) => (
                            <li key={i} className="text-[13px] leading-snug text-[#6B6A65] dark:text-[#94938D]">
                                • {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="mb-2.5 flex items-center gap-1.5">
                        <Target size={14} className="text-amber-600 dark:text-amber-400" />
                        <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-amber-700 dark:text-amber-400`}>
                            Areas to Improve
                        </span>
                    </div>
                    <ul className="space-y-1.5">
                        {digest.improvements.map((s, i) => (
                            <li key={i} className="text-[13px] leading-snug text-[#6B6A65] dark:text-[#94938D]">
                                • {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Actionable Tip */}
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-4">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#3B82F6]" />
                <div>
                    <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#3B82F6]`}>
                        Actionable Tip
                    </span>
                    <p className="mt-1 text-[13px] leading-snug text-[#6B6A65] dark:text-[#94938D]">
                        {digest.actionableTip}
                    </p>
                </div>
            </div>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#9C9B95]`}>
                    Based on {data.reviewCount} reviews
                </span>
                <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#9C9B95]`}>
                    Avg. rating: {data.averageRating.toFixed(1)}/5
                </span>
                {data.analyzedAt && (
                    <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#9C9B95]`}>
                        Analyzed {formatDate(data.analyzedAt)}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

/** Pro teaser — lock overlay for free-tier users */
function ProTeaser({ slug }: { slug: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative overflow-hidden rounded-[28px] border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-[#8B5CF6]/30 dark:bg-white/[0.04] dark:shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#8B5CF6]">
                    <Sparkles size={11} />
                    AI Pro
                </span>
                <h3 className={`${display.className} text-[20px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    AI Sentiment Analysis
                </h3>
            </div>

            {/* Mock insights, obscured by the upgrade overlay */}
            <div className="pointer-events-none select-none space-y-3 opacity-60">
                <p className="text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                    &ldquo;Guests consistently praise your <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">flat white</span> and
                    speed of service, while <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">wait times on weekends</span> are
                    the top friction point. Consider adding a second barista on Saturdays.&rdquo;
                </p>
                <div className="flex flex-wrap gap-2">
                    {['☕ Coffee', '⚡ Speed', '🪑 Ambience', '⏱ Wait time'].map((tag) => (
                        <span
                            key={tag}
                            className={`${mono.className} rounded-full border border-[#8B5CF6]/30 bg-white/60 px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-[#8B5CF6] dark:bg-white/5`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Obscuring overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 bg-gradient-to-t from-white/85 via-white/40 to-transparent px-6 pb-7 backdrop-blur-md dark:from-[#0A0A0C]/85 dark:via-[#0A0A0C]/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6]">
                    <Lock size={20} strokeWidth={1.9} />
                </span>
                <MagneticButton
                    href={`/dashboard/${slug}/settings?section=billing`}
                    className={`${display.className} flex items-center gap-2 rounded-full bg-[#8B5CF6] px-6 py-3.5 text-[14px] font-medium text-white shadow-lg shadow-[#8B5CF6]/30 transition-colors hover:bg-[#A78BFA]`}>
                    <Sparkles size={15} />
                    Unlock AI Analytics with Pro
                </MagneticButton>
            </div>
        </motion.div>
    );
}

export function FeedbackView({ tenantId, slug, subscriptionPlan }: { tenantId: string; slug: string; subscriptionPlan?: string }) {
    const isPro = subscriptionPlan === 'pro' || subscriptionPlan === 'business';
    const { data: feedbacks, isLoading } = useDashboardFeedbacks(tenantId);
    const approveMutation = useApproveFeedback(tenantId);
    const { data: digestData, isLoading: digestLoading } = useReviewDigest(tenantId, isPro);

    const handleApprove = async (feedbackId: string) => {
        try {
            await approveMutation.mutateAsync(feedbackId);
            toast.success('Review approved and published');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to approve review');
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Digest — real data for Pro, teaser for free */}
            {isPro ? (
                <AiDigestSection data={digestData} isLoading={digestLoading} />
            ) : (
                <ProTeaser slug={slug} />
            )}

            {/* Customer ratings (реальні дані дашборду) */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                <div className="mb-6 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#04916C]/10 text-[#04916C] dark:text-[#10B981]">
                        <MessageSquareHeart size={17} strokeWidth={1.9} />
                    </span>
                    <div>
                        <p
                            className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                            Recent
                        </p>
                        <h3 className={`${display.className} text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Customer Ratings
                        </h3>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-32 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
                ) : !feedbacks || feedbacks.length === 0 ? (
                    <p className="text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                        No reviews yet. Share your QR code to start collecting feedback.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {feedbacks.map((review) => {
                            const isFlagged = review.status === 'flagged';
                            return (
                                <li
                                    key={review.id}
                                    className={`rounded-2xl border px-4 py-3.5 transition-colors ${
                                        isFlagged
                                            ? 'border-amber-400/50 bg-amber-400/[0.06] dark:border-amber-400/40'
                                             : 'border-black/5 bg-card/50 dark:border-white/10'
                                    }`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                {review.guestName ?? 'Anonymous'}
                                            </span>

                                            {/* Перевірено через замовлення */}
                                            {review.order && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-[#04916C]/30 bg-[#04916C]/10 px-2 py-0.5 text-[10.5px] font-medium text-[#04916C] dark:text-[#10B981]">
                                                    <BadgeCheck size={12} />
                                                    Verified Order:{' '}
                                                    <span className={`${display.className} tabular-nums`}>
                                                        ${review.order.totalAmount.toFixed(2)}
                                                    </span>
                                                </span>
                                            )}

                                            {/* Бейдж прихованого (flagged) відгуку */}
                                            {isFlagged && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10.5px] font-medium text-amber-600 dark:text-amber-400">
                                                    <ShieldAlert size={12} />
                                                    Flagged
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#9C9B95]`}>
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    <div className="mt-1.5">
                                        <RowStars rating={review.rating} />
                                    </div>

                                    {review.comment && (
                                        <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                            {review.comment}
                                        </p>
                                    )}

                                    {/* Модерація: схвалення прихованого відгуку */}
                                    {isFlagged && (
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(review.id)}
                                            disabled={approveMutation.isPending}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0A0A0C] px-4 py-2 text-[12.5px] font-medium text-white shadow-sm transition-colors hover:bg-[#232327] disabled:opacity-60 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white">
                                            <Check size={14} />
                                            Approve Review
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </motion.div>

            <Toaster />
        </div>
    );
}
