'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

import { display, mono, body } from '../../lib/fonts';
import { EASE } from '../../config/animations';
import { MagneticButton } from './MagneticButton';

export function PricingCard({
    tier,
    price,
    period,
    description,
    features,
    featured = false,
    cta,
}: {
    tier: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    featured?: boolean;
    cta: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className={`relative flex h-full flex-col rounded-[26px] px-7 pb-8 pt-9 ${
                featured
                    ? 'border-2 border-[#3B82F6] bg-white shadow-xl dark:bg-[#141417]'
                    : 'border border-[#E7E5E0] bg-white dark:border-[#232327] dark:bg-[#141417]'
            }`}>
            {featured && (
                <span
                    className={`${mono.className} absolute -top-3 left-7 rounded-full bg-[#3B82F6] px-3 py-1 text-[10px] uppercase tracking-widest text-white`}>
                    recommended
                </span>
            )}
            <span className={`${mono.className} text-[11px] uppercase tracking-[0.2em] text-[#3B82F6]`}>{tier}</span>
            <div className="mt-3 flex items-baseline gap-1.5">
                <span className={`${display.className} text-[36px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {price}
                </span>
                {period && (
                    <span className={`${body.className} text-[13px] text-[#6B6A65] dark:text-[#94938D]`}>{period}</span>
                )}
            </div>
            <p className={`${body.className} mt-3 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                {description}
            </p>
            <div className="my-6 border-t border-[#E7E5E0] dark:border-[#232327]" />
            <ul className="flex-1 space-y-3">
                {features.map((f, i) => (
                    <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                        className={`${body.className} flex items-start gap-2.5 text-[13.5px]`}>
                        <Check
                            size={15}
                            className="mt-0.5 shrink-0 text-[#04916C] dark:text-[#10B981]"
                            strokeWidth={2.5}
                        />
                        <span className="text-[#3A3A36] dark:text-[#C7C6C1]">{f}</span>
                    </motion.li>
                ))}
            </ul>
            <MagneticButton
                primary={featured}
                showSparks={featured}
                className={`${body.className} mt-8 flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-medium transition-colors ${
                    featured
                        ? 'bg-[#0A0A0C] text-white hover:bg-[#232327] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA]'
                        : 'border border-[#E7E5E0] text-[#0A0A0C] hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]'
                }`}>
                {cta}
                <ArrowRight size={15} />
            </MagneticButton>
        </motion.div>
    );
}
