'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { display } from '@/shared/lib/fonts';
import { fadeUp, stagger } from '@/shared/config/animations';
import { FEATURES } from '../../config/landing-data';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { FeatureCard } from '../ui/FeatureCard';

export function FeaturesSection() {
    const t = useTranslations('landing.features');

    const localizedFeatures = [
        {
            ...FEATURES[0],
            title: t('liveCartTitle'),
            desc: t('liveCartDesc'),
        },
        {
            ...FEATURES[1],
            title: t('splitBillTitle'),
            desc: t('splitBillDesc'),
        },
        {
            ...FEATURES[2],
            title: t('orderAheadTitle'),
            desc: t('orderAheadDesc'),
        },
        {
            ...FEATURES[3],
            title: t('stopListTitle'),
            desc: t('stopListDesc'),
        },
        {
            ...FEATURES[4],
            title: t('happyHourTitle'),
            desc: t('happyHourDesc'),
        },
        {
            ...FEATURES[5],
            title: t('npsTitle'),
            desc: t('npsDesc'),
        },
    ];

    return (
        <section
            id="features"
            className="border-y border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
            <div className="mx-auto max-w-6xl px-6 py-24">
                <Reveal>
                    <Eyebrow tone="green">{t('badge')}</Eyebrow>
                    <h2 className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        {t('title')}
                    </h2>
                    <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {t('description')}
                    </p>
                </Reveal>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={stagger}
                    className="mt-12 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {localizedFeatures.map((f) => (
                        <motion.div key={f.title} variants={fadeUp} className={f.span ? 'sm:col-span-2 lg:col-span-1' : ''}>
                            <FeatureCard
                                icon={f.icon as React.ElementType}
                                title={f.title}
                                desc={f.desc}
                                span={f.span}
                                iconType={f.iconType}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
