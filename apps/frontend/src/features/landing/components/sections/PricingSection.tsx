'use client';

import { display } from '@/shared/lib/fonts';
import { PRICING_PLANS } from '@my-app/types';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { PricingCard } from '@/shared/ui/PricingCard';

export function PricingSection() {
    return (
        <section
            id="pricing"
            className="border-b border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
            <div className="mx-auto max-w-6xl px-6 py-24">
                <Reveal className="text-center">
                    <div className="flex justify-center">
                        <Eyebrow>No hidden terms</Eyebrow>
                    </div>
                    <h2 className={`${display.className} text-[26px] font-bold sm:text-[34px]`}>Pricing</h2>
                </Reveal>

                <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
                    {PRICING_PLANS.map((p) => (
                        <PricingCard
                            key={p.id}
                            tier={p.tier}
                            price={p.price}
                            period={p.period}
                            description={p.description}
                            features={p.features}
                            featured={p.featured}
                            ctaText={p.ctaText}
                            ctaHref={`/register?plan=${p.id}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
