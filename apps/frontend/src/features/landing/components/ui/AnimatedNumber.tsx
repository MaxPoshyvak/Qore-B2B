'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function AnimatedNumber({
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}) {
    const [display, setDisplay] = useState(0);
    const started = useRef(false);

    return (
        <motion.span
            viewport={{ once: true, margin: '-40px' }}
            onViewportEnter={() => {
                if (started.current) return;
                started.current = true;
                const duration = 1100;
                const start = performance.now();
                const tick = (now: number) => {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    setDisplay(value * eased);
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }}>
            {prefix}
            {display.toFixed(decimals)}
            {suffix}
        </motion.span>
    );
}
