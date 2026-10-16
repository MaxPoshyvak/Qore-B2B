'use client';

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { EASE } from '@/shared/config/animations';
import { cn } from '@/shared/lib/utils';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    side?: TooltipSide;
    align?: TooltipAlign;
    delayDuration?: number;
    className?: string;
    wrapperClassName?: string;
    maxWidth?: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface Coords {
    top: number;
    left: number;
    actualSide: TooltipSide;
    arrowOffset: number;
    arrowVerticalOffset: number;
}

function computePosition(
    triggerRect: DOMRect,
    tooltipWidth: number,
    tooltipHeight: number,
    preferredSide: TooltipSide,
    preferredAlign: TooltipAlign,
): Coords {
    const margin = 12; // Viewport edge margin
    const gap = 8; // Offset from target trigger
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Constrain dimensions to the available viewport area
    const safeWidth = Math.min(tooltipWidth, viewportWidth - margin * 2);
    const safeHeight = Math.min(tooltipHeight, viewportHeight - margin * 2);

    let actualSide = preferredSide;

    // If preferred side is horizontal (left/right), check if screen has enough space.
    // On mobile devices or narrow areas, automatically fallback to vertical (top/bottom).
    if (actualSide === 'left' || actualSide === 'right') {
        const spaceLeft = triggerRect.left - gap - margin;
        const spaceRight = viewportWidth - triggerRect.right - gap - margin;

        if (actualSide === 'left' && spaceLeft < safeWidth) {
            if (spaceRight >= safeWidth) {
                actualSide = 'right';
            } else {
                actualSide = triggerRect.top > safeHeight + gap + margin ? 'top' : 'bottom';
            }
        } else if (actualSide === 'right' && spaceRight < safeWidth) {
            if (spaceLeft >= safeWidth) {
                actualSide = 'left';
            } else {
                actualSide = triggerRect.top > safeHeight + gap + margin ? 'top' : 'bottom';
            }
        }
    }

    // Automatically flip vertical side if collision with viewport edges
    if (actualSide === 'top' && triggerRect.top - safeHeight - gap < margin) {
        actualSide = 'bottom';
    } else if (actualSide === 'bottom' && triggerRect.bottom + safeHeight + gap > viewportHeight - margin) {
        actualSide = 'top';
    }

    let top = 0;
    let left = 0;

    if (actualSide === 'top' || actualSide === 'bottom') {
        top = actualSide === 'top' ? triggerRect.top - safeHeight - gap : triggerRect.bottom + gap;

        const triggerCenter = triggerRect.left + triggerRect.width / 2;
        if (preferredAlign === 'start') {
            left = triggerRect.left;
        } else if (preferredAlign === 'end') {
            left = triggerRect.right - safeWidth;
        } else {
            left = triggerCenter - safeWidth / 2;
        }
    } else {
        left = actualSide === 'left' ? triggerRect.left - safeWidth - gap : triggerRect.right + gap;

        const triggerMiddle = triggerRect.top + triggerRect.height / 2;
        if (preferredAlign === 'start') {
            top = triggerRect.top;
        } else if (preferredAlign === 'end') {
            top = triggerRect.bottom - safeHeight;
        } else {
            top = triggerMiddle - safeHeight / 2;
        }
    }

    // ALWAYS strictly clamp horizontally and vertically inside viewport
    left = Math.max(margin, Math.min(left, viewportWidth - safeWidth - margin));
    top = Math.max(margin, Math.min(top, viewportHeight - safeHeight - margin));

    // Dynamic caret alignment pointing directly at trigger center
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const arrowOffset = Math.max(16, Math.min(triggerCenter - left, safeWidth - 16));

    const triggerMiddle = triggerRect.top + triggerRect.height / 2;
    const arrowVerticalOffset = Math.max(12, Math.min(triggerMiddle - top, safeHeight - 12));

    return { top, left, actualSide, arrowOffset, arrowVerticalOffset };
}

export function Tooltip({
    content,
    children,
    side = 'top',
    align = 'center',
    delayDuration = 120,
    className = '',
    wrapperClassName = '',
    maxWidth = 'max-w-[280px] sm:max-w-xs',
    isOpen: controlledOpen,
    onOpenChange,
}: TooltipProps) {
    const [mounted, setMounted] = useState(false);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [coords, setCoords] = useState<Coords | null>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(next);
            }
            onOpenChange?.(next);
        },
        [isControlled, onOpenChange],
    );

    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();

        // Default or measured dimensions
        const tooltipEl = tooltipRef.current;
        const width = tooltipEl ? tooltipEl.offsetWidth : 260;
        const height = tooltipEl ? tooltipEl.offsetHeight : 64;

        const nextCoords = computePosition(triggerRect, width, height, side, align);
        setCoords(nextCoords);
    }, [side, align]);

    // Recalculate position on open, scroll, or resize
    useEffect(() => {
        if (!open) {
            setCoords(null);
            return;
        }

        updatePosition();

        const handleScrollOrResize = () => {
            updatePosition();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, updatePosition, setOpen]);

    // Measure exact dimensions after mount/render via ResizeObserver
    useEffect(() => {
        if (!open || !tooltipRef.current) return;
        updatePosition();

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => {
                updatePosition();
            });
            observer.observe(tooltipRef.current);
            return () => observer.disconnect();
        }
    }, [open, updatePosition]);

    // Outside click listener to dismiss on tap
    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node) &&
                tooltipRef.current &&
                !tooltipRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick, { passive: true });

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [open, setOpen]);

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

    return (
        <>
            <span
                ref={triggerRef}
                className={cn('inline-flex items-center', wrapperClassName)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}>
                {children}
            </span>

            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && content && coords && (
                            <motion.div
                                ref={tooltipRef}
                                role="tooltip"
                                initial={{
                                    opacity: 0,
                                    scale: 0.94,
                                    y: coords.actualSide === 'top' ? 4 : coords.actualSide === 'bottom' ? -4 : 0,
                                    x: coords.actualSide === 'left' ? 4 : coords.actualSide === 'right' ? -4 : 0,
                                }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.94 }}
                                transition={{ duration: 0.15, ease: EASE }}
                                style={{
                                    position: 'fixed',
                                    top: coords.top,
                                    left: coords.left,
                                    zIndex: 99999,
                                    maxWidth: 'min(calc(100vw - 24px), 320px)',
                                }}
                                className={cn(
                                    'pointer-events-none w-max min-w-[160px] whitespace-normal rounded-2xl border border-white/15 bg-[#0A0A0C]/95 p-3 text-left text-xs font-normal leading-relaxed text-[#F5F4F2] shadow-2xl backdrop-blur-2xl dark:border-white/20 dark:bg-[#141417]/95 dark:text-[#FAFAFA]',
                                    maxWidth,
                                    className,
                                )}>
                                {typeof content === 'string' ? (
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/25 text-[#60A5FA] mt-0.5">
                                            <HelpCircle size={10} strokeWidth={2.6} />
                                        </span>
                                        <div className="flex-1 text-[12px] leading-relaxed text-[#F5F4F2] dark:text-[#FAFAFA]">
                                            {content}
                                        </div>
                                    </div>
                                ) : (
                                    content
                                )}

                                {/* Dynamic Caret Pointer */}
                                {coords.actualSide === 'top' && (
                                    <span
                                        style={{ left: coords.arrowOffset }}
                                        className="absolute -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/15 bg-[#0A0A0C] dark:border-white/20 dark:bg-[#141417]"
                                    />
                                )}
                                {coords.actualSide === 'bottom' && (
                                    <span
                                        style={{ left: coords.arrowOffset }}
                                        className="absolute -top-1 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-white/15 bg-[#0A0A0C] dark:border-white/20 dark:bg-[#141417]"
                                    />
                                )}
                                {coords.actualSide === 'left' && (
                                    <span
                                        style={{ top: coords.arrowVerticalOffset }}
                                        className="absolute -right-1 h-2 w-2 -translate-y-1/2 rotate-45 border-t border-r border-white/15 bg-[#0A0A0C] dark:border-white/20 dark:bg-[#141417]"
                                    />
                                )}
                                {coords.actualSide === 'right' && (
                                    <span
                                        style={{ top: coords.arrowVerticalOffset }}
                                        className="absolute -left-1 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/15 bg-[#0A0A0C] dark:border-white/20 dark:bg-[#141417]"
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}

export interface InfoTooltipProps {
    content: ReactNode;
    side?: TooltipSide;
    align?: TooltipAlign;
    size?: number;
    className?: string;
    wrapperClassName?: string;
    maxWidth?: string;
    'aria-label'?: string;
    /** Whether to show the glowing pulse beacon (defaults to true) */
    beacon?: boolean;
}

export function InfoTooltip({
    content,
    side = 'top',
    align = 'center',
    size = 12,
    className = '',
    wrapperClassName = '',
    maxWidth = 'max-w-[280px] sm:max-w-xs',
    'aria-label': ariaLabel = 'Докладніше',
    beacon = true,
}: InfoTooltipProps) {
    const [open, setOpen] = useState(false);

    return (
        <Tooltip
            content={content}
            side={side}
            align={align}
            maxWidth={maxWidth}
            wrapperClassName={wrapperClassName}
            isOpen={open}
            onOpenChange={setOpen}>
            <button
                type="button"
                aria-label={ariaLabel}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className={cn(
                    'group relative inline-flex items-center justify-center p-0.5 rounded-full transition-all focus:outline-hidden',
                    className,
                )}>
                {/* Glowing beacon aura (pulsing on desktop, battery-friendly on mobile) */}
                {beacon && (
                    <span className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#3B82F6]/30 to-[#8B5CF6]/30 blur-[2px] opacity-75 md:animate-pulse" />
                )}

                {/* Crisp inner badge */}
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-[#3B82F6]/35 bg-gradient-to-tr from-[#3B82F6]/15 via-white/80 to-[#8B5CF6]/15 text-[#2563EB] shadow-xs backdrop-blur-sm transition-all duration-200 group-hover:scale-110 group-hover:border-[#3B82F6]/70 group-hover:bg-[#3B82F6]/25 group-hover:text-[#1D4ED8] group-hover:shadow-sm group-hover:shadow-[#3B82F6]/30 active:scale-95 dark:border-[#3B82F6]/40 dark:from-[#3B82F6]/25 dark:via-[#18181B]/80 dark:to-[#8B5CF6]/25 dark:text-[#60A5FA] dark:group-hover:border-[#3B82F6]/80 dark:group-hover:text-[#93C5FD]">
                    <HelpCircle size={size} strokeWidth={2.4} />
                </span>
            </button>
        </Tooltip>
    );
}
