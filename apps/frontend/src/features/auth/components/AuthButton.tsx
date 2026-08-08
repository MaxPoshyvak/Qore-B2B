'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function AuthButton({
    children,
    loading = false,
    className = '',
}: {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 350, damping: 20, mass: 0.3 });
    const springY = useSpring(y, { stiffness: 350, damping: 20, mass: 0.3 });

    function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    }
    function handleLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.button
            ref={ref}
            type="submit"
            disabled={loading}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ x: springX, y: springY }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#0A0A0C] px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#232327] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white ${className}`}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {children}
        </motion.button>
    );
}
