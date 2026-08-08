'use client';

import { motion } from 'framer-motion';

import { EASE } from '@/shared/config/animations';

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay } },
            }}>
            {children}
        </motion.div>
    );
}
