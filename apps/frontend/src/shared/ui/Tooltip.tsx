'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { EASE } from '@/shared/config/animations';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    side?: TooltipSide;
    align?: TooltipAlign;
    delayDuration?: number;
    className?: string;
    maxWidth?: string;
}

export function Tooltip({
    content,
    children,
    side = 'top',
    align = 'center',
    delayDuration = 150,
    className = '',
    maxWidth = 'max-w-xs',
}: TooltipProps) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setOpen(true);
        }, delayDuration);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Positioning classes
    const getPositionClasses = () => {
        switch (side) {
            case 'top':
                return 'bottom-full mb-2';
            case 'bottom':
                return 'top-full mt-2';
            case 'left':
                return 'right-full mr-2';
            case 'right':
                return 'left-full ml-2';
            default:
                return 'bottom-full mb-2';
        }
    };

    const getAlignClasses = () => {
        if (side === 'top' || side === 'bottom') {
            switch (align) {
                case 'start':
                    return 'left-0';
                case 'end':
                    return 'right-0';
                case 'center':
                default:
                    return 'left-1/2 -translate-x-1/2';
            }
        } else {
            switch (align) {
                case 'start':
                    return 'top-0';
                case 'end':
                    return 'bottom-0';
                case 'center':
                default:
                    return 'top-1/2 -translate-y-1/2';
            }
        }
    };

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}>
            {children}

            <AnimatePresence>
                {open && content && (
                    <motion.div
                        role="tooltip"
                        initial={{
                            opacity: 0,
                            scale: 0.94,
                            y: side === 'top' ? 4 : side === 'bottom' ? -4 : 0,
                            x: side === 'left' ? 4 : side === 'right' ? -4 : 0,
                        }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.15, ease: EASE }}
                        className={`pointer-events-none absolute z-50 ${getPositionClasses()} ${getAlignClasses()} ${maxWidth} whitespace-normal rounded-xl border border-black/10 bg-[#0A0A0C] px-3 py-2 text-left text-xs font-normal leading-relaxed text-[#F5F4F2] shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#18181B] dark:text-[#E4E4E7] ${className}`}>
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface InfoTooltipProps {
    content: ReactNode;
    side?: TooltipSide;
    align?: TooltipAlign;
    size?: number;
    className?: string;
    maxWidth?: string;
    'aria-label'?: string;
}

export function InfoTooltip({
    content,
    side = 'top',
    align = 'center',
    size = 13,
    className = '',
    maxWidth = 'max-w-xs',
    'aria-label': ariaLabel = 'More information',
}: InfoTooltipProps) {
    const [touchOpen, setTouchOpen] = useState(false);

    return (
        <Tooltip content={content} side={side} align={align} maxWidth={maxWidth} className={className}>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTouchOpen((prev) => !prev);
                }}
                aria-label={ariaLabel}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#9C9B95] transition-colors hover:text-[#0A0A0C] focus:outline-hidden dark:text-[#71717A] dark:hover:text-[#FAFAFA]">
                <Info size={size} />
            </button>
        </Tooltip>
    );
}
