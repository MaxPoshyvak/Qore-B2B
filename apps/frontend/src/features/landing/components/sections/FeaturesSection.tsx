'use client';

import { motion } from 'framer-motion';

import { display } from '@/shared/lib/fonts';
import { EASE, fadeUp, stagger } from '@/shared/config/animations';
import { FEATURES } from '../../config/landing-data';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { FeatureCard } from '../ui/FeatureCard';

export function FeaturesSection() {
    return (
        <section
            id="features"
            className="border-y border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
            <div className="mx-auto max-w-6xl px-6 py-24">
                <Reveal>
                    <Eyebrow tone="green">Free features</Eyebrow>
                    <h2 className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        Everything a venue needs — free
                    </h2>
                    <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Live cart, split billing, order-ahead, and the 86 list are all on the Free plan. We
                        don&apos;t hold these back to upsell you — only AI is paid.
                    </p>
                </Reveal>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={stagger}
                    className="mt-12 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f, i) => (
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
