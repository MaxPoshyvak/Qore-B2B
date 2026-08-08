'use client';

import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

export function CoffeeSteam() {
    return (
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
            <Coffee size={19} strokeWidth={1.75} />
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="absolute left-1/2 -top-1 h-4 w-2 rounded-full bg-[#3B82F6]/20 blur-sm"
                    animate={{
                        y: [0, -18, -30],
                        opacity: [0, 0.7, 0],
                        scale: [0.5, 1.3, 0.8],
                        x: [0, (i - 1) * 4, (i - 1) * 6],
                    }}
                    transition={{
                        duration: 2.2 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
}
