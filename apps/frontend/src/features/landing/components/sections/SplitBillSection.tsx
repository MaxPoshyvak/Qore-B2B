'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { LiveTablePanel } from '../demo/LiveTablePanel';

export function SplitBillSection() {
    const t = useTranslations('landing.splitBill');

    const benefits = [
        t('benefit1'),
        t('benefit2'),
        t('benefit3'),
    ];

    return (
        <section className="overflow-hidden border-y border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 md:py-24">
                <Reveal>
                    <Eyebrow>{t('badge')}</Eyebrow>
                    <h2 className={`${display.className} text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        {t('title')}
                    </h2>
                    <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {t('description')}
                    </p>
                    <ul className="mt-6 space-y-3">
                        {benefits.map((benefitText, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                                className="flex items-center gap-3 text-[14px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                <Check
                                    size={16}
                                    className="shrink-0 text-[#04916C] dark:text-[#10B981]"
                                    strokeWidth={3}
                                />
                                {benefitText}
                            </motion.li>
                        ))}
                    </ul>
                </Reveal>
                <LiveTablePanel />
            </div>
        </section>
    );
}
