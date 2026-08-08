'use client';

import { motion } from 'framer-motion';

export function ScanningWave({ buttonX, buttonY }: { buttonX: number; buttonY: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, times: [0, 0.1, 0.8, 1] }}
            className="pointer-events-none absolute inset-0 z-20"
            style={{
                background: `radial-gradient(circle at ${buttonX}% ${buttonY}%, transparent 0%, rgba(139,92,246,0.4) 45%, rgba(59,130,246,0.3) 50%, transparent 55%)`,
                backgroundSize: '400% 400%',
            }}
        />
    );
}
