'use client';

import { motion } from 'framer-motion';

import { display } from '../../lib/fonts';
import { EASE, stagger } from '../../config/animations';
import { HOW_STEPS } from '../../config/landing-data';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { StepCard } from '../ui/StepCard';

export function HowItWorksSection() {
    return (
        <section id="how" className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
                <Eyebrow>At the table</Eyebrow>
                <h2 className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                    How it works at one table
                </h2>
            </Reveal>

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={stagger}
                className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                {HOW_STEPS.map((s, i) => (
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
