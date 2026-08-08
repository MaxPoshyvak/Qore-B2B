'use client';

import { motion } from 'framer-motion';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { TiltCard } from './TiltCard';

export function StepCard({ n, icon: Icon, title, desc }: { n: string; icon: React.ElementType; title: string; desc: string }) {
    return (
        <TiltCard strength={7}>
            <motion.div
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative h-full overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-7 transition-colors duration-300 hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:hover:border-[#3B82F6]/40">
                <span
                    aria-hidden
                    className={`${display.className} pointer-events-none absolute -right-2 -top-6 text-[92px] font-bold leading-none text-[#0A0A0C]/[0.04] dark:text-white/[0.04]`}>
                    {n}
                </span>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                    <Icon size={19} strokeWidth={1.75} />
                </motion.div>
                <h3
                    className={`${display.className} relative mt-5 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {title}
                </h3>
                <p className="relative mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">{desc}</p>
            </motion.div>
        </TiltCard>
    );
}
