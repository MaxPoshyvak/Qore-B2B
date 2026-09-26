'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Loader2 } from 'lucide-react';
import { PRICING_PLANS, PLAN_RANK, type SubscriptionPlanId } from '@my-app/types';
import { PricingCard } from '@/shared/ui/PricingCard';
import { useCreateCheckoutSession, useCreatePortalSession } from '../hooks/use-billing';
import { BillingApi } from '../api/billing.api';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { UpgradeConfirmModal } from './UpgradeConfirmModal';
import { toast } from './Toaster';

export type BillingTabProps = {
    tenantId: string;
    slug?: string;
    currentPlan?: SubscriptionPlanId;
    subscriptionStatus?: string | null;
    subscriptionExpiresAt?: Date | string | null;
};

export function BillingTab({
    tenantId,
    slug,
    currentPlan = 'free',
    subscriptionStatus: initialStatus = 'active',
    subscriptionExpiresAt: initialExpiresAt = null,
}: BillingTabProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const sessionId = searchParams?.get('session_id');

    // Polling state when returning from Stripe Checkout with session_id
    const [isPolling, setIsPolling] = useState<boolean>(!!sessionId);
    const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null);

    // Modal state for confirming direct upgrade from Pro -> Business
    const [confirmTargetPlan, setConfirmTargetPlan] = useState<SubscriptionPlanId | null>(null);
    const [isConfirmingUpgrade, setIsConfirmingUpgrade] = useState<boolean>(false);

    // Track polling attempts to enforce max 8 seconds / 6 attempts (6 * 1200ms = 7.2s)
    const attemptsRef = useRef(0);
    const initialPlanRef = useRef<SubscriptionPlanId>(currentPlan);

    // Live query for active tenant with 1200ms polling when isPolling is active
    const { data: tenantData } = useGetTenantBySlug(slug ?? '', {
        refetchInterval: isPolling ? 1200 : false,
        enabled: !!slug,
    });

    const liveTenant = tenantData?.data;
    const effectivePlan: SubscriptionPlanId =
        (liveTenant?.subscriptionPlan as SubscriptionPlanId) ?? currentPlan;
    const effectiveStatus = liveTenant?.subscriptionStatus ?? initialStatus;
    const effectiveExpiresAt = liveTenant?.subscriptionExpiresAt ?? initialExpiresAt;

    const checkoutMutation = useCreateCheckoutSession(tenantId);
    const portalMutation = useCreatePortalSession(tenantId);

    // 1. Fast-path: immediately request session verification on mount if session_id is present
    useEffect(() => {
        if (!sessionId) return;

        let active = true;

        async function verify() {
            try {
                await BillingApi.verifySession(tenantId, sessionId!);
                if (!active) return;
                // Invalidate query to trigger live tenant update right away
                await queryClient.invalidateQueries({ queryKey: ['tenants'] });
                if (slug) {
                    await queryClient.refetchQueries({ queryKey: ['tenants', 'details', slug] });
                }
            } catch (err) {
                console.error('Session verification fast-path (polling will continue):', err);
            }
        }

        verify();

        return () => {
            active = false;
        };
    }, [sessionId, tenantId, slug, queryClient]);

    // 2. Polling effect: watch for plan change or max 6 attempts / 8 seconds
    useEffect(() => {
        if (!isPolling) return;

        attemptsRef.current += 1;

        // Check if plan has changed from the initial plan
        const hasUpgraded =
            effectivePlan !== initialPlanRef.current &&
            (PLAN_RANK[effectivePlan] ?? 0) > (PLAN_RANK[initialPlanRef.current] ?? 0);

        if (hasUpgraded) {
            setIsPolling(false);
            router.replace(pathname + '?section=billing', { scroll: false });
            toast.success('Subscription activated successfully!');
            return;
        }

        // Stop polling after 6 attempts (6 * 1.2s = 7.2s)
        if (attemptsRef.current >= 6) {
            setIsPolling(false);
            router.replace(pathname + '?section=billing', { scroll: false });
            if (effectivePlan !== initialPlanRef.current) {
                toast.success('Subscription activated successfully!');
            }
        }
    }, [isPolling, effectivePlan, pathname, router]);

    // 3. Safety timeout: guarantees polling stops after 8 seconds under any circumstance
    useEffect(() => {
        if (!isPolling) return;

        const timeout = setTimeout(() => {
            setIsPolling(false);
            router.replace(pathname + '?section=billing', { scroll: false });
        }, 8000);

        return () => clearTimeout(timeout);
    }, [isPolling, pathname, router]);

    // Handle initial CTA click for a plan
    const handlePlanCta = (targetPlan: SubscriptionPlanId) => {
        // If venue already has an active paid plan and is upgrading (e.g. Pro -> Business):
        // Show confirmation modal to prevent unexpected instant charging
        if (effectivePlan !== 'free') {
            setConfirmTargetPlan(targetPlan);
            return;
        }

        // Free tier users proceed directly to standard Stripe Checkout
        handleCheckout(targetPlan);
    };

    // Execute direct upgrade from confirmation modal
    const handleConfirmUpgrade = async () => {
        if (!confirmTargetPlan) return;
        setIsConfirmingUpgrade(true);
        try {
            const data = await checkoutMutation.mutateAsync(confirmTargetPlan as 'pro' | 'business');

            if (data.upgradedImmediately) {
                setConfirmTargetPlan(null);
                toast.success('Successfully upgraded to Business plan!');
                await queryClient.invalidateQueries({ queryKey: ['tenants'] });
                if (slug) {
                    await queryClient.refetchQueries({ queryKey: ['tenants', 'details', slug] });
                }
                router.refresh();
                return;
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            toast.error('Failed to upgrade subscription.');
        } finally {
            setIsConfirmingUpgrade(false);
        }
    };

    // Standard checkout initiation for free plan users
    const handleCheckout = async (planId: SubscriptionPlanId) => {
        if (planId === 'free') return;
        setLoadingPlan(planId);
        try {
            const data = await checkoutMutation.mutateAsync(planId as 'pro' | 'business');

            if (data.upgradedImmediately) {
                toast.success('Successfully upgraded to Business plan!');
                await queryClient.invalidateQueries({ queryKey: ['tenants'] });
                if (slug) {
                    await queryClient.refetchQueries({ queryKey: ['tenants', 'details', slug] });
                }
                router.refresh();
                setLoadingPlan(null);
                return;
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            toast.error('Failed to start checkout process.');
            setLoadingPlan(null);
        }
    };

    const handleManage = async (planId: SubscriptionPlanId) => {
        setLoadingPlan(planId);
        try {
            const data = await portalMutation.mutateAsync();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            toast.error('Failed to access billing portal.');
            setLoadingPlan(null);
        }
    };

    const currentRank = PLAN_RANK[effectivePlan] ?? 0;
    const currentPlanMeta = PRICING_PLANS.find((p) => p.id === effectivePlan);
    const targetPlanMeta = PRICING_PLANS.find((p) => p.id === confirmTargetPlan);

    const formattedCancelDate = effectiveExpiresAt
        ? new Date(effectiveExpiresAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : 'the end of billing period';

    return (
        <div className="space-y-6">
            {/* Loading / Polling indicator after returning from Stripe Checkout */}
            {isPolling && (
                <div className="flex items-center gap-3 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-5 py-4 text-sm text-[#2563EB] dark:border-[#3B82F6]/20 dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                    <Loader2 size={18} className="shrink-0 animate-spin" />
                    <div>
                        <p className="font-semibold">Confirming your subscription with Stripe...</p>
                        <p className="text-xs opacity-80">
                            Activating your subscription. This takes just a moment...
                        </p>
                    </div>
                </div>
            )}

            {/* Warning badge if the subscription is in canceling state */}
            {effectiveStatus === 'canceling' && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400">
                    <Clock size={18} className="shrink-0 text-amber-500" />
                    <p className="font-medium">
                        Plan cancels on{' '}
                        <span className="font-semibold underline">{formattedCancelDate}</span>. You
                        still have access until then.
                    </p>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                    Billing &amp; Plan
                </h2>
                <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">
                    Choose the plan that fits your venue. You are currently on the{' '}
                    <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                        {currentPlanMeta?.tier ?? 'Free'}
                    </span>{' '}
                    plan.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {PRICING_PLANS.map((plan) => {
                    const planRank = PLAN_RANK[plan.id] ?? 0;
                    const isCurrent = effectivePlan === plan.id;

                    let onCtaClick: (() => void) | undefined = undefined;
                    let ctaText = plan.ctaText;
                    let disabled = isPolling;

                    if (isCurrent && effectivePlan !== 'free') {
                        ctaText = 'Manage Subscription';
                        onCtaClick = () => handleManage(plan.id);
                    } else if (isCurrent && effectivePlan === 'free') {
                        disabled = true;
                    } else if (planRank > currentRank) {
                        onCtaClick = () => handlePlanCta(plan.id);
                    } else if (planRank < currentRank) {
                        disabled = true;
                    }

                    return (
                        <PricingCard
                            key={plan.id}
                            planId={plan.id}
                            tier={plan.tier}
                            price={plan.price}
                            period={plan.period}
                            description={plan.description}
                            features={plan.features}
                            featured={plan.featured}
                            isCurrent={isCurrent}
                            ctaText={ctaText}
                            onCtaClick={onCtaClick}
                            disabled={disabled}
                            loading={loadingPlan === plan.id}
                            animate={false}
                        />
                    );
                })}
            </div>

            {/* Modal for confirming direct upgrade when a paid plan is already active */}
            <UpgradeConfirmModal
                open={!!confirmTargetPlan}
                onClose={() => {
                    if (!isConfirmingUpgrade) setConfirmTargetPlan(null);
                }}
                onConfirm={handleConfirmUpgrade}
                isLoading={isConfirmingUpgrade}
                currentPlanTier={currentPlanMeta?.tier ?? 'Pro'}
                currentPlanPrice={`${currentPlanMeta?.price ?? '$29'}${currentPlanMeta?.period ?? '/mo'}`}
                targetPlanTier={targetPlanMeta?.tier ?? 'Business'}
                targetPlanPrice={`${targetPlanMeta?.price ?? '$79'}${targetPlanMeta?.period ?? '/mo'}`}
            />
        </div>
    );
}
