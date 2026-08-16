'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

export type Spark = { id: number; angle: number; distance: number; duration: number; color: string };

type MagneticButtonProps = {
    children: React.ReactNode;
    className?: string;
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    showSparks?: boolean;
};

const MotionLink = motion.create(Link);

export function MagneticButton({
    children,
    className,
    href = '#',
    onClick,
    showSparks = false,
}: MagneticButtonProps) {
    const ref = useRef<HTMLAnchorElement & HTMLSpanElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 350, damping: 20, mass: 0.3 });
    const springY = useSpring(y, { stiffness: 350, damping: 20, mass: 0.3 });
    const [sparks, setSparks] = useState<Spark[]>([]);

    function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const distX = (e.clientX - rect.left - rect.width / 2) * 0.35;
        const distY = (e.clientY - rect.top - rect.height / 2) * 0.35;
        x.set(distX);
        y.set(distY);
    }
    function handleLeave() {
        x.set(0);
        y.set(0);
    }

    const triggerSparks = useCallback(() => {
        if (!showSparks) return;
        const colors = ['#FBBF24', '#F59E0B', '#FDE047', '#FCD34D'];
        const newSparks: Spark[] = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
            distance: 20 + Math.random() * 15,
            duration: 0.5 + Math.random() * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        setSparks(newSparks);
        setTimeout(() => setSparks([]), 900);
    }, [showSparks]);

    const isExternal = /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');

    const motionProps = {
        ref: ref as never,
        onMouseMove: handleMove,
        onMouseLeave: handleLeave,
        onMouseEnter: triggerSparks,
        style: { x: springX, y: springY },
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.96 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
        className: `relative inline-flex ${className ?? ''}`,
    };

    const inner = (
        <>
            {children}
            <AnimatePresence>
                {sparks.map((spark) => (
                    <motion.span
                        key={spark.id}
                        initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 0,
                            x: Math.cos(spark.angle) * spark.distance,
                            y: Math.sin(spark.angle) * spark.distance,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: spark.duration, ease: 'easeOut' }}
                        className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                        style={{
                            backgroundColor: spark.color,
                            boxShadow: `0 0 8px ${spark.color}`,
                        }}
                    />
                ))}
            </AnimatePresence>
        </>
    );

    if (isExternal) {
        return (
            <motion.a href={href} onClick={onClick} {...motionProps}>
                {inner}
            </motion.a>
        );
    }

    return (
        <MotionLink href={href} onClick={onClick} {...motionProps}>
            {inner}
        </MotionLink>
    );
}
