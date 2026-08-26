'use client';

import { Check, Crown, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

type Plan = {
    id: 'free' | 'pro' | 'business';
    name: string;
    price: string;
    period: string;
    features: string[];
    current: boolean;
    recommended: boolean;
};

const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: '/mo',
        current: true,
        recommended: false,
        features: ['1 venue', 'Public menu & QR ordering', 'Takeaway orders', 'Live Orders board'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        period: '/mo',
        current: false,
        recommended: true,
        features: [
            'Everything in Free',
            'Up to 3 venues',
            'Happy Hour rules',
            'Advanced analytics',
            'Priority support',
        ],
    },
    {
        id: 'business',
        name: 'Business',
        price: '$79',
        period: '/mo',
        current: false,
        recommended: false,
        features: [
            'Everything in Pro',
            'Unlimited venues',
            'Multi-user kitchen roles',
            'Custom AI themes',
            'Dedicated manager',
        ],
    },
];

export function BillingTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                    Billing &amp; Plan
                </h2>
                <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">
                    Choose the plan that fits your venue. You are currently on the Free plan.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {PLANS.map((plan) => {
                    const Icon = plan.id === 'business' ? Crown : Sparkles;
                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative flex flex-col rounded-2xl border p-5 backdrop-blur-sm',
                                plan.recommended
                                    ? 'border-[#8B5CF6]/40 bg-gradient-to-b from-[#8B5CF6]/[0.07] to-transparent shadow-lg dark:border-[#8B5CF6]/30'
                                    : 'border-black/5 bg-card/50 dark:border-white/10',
                            )}>
                            {plan.recommended && (
                                <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                                    Recommended
                                </span>
                            )}

                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-xl',
                                        plan.id === 'business'
                                            ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                                            : 'bg-[#3B82F6]/10 text-[#3B82F6]',
                                    )}>
                                    <Icon size={15} />
                                </span>
                                <h3 className="text-[15px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {plan.name}
                                </h3>
                                {plan.current && (
                                    <span className="ml-auto rounded-full bg-[#04916C]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#04916C] dark:text-[#10B981]">
                                        Current
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex items-baseline gap-1">
                                <span className="text-[26px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {plan.price}
                                </span>
                                <span className="text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="mt-4 flex-1 space-y-2">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                        <Check size={15} className="mt-0.5 shrink-0 text-[#04916C] dark:text-[#10B981]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                disabled={!plan.current}
                                className={cn(
                                    'mt-5 w-full rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors',
                                    plan.current
                                        ? 'cursor-default border border-black/10 bg-black/5 text-[#6B6A65] dark:border-white/15 dark:bg-white/5 dark:text-[#94938D]'
                                        : 'cursor-not-allowed border border-[#E7E5E0] bg-white/60 text-[#9C9B95] dark:border-white/10 dark:bg-white/5 dark:text-[#6E6D68]',
                                )}>
                                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
