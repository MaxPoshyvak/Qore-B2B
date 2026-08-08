'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';

import type { Spark } from './MagneticButton';

export function LightningWithSparks({ size = 14 }: { size?: number }) {
    const [sparks, setSparks] = useState<Spark[]>([]);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!isHovered) return;
        const colors = ['#FBBF24', '#F59E0B', '#FDE047'];
        const interval = setInterval(() => {
            const newSparks: Spark[] = Array.from({ length: 4 }, (_, i) => ({
                id: Date.now() + i + Math.random(),
                angle: Math.random() * Math.PI * 2,
                distance: 8 + Math.random() * 8,
                duration: 0.4 + Math.random() * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            setSparks((prev) => [...prev.slice(-10), ...newSparks]);
        }, 400);
        return () => clearInterval(interval);
    }, [isHovered]);

    useEffect(() => {
        if (sparks.length === 0) return;
        const t = setTimeout(() => setSparks((p) => p.slice(4)), 600);
        return () => clearTimeout(t);
    }, [sparks]);

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <Zap size={size} className="text-[#3B82F6]" />
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
                        className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                        style={{
                            backgroundColor: spark.color,
                            boxShadow: `0 0 6px ${spark.color}`,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
