'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

import { useIsDesktop } from '@/shared/hooks/useIsDesktop';

export function TiltCard({
    children,
    className = '',
    strength = 8,
    disabled = false,
}: {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    /** When true (e.g. on mobile), render a static wrapper with no tilt. */
    disabled?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isDesktop = useIsDesktop();
    const isDisabled = disabled || !isDesktop;

    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const srx = useSpring(rx, { stiffness: 500, damping: 30, mass: 0.2 });
    const sry = useSpring(ry, { stiffness: 500, damping: 30, mass: 0.2 });

    function onMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        ry.set(px * strength);
        rx.set(-py * strength);
    }
    function onLeave() {
        rx.set(0);
        ry.set(0);
    }

    if (isDisabled) {
        return <div className={`h-full ${className}`}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
            className={`h-full ${className}`}>
            {children}
        </motion.div>
    );
}
