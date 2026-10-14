'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { display } from '@/shared/lib/fonts';
import { EASE, stagger } from '@/shared/config/animations';
import { HOW_STEPS } from '../../config/landing-data';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { StepCard } from '../ui/StepCard';

export function HowItWorksSection() {
    const t = useTranslations('landing.howItWorks');

    const steps = [
        {
            n: '01',
            icon: HOW_STEPS[0].icon,
            title: t('step1Title'),
            desc: t('step1Desc'),
        },
        {
            n: '02',
            icon: HOW_STEPS[1].icon,
            title: t('step2Title'),
            desc: t('step2Desc'),
        },
        {
            n: '03',
            icon: HOW_STEPS[2].icon,
            title: t('step3Title'),
            desc: t('step3Desc'),
        },
    ];

    return (
        <section id="how" className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
                <Eyebrow>{t('badge')}</Eyebrow>
                <h2 className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                    {t('title')}
                </h2>
            </Reveal>

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={stagger}
                className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                {steps.map((s, i) => (
                    <motion.div
                        key={s.n}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}>
                        <StepCard n={s.n} icon={s.icon as React.ElementType} title={s.title} desc={s.desc} />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
