'use client';

import { useTranslations } from 'next-intl';
import { display } from '@/shared/lib/fonts';
import { PRICING_PLANS, type SubscriptionPlanId } from '@my-app/types';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { PricingCard } from '@/shared/ui/PricingCard';

export function PricingSection() {
    const t = useTranslations('landing.pricing');
    const tPricing = useTranslations('pricing');

    const localizedPlansMeta: Record<
        SubscriptionPlanId,
        { description: string; ctaText: string; features: string[] }
    > = {
        free: {
            description: tPricing('freeDesc'),
            ctaText: tPricing('startForFree'),
            features: [
                tPricing('freeFeature1'),
                tPricing('freeFeature2'),
                tPricing('freeFeature3'),
                tPricing('freeFeature4'),
                tPricing('freeFeature5'),
                tPricing('freeFeature6'),
            ],
        },
        pro: {
            description: tPricing('proDesc'),
            ctaText: tPricing('upgradeToPro'),
            features: [
                tPricing('proFeature1'),
                tPricing('proFeature2'),
                tPricing('proFeature3'),
                tPricing('proFeature4'),
                tPricing('proFeature5'),
                tPricing('proFeature6'),
            ],
        },
        business: {
            description: tPricing('businessDesc'),
            ctaText: tPricing('upgradeToBusiness'),
            features: [
                tPricing('businessFeature1'),
                tPricing('businessFeature2'),
                tPricing('businessFeature3'),
                tPricing('businessFeature4'),
                tPricing('businessFeature5'),
                tPricing('businessFeature6'),
            ],
        },
    };

    return (
        <section
            id="pricing"
            className="border-b border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
            <div className="mx-auto max-w-6xl px-6 py-24">
                <Reveal className="text-center">
                    <div className="flex justify-center">
                        <Eyebrow>{t('badge')}</Eyebrow>
                    </div>
                    <h2 className={`${display.className} text-[26px] font-bold sm:text-[34px]`}>{t('title')}</h2>
                </Reveal>

                <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
                    {PRICING_PLANS.map((p) => {
                        const localized = localizedPlansMeta[p.id];
                        return (
                            <PricingCard
                                key={p.id}
                                tier={p.tier}
                                price={p.price}
                                period={p.period}
                                description={localized?.description ?? p.description}
                                features={localized?.features ?? p.features}
                                featured={p.featured}
                                ctaText={localized?.ctaText ?? p.ctaText}
                                ctaHref={`/register?plan=${p.id}`}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
