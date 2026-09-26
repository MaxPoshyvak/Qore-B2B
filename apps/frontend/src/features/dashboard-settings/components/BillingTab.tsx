'use client';

import * as React from 'react';
import { PRICING_PLANS, PLAN_RANK, type SubscriptionPlanId } from '@my-app/types';
import { PricingCard } from '@/shared/ui/PricingCard';
import { toast } from './Toaster';

type BillingTabProps = {
    currentPlan?: SubscriptionPlanId;
};

export function BillingTab({ currentPlan = 'free' }: BillingTabProps) {
    const currentRank = PLAN_RANK[currentPlan] ?? 0;
    const currentPlanMeta = PRICING_PLANS.find((p) => p.id === currentPlan);

    const handleUpgrade = (tier: string) => {
        toast.success(`Upgrade to ${tier} initiated. Billing integration will complete the checkout.`);
    };

    return (
        <div className="space-y-6">
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
                    const isCurrent = plan.id === currentPlan;
                    const planRank = PLAN_RANK[plan.id];
                    const isUpgrade = planRank > currentRank;

                    return (
                        <PricingCard
                            key={plan.id}
                            tier={plan.tier}
                            price={plan.price}
                            period={plan.period}
                            description={plan.description}
                            features={plan.features}
                            featured={plan.featured}
                            isCurrent={isCurrent}
                            animate={false}
                            ctaText={isCurrent ? 'Current Plan' : isUpgrade ? `Upgrade to ${plan.tier}` : plan.ctaText}
                            onCtaClick={!isCurrent ? () => handleUpgrade(plan.tier) : undefined}
                            disabled={isCurrent}
                        />
                    );
                })}
            </div>
        </div>
    );
}
