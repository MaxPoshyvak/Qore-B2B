'use client';

import { motion } from 'framer-motion';

import { display, body } from '@/shared/lib/fonts';
import { GlowCard } from '@/shared/ui/GlowCard';
import { TiltCard } from './TiltCard';
import { CoffeeSteam } from './CoffeeSteam';
import { LightningWithSparks } from './LightningWithSparks';

export function FeatureCard({
    icon: Icon,
    title,
    desc,
    span = false,
    iconType = 'default',
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    span?: boolean;
    iconType?: 'default' | 'lightning' | 'coffee';
}) {
    return (
        <TiltCard strength={6} className={span ? 'sm:col-span-2' : ''}>
            <GlowCard className="p-7">
                <div className="mb-5">
                    {iconType === 'lightning' ? (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10">
                            <LightningWithSparks size={19} />
                        </div>
                    ) : iconType === 'coffee' ? (
                        <CoffeeSteam />
                    ) : (
                        <motion.div
                            whileHover={{ rotate: -8, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                            <Icon size={19} strokeWidth={1.75} />
                        </motion.div>
                    )}
                </div>
                <h3 className={`${display.className} mb-2 text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {title}
                </h3>
                <p className={`${body.className} text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                    {desc}
                </p>
            </GlowCard>
        </TiltCard>
    );
}
