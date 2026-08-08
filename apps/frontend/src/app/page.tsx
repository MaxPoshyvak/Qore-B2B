'use client';

/**
 * Qore — landing page, "AI Morphing" design variant (useqore.app)
 *
 * Design direction: elegant base with signature wow-moments:
 * 1. Hero: AI-Morphing phone demo (plain list → premium grid via scanning wave)
 * 2. Magnetic buttons with micro-physics (sparks + coffee steam)
 * 3. Fast 3D tilt on cards
 * 4. Creative entrance animations throughout
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, type Variants } from 'framer-motion';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import {
    Zap,
    QrCode,
    Users,
    SplitSquareHorizontal,
    Timer,
    CircleSlash2,
    Star,
    Sparkles,
    TrendingUp,
    Check,
    X,
    ArrowRight,
    Palette,
    BarChart3,
    Wand2,
    Sun,
    Moon,
    Menu,
    Coffee,
} from 'lucide-react';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'] });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'] });

/* ================================================================== */
/*  Theme — standard toggle (simple, no cinematic effect)             */
/* ================================================================== */

type Theme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'qore-theme';

function useTheme() {
    const [theme, setTheme] = useState<Theme>('dark');
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
        const initial: Theme =
            stored === 'dark' || stored === 'light'
                ? stored
                : window.matchMedia?.('(prefers-color-scheme: light)').matches
                  ? 'light'
                  : 'dark';
        setTheme(initial);
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme, hydrated]);

    const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    return { theme, toggle };
}

function ThemeToggle({ theme, toggle, className = '' }: { theme: Theme; toggle: () => void; className?: string }) {
    return (
        <motion.button
            type="button"
            onClick={toggle}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E7E5E0] text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#0A0A0C] dark:border-[#232327] dark:text-[#94938D] dark:hover:border-[#3B82F6]/40 dark:hover:text-[#F5F4F2] ${className}`}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.3 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.3 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-center justify-center">
                    {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}

/* ================================================================== */
/*  Shared motion helpers                                              */
/* ================================================================== */

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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

/* ================================================================== */
/*  3D tilt (fast, responsive)                                         */
/* ================================================================== */

function TiltCard({
    children,
    className = '',
    strength = 8,
}: {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
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

/* ================================================================== */
/*  Subtle glow card                                                   */
/* ================================================================== */

function GlowCard({
    children,
    className = '',
    glow = '59,130,246',
}: {
    children: React.ReactNode;
    className?: string;
    glow?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    function handleMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect || !ref.current) return;
        ref.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
        ref.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white transition-colors duration-300 hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:hover:border-[#3B82F6]/40 ${className}`}>
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(300px circle at var(--x,50%) var(--y,50%), rgba(${glow},0.08), transparent 70%)`,
                }}
            />
            <div className="relative flex h-full flex-col">{children}</div>
        </div>
    );
}

/* ================================================================== */
/*  Magnetic button with micro-physics (sparks)                       */
/* ================================================================== */

type Spark = { id: number; angle: number; distance: number; duration: number; color: string };

function MagneticButton({
    children,
    className,
    href = '#',
    onClick,
    primary = false,
    showSparks = false,
}: {
    children: React.ReactNode;
    className?: string;
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    primary?: boolean;
    showSparks?: boolean;
}) {
    const ref = useRef<HTMLAnchorElement>(null);
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

    return (
        <motion.a
            ref={ref}
            href={href}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onMouseEnter={triggerSparks}
            onClick={onClick}
            style={{ x: springX, y: springY }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative ${className}`}>
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
        </motion.a>
    );
}

/* ================================================================== */
/*  Coffee steam animation                                              */
/* ================================================================== */

function CoffeeSteam() {
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

/* ================================================================== */
/*  Lightning icon with sparks on hover                                */
/* ================================================================== */

function LightningWithSparks({ size = 14 }: { size?: number }) {
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

/* ================================================================== */
/*  Animated counting number                                           */
/* ================================================================== */

function AnimatedNumber({
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

/* ================================================================== */
/*  Ambient background                                                 */
/* ================================================================== */

function AmbientBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#FAFAF9] dark:bg-[#08080A]">
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(59,130,246,0.08), transparent 70%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(59,130,246,0.06), transparent 70%)',
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[image:linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#FAFAF9_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#08080A_100%)]" />
        </div>
    );
}

/* ================================================================== */
/*  🎨 HERO: AI-Morphing Demo (plain menu → premium design)           */
/* ================================================================== */

type MorphPhase = 'before' | 'cursor-move' | 'click' | 'wave' | 'after' | 'reset';

function AIMorphingDemo() {
    const [phase, setPhase] = useState<MorphPhase>('before');
    const [cycle, setCycle] = useState(0);

    // Auto-cycle through phases
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        const reduced =
            typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
            setPhase('after');
            return;
        }

        timers.push(setTimeout(() => setPhase('cursor-move'), 2000));
        timers.push(setTimeout(() => setPhase('click'), 3200));
        timers.push(setTimeout(() => setPhase('wave'), 3400));
        timers.push(setTimeout(() => setPhase('after'), 3400));
        timers.push(
            setTimeout(() => {
                setPhase('before');
                setCycle((c) => c + 1);
            }, 8500),
        );

        return () => timers.forEach(clearTimeout);
    }, [cycle]);

    const plainItems = [
        { name: 'Cappuccino', price: 4.5 },
        { name: 'Almond Croissant', price: 5.5 },
        { name: 'Matcha Latte', price: 5.75 },
        { name: 'Cheesecake', price: 6.5 },
    ];

    const richItems = [
        {
            name: 'Cappuccino',
            desc: 'double shot, oat milk',
            price: 4.5,
            emoji: '☕',
            gradient: 'from-amber-200 to-orange-300',
        },
        {
            name: 'Croissant',
            desc: 'fresh baked, buttery',
            price: 5.5,
            emoji: '🥐',
            gradient: 'from-yellow-200 to-amber-300',
        },
        {
            name: 'Matcha',
            desc: 'ceremonial, iced',
            price: 5.75,
            emoji: '🍵',
            gradient: 'from-green-200 to-emerald-300',
        },
        {
            name: 'Cheesecake',
            desc: 'NY style, berries',
            price: 6.5,
            emoji: '🍰',
            gradient: 'from-pink-200 to-rose-300',
        },
    ];

    // Button is positioned at bottom of phone screen
    const buttonX = 50; // percent
    const buttonY = 82; // percent

    return (
        <div className="relative mx-auto w-[300px] sm:w-[320px]">
            {/* Glow behind phone */}
            <motion.div
                animate={{
                    opacity: phase === 'wave' || phase === 'after' ? 0.6 : 0.25,
                    scale: phase === 'wave' || phase === 'after' ? 1.2 : 1,
                }}
                transition={{ duration: 0.8 }}
                className="absolute -inset-12 rounded-full blur-3xl"
                style={{
                    background:
                        phase === 'wave' || phase === 'after'
                            ? 'radial-gradient(circle, rgba(139,92,246,0.5), rgba(59,130,246,0.3), transparent 70%)'
                            : 'radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)',
                }}
            />

            <TiltCard strength={10}>
                <div className="relative mx-auto h-[620px] w-full rounded-[44px] border-[10px] border-[#0A0A0C] bg-[#0A0A0C] shadow-2xl dark:border-[#232327]">
                    {/* Notch */}
                    <div className="absolute left-1/2 top-0 z-30 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#0A0A0C] dark:bg-[#232327]" />
                    {/* Side button */}
                    <div className="absolute -right-[14px] top-24 h-12 w-[4px] rounded-r bg-[#0A0A0C] dark:bg-[#232327]" />

                    {/* Screen container */}
                    <div className="relative h-full w-full overflow-hidden rounded-[34px]">
                        {/* ============ BEFORE STATE (plain, boring menu) ============ */}
                        <motion.div
                            animate={{
                                opacity: phase === 'before' || phase === 'cursor-move' || phase === 'click' ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-white">
                            {/* Status bar */}
                            <div
                                className={`${mono.className} flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-[#0A0A0C]`}>
                                <span>9:41</span>
                                <div className="flex items-center gap-1">
                                    <span>Qore</span>
                                </div>
                            </div>

                            {/* Plain header */}
                            <div className="border-b border-[#0A0A0C]/10 px-5 py-4">
                                <div
                                    className={`${mono.className} text-[9px] uppercase tracking-widest text-[#6B6A65]`}>
                                    qore café · table 4
                                </div>
                                <div className={`${display.className} mt-1 text-[18px] font-bold text-[#0A0A0C]`}>
                                    Menu
                                </div>
                            </div>

                            {/* Plain list */}
                            <ul className={`${mono.className} px-5 py-4 text-[12px]`}>
                                {plainItems.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between border-b border-dashed border-[#0A0A0C]/15 py-3 text-[#4A4A4A]">
                                        <span>
                                            <span className="text-[#0A0A0C]/40">{i + 1}.</span> {item.name}
                                        </span>
                                        <span className="tabular-nums">${item.price.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* "Generate UI with AI" button */}
                            <motion.button
                                animate={phase === 'click' ? { scale: [1, 0.92, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-2.5 text-[11px] font-semibold text-white shadow-lg"
                                style={{ top: `${buttonY}%` }}>
                                <Zap size={12} strokeWidth={2.5} />
                                Generate UI with AI
                            </motion.button>

                            {/* Small "plain" indicator */}
                            <div
                                className={`${mono.className} absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-[#9C9B95]`}>
                                default theme
                            </div>
                        </motion.div>

                        {/* ============ AFTER STATE (premium design) ============ */}
                        <motion.div
                            initial={{ clipPath: `circle(0% at ${buttonX}% ${buttonY}%)` }}
                            animate={{
                                clipPath:
                                    phase === 'wave' || phase === 'after'
                                        ? `circle(200% at ${buttonX}% ${buttonY}%)`
                                        : `circle(0% at ${buttonX}% ${buttonY}%)`,
                            }}
                            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute inset-0 bg-gradient-to-br from-[#1a1530] via-[#0F0F1A] to-[#080812]">
                            {/* Animated aurora */}
                            <motion.div
                                animate={{
                                    x: [0, 30, -20, 0],
                                    y: [0, -20, 30, 0],
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
                                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }}
                            />
                            <motion.div
                                animate={{
                                    x: [0, -30, 20, 0],
                                    y: [0, 30, -20, 0],
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
                                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5), transparent 70%)' }}
                            />

                            {/* Status bar */}
                            <div
                                className={`${mono.className} relative z-10 flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-white/90`}>
                                <span>9:41</span>
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                    <span>Qore</span>
                                </div>
                            </div>

                            {/* Premium header */}
                            <div className="relative px-5 pt-5">
                                <div
                                    className={`${mono.className} flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#8B5CF6]`}>
                                    <Sparkles size={10} />
                                    <span>designed by ai</span>
                                </div>
                                <div
                                    className={`${display.className} mt-1.5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-[20px] font-bold text-transparent`}>
                                    Qore Café
                                </div>
                                <div className={`${body.className} mt-1 text-[10px] text-white/50`}>
                                    Artisan coffee · Handcrafted pastries
                                </div>
                            </div>

                            {/* Premium grid */}
                            <div className="relative mt-5 grid grid-cols-2 gap-2.5 px-5">
                                {richItems.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{
                                            opacity: phase === 'after' ? 1 : 0,
                                            scale: phase === 'after' ? 1 : 0.8,
                                            y: phase === 'after' ? 0 : 10,
                                        }}
                                        transition={{ delay: 1.5 + i * 0.08, duration: 0.5, ease: EASE }}
                                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-sm">
                                        {/* Image placeholder */}
                                        <div
                                            className={`mb-2 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-3xl shadow-inner`}>
                                            <span className="drop-shadow-lg">{item.emoji}</span>
                                        </div>
                                        <h4 className={`${display.className} text-[11px] font-bold text-white`}>
                                            {item.name}
                                        </h4>
                                        <p className={`${mono.className} mt-0.5 text-[8px] text-white/50`}>
                                            {item.desc}
                                        </p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <span className={`${display.className} text-[12px] font-bold text-white`}>
                                                ${item.price}
                                            </span>
                                            <button className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-lg">
                                                <span className="text-[10px] leading-none">+</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Premium indicator */}
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: phase === 'after' ? 1 : 0, y: phase === 'after' ? 0 : 5 }}
                                transition={{ delay: 2.2, duration: 0.5 }}
                                className={`${mono.className} absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-[8px] uppercase tracking-widest text-[#A78BFA] backdrop-blur-sm`}>
                                <Sparkles size={9} />
                                pro theme
                            </motion.div>
                        </motion.div>

                        {/* ============ SCANNING WAVE (the laser/ripple) ============ */}
                        {phase === 'wave' && (
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
                        )}

                        {/* ============ AUTOMATED CURSOR ============ */}
                        <motion.div
                            initial={{ left: '80%', top: '15%', opacity: 0 }}
                            animate={
                                phase === 'before'
                                    ? { left: '80%', top: '15%', opacity: 0 }
                                    : phase === 'cursor-move'
                                      ? { left: `${buttonX}%`, top: `${buttonY}%`, opacity: 1 }
                                      : phase === 'click'
                                        ? { left: `${buttonX}%`, top: `${buttonY}%`, opacity: 1, scale: [1, 0.85, 1] }
                                        : { opacity: 0 }
                            }
                            transition={
                                phase === 'cursor-move'
                                    ? { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
                                    : phase === 'click'
                                      ? { duration: 0.2 }
                                      : { duration: 0.3 }
                            }
                            className="pointer-events-none absolute z-40"
                            style={{ transform: 'translate(-50%, -50%)' }}>
                            {/* Cursor SVG */}
                            <svg width="18" height="22" viewBox="0 0 18 22" fill="none" className="drop-shadow-lg">
                                <path
                                    d="M1 1L1 17.5L5.5 13.5L9 21L12 19.5L8.5 12L15 12L1 1Z"
                                    fill="white"
                                    stroke="#0A0A0C"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {/* Click ripple */}
                            {phase === 'click' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </TiltCard>
        </div>
    );
}

/* ================================================================== */
/*  Live Table Panel (Split Bill demo) — from Elegant variant         */
/* ================================================================== */

type TicketEvent = { guest: string; initials: string; color: string; item: string; price: number };

const TICKET_EVENTS: TicketEvent[] = [
    { guest: 'Olivia', initials: 'O', color: '#3B82F6', item: 'Cappuccino', price: 4.5 },
    { guest: 'Max', initials: 'M', color: '#8B5CF6', item: 'Almond Croissant', price: 5.5 },
    { guest: 'Dana', initials: 'D', color: '#10B981', item: 'Latte', price: 4.75 },
    { guest: 'Olivia', initials: 'O', color: '#3B82F6', item: 'Cheesecake', price: 6.5 },
    { guest: 'Max', initials: 'M', color: '#8B5CF6', item: 'Americano', price: 3.75 },
];

function LiveTablePanel() {
    const [phase, setPhase] = useState(0);
    const [showUpsell, setShowUpsell] = useState(false);
    const totalPhases = TICKET_EVENTS.length + 2;

    useEffect(() => {
        const reduced =
            typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            setPhase(totalPhases - 1);
            return;
        }
        const delay = phase >= totalPhases - 1 ? 3400 : 1450;
        const t = setTimeout(() => {
            setPhase((p) => (p >= totalPhases - 1 ? 0 : p + 1));
        }, delay);
        return () => clearTimeout(t);
    }, [phase, totalPhases]);

    useEffect(() => {
        if (phase === 3) {
            const t1 = setTimeout(() => setShowUpsell(true), 350);
            const t2 = setTimeout(() => setShowUpsell(false), 1650);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [phase]);

    const visibleEvents = TICKET_EVENTS.slice(0, Math.min(phase + 1, TICKET_EVENTS.length));
    const showTotal = phase >= TICKET_EVENTS.length;
    const showSplit = phase >= TICKET_EVENTS.length + 1;
    const total = visibleEvents.reduce((s, e) => s + e.price, 0);

    const perGuest = useMemo(() => {
        const map = new Map<string, { color: string; sum: number }>();
        for (const e of TICKET_EVENTS) {
            const cur = map.get(e.guest) ?? { color: e.color, sum: 0 };
            cur.sum += e.price;
            map.set(e.guest, cur);
        }
        return Array.from(map.entries());
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[360px]">
            {/* live badge */}
            <motion.div
                className={`${mono.className} absolute -top-4 left-6 z-20 flex items-center gap-1.5 rounded-full bg-[#10B981] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white shadow-sm`}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                table 4 · live
            </motion.div>

            {/* AI upsell bubble */}
            <AnimatePresence>
                {showUpsell && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 16, y: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 16 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={`${mono.className} absolute -right-7 top-16 z-30 w-[192px] rounded-2xl border border-[#8B5CF6]/30 bg-white/95 p-3 text-[10.5px] leading-relaxed text-[#0A0A0C] shadow-lg backdrop-blur-xl dark:bg-[#16151D]/95 dark:text-[#F5F4F2]`}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-[#8B5CF6]">
                            <Wand2 size={11} /> AI upsell
                        </div>
                        Cappuccino pairs well with a croissant — add for $5.50?
                    </motion.div>
                )}
            </AnimatePresence>

            <TiltCard strength={6}>
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                    <div className="relative flex items-baseline justify-between border-b border-[#0A0A0C]/10 pb-3 dark:border-white/10">
                        <span
                            className={`${display.className} text-[16px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Qore
                        </span>
                        <span
                            className={`${mono.className} text-[10px] uppercase tracking-widest text-[#6B6A65] dark:text-[#94938D]`}>
                            check #0192
                        </span>
                    </div>

                    <div
                        className={`${mono.className} relative mt-4 min-h-[168px] space-y-2.5 text-[12.5px] text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        <AnimatePresence initial={false}>
                            {visibleEvents.map((e, i) => (
                                <motion.div
                                    key={`${e.item}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, ease: EASE }}
                                    className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 odd:bg-[#0A0A0C]/[0.03] dark:odd:bg-white/[0.04]">
                                    <span className="flex items-center gap-2">
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                            style={{ backgroundColor: e.color }}>
                                            {e.initials}
                                        </motion.span>
                                        {e.item}
                                    </span>
                                    <span className="tabular-nums">${e.price.toFixed(2)}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div
                        className={`${mono.className} relative mt-4 flex items-center justify-between border-t border-[#0A0A0C]/10 pt-3 text-[13px] font-semibold text-[#0A0A0C] transition-opacity duration-300 dark:border-white/10 dark:text-[#F5F4F2] ${
                            showTotal ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <span>Total</span>
                        <span className="tabular-nums">${total.toFixed(2)}</span>
                    </div>

                    <div
                        className={`${mono.className} relative mt-3 space-y-1.5 border-t border-[#0A0A0C]/10 pt-3 text-[11.5px] text-[#0A0A0C]/80 transition-all duration-500 dark:border-white/10 dark:text-[#F5F4F2]/80 ${
                            showSplit ? 'max-h-40 opacity-100' : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
                        }`}>
                        <div className="mb-1 uppercase tracking-widest text-[10px] text-[#6B6A65] dark:text-[#94938D]">
                            Split evenly
                        </div>
                        {perGuest.map(([guest, v]) => (
                            <div key={guest} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                                    {guest}
                                </span>
                                <span className="tabular-nums">${(total / perGuest.length).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </TiltCard>
        </motion.div>
    );
}

/* ================================================================== */
/*  AI consultant typing demo (for AI section)                        */
/* ================================================================== */

const AI_DEMO: { q: string; a: string }[] = [
    { q: 'Recommend something spicy, gluten-free', a: 'Shrimp tom yum — spicy, gluten-free, ready in 15 min.' },
    { q: 'What pairs well with a cappuccino?', a: 'Almond croissant — ordered together 68% of the time.' },
    { q: 'Anything meat-free and quick?', a: 'Tofu quinoa bowl — ready in 10 min, 320 cal.' },
];

function AIDemo() {
    const [pairIndex, setPairIndex] = useState(0);
    const [qChars, setQChars] = useState(0);
    const [aChars, setAChars] = useState(0);
    const [showA, setShowA] = useState(false);
    const pair = AI_DEMO[pairIndex];

    useEffect(() => {
        setQChars(0);
        setAChars(0);
        setShowA(false);
    }, [pairIndex]);

    useEffect(() => {
        if (qChars < pair.q.length) {
            const t = setTimeout(() => setQChars((c) => c + 1), 32);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setShowA(true), 450);
        return () => clearTimeout(t);
    }, [qChars, pair.q.length]);

    useEffect(() => {
        if (!showA) return;
        if (aChars < pair.a.length) {
            const t = setTimeout(() => setAChars((c) => c + 1), 18);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setPairIndex((p) => (p + 1) % AI_DEMO.length), 2600);
        return () => clearTimeout(t);
    }, [showA, aChars, pair.a.length]);

    return (
        <TiltCard strength={5}>
            <div className="relative overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-5 shadow-lg dark:border-[#232327] dark:bg-[#141417]">
                <div className="relative flex items-center gap-2 border-b border-[#E7E5E0] pb-3 dark:border-[#232327]">
                    <motion.span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6]"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                        <Sparkles size={14} />
                    </motion.span>
                    <span className={`${body.className} text-[13px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        AI waiter concierge
                    </span>
                    <span
                        className={`${mono.className} ml-auto rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[9px] uppercase tracking-widest text-[#8B5CF6]`}>
                        Pro
                    </span>
                </div>

                <div className={`${body.className} relative mt-4 min-h-[92px] space-y-3 text-[13px]`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[#0A0A0C]/[0.05] px-3 py-2 text-[#0A0A0C] dark:bg-white/10 dark:text-[#F5F4F2]">
                        {pair.q.slice(0, qChars)}
                        {qChars < pair.q.length && <span className="animate-pulse">▍</span>}
                    </motion.div>
                    {showA && (
                        <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#8B5CF6]/10 px-3 py-2 text-[#8B5CF6]">
                            {pair.a.slice(0, aChars)}
                            {aChars < pair.a.length && <span className="animate-pulse">▍</span>}
                        </motion.div>
                    )}
                </div>
            </div>
        </TiltCard>
    );
}

/* ================================================================== */
/*  Marquee                                                            */
/* ================================================================== */

function IntegrationsMarquee() {
    const items = ['Stripe', 'Square', 'Toast POS', 'Lightspeed', 'Twilio', 'PayPal', 'Cloudinary', 'Adyen'];
    return (
        <div className="overflow-hidden border-y border-[#E7E5E0] bg-[#F2F1EE] py-5 dark:border-[#232327] dark:bg-[#0F0F12]">
            <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-14">
                {[...items, ...items].map((it, i) => (
                    <span
                        key={i}
                        className={`${mono.className} flex items-center gap-3 whitespace-nowrap text-[13px] uppercase tracking-widest text-[#6B6A65]/70 dark:text-[#94938D]/60`}>
                        <span className="h-1 w-1 rounded-full bg-[#3B82F6]/60" />
                        {it}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ================================================================== */
/*  Small building blocks                                              */
/* ================================================================== */

function Eyebrow({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'violet' | 'green' }) {
    const colors = {
        blue: 'text-[#3B82F6]',
        violet: 'text-[#8B5CF6]',
        green: 'text-[#04916C] dark:text-[#10B981]',
    } as const;
    const lines = {
        blue: 'bg-[#3B82F6]',
        violet: 'bg-[#8B5CF6]',
        green: 'bg-[#04916C] dark:bg-[#10B981]',
    } as const;
    return (
        <div
            className={`${mono.className} mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] ${colors[tone]}`}>
            <span className={`h-px w-6 ${lines[tone]}`} />
            {children}
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    desc,
    span = false,
    iconType = 'default',
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    span?: boolean;
    iconType?: 'default' | 'lightning' | 'coffee';
}) {
    return (
        <TiltCard strength={6} className={span ? 'sm:col-span-2' : ''}>
            <GlowCard className="p-7">
                <div className="mb-5">
                    {iconType === 'lightning' ? (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10">
                            <LightningWithSparks size={19} />
                        </div>
                    ) : iconType === 'coffee' ? (
                        <CoffeeSteam />
                    ) : (
                        <motion.div
                            whileHover={{ rotate: -8, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                            <Icon size={19} strokeWidth={1.75} />
                        </motion.div>
                    )}
                </div>
                <h3 className={`${display.className} mb-2 text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {title}
                </h3>
                <p className={`${body.className} text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                    {desc}
                </p>
            </GlowCard>
        </TiltCard>
    );
}

function PricingCard({
    tier,
    price,
    period,
    description,
    features,
    featured = false,
    cta,
}: {
    tier: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    featured?: boolean;
    cta: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className={`relative flex h-full flex-col rounded-[26px] px-7 pb-8 pt-9 ${
                featured
                    ? 'border-2 border-[#3B82F6] bg-white shadow-xl dark:bg-[#141417]'
                    : 'border border-[#E7E5E0] bg-white dark:border-[#232327] dark:bg-[#141417]'
            }`}>
            {featured && (
                <span
                    className={`${mono.className} absolute -top-3 left-7 rounded-full bg-[#3B82F6] px-3 py-1 text-[10px] uppercase tracking-widest text-white`}>
                    recommended
                </span>
            )}
            <span className={`${mono.className} text-[11px] uppercase tracking-[0.2em] text-[#3B82F6]`}>{tier}</span>
            <div className="mt-3 flex items-baseline gap-1.5">
                <span className={`${display.className} text-[36px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {price}
                </span>
                {period && (
                    <span className={`${body.className} text-[13px] text-[#6B6A65] dark:text-[#94938D]`}>{period}</span>
                )}
            </div>
            <p className={`${body.className} mt-3 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                {description}
            </p>
            <div className="my-6 border-t border-[#E7E5E0] dark:border-[#232327]" />
            <ul className="flex-1 space-y-3">
                {features.map((f, i) => (
                    <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                        className={`${body.className} flex items-start gap-2.5 text-[13.5px]`}>
                        <Check
                            size={15}
                            className="mt-0.5 shrink-0 text-[#04916C] dark:text-[#10B981]"
                            strokeWidth={2.5}
                        />
                        <span className="text-[#3A3A36] dark:text-[#C7C6C1]">{f}</span>
                    </motion.li>
                ))}
            </ul>
            <MagneticButton
                primary={featured}
                showSparks={featured}
                className={`${body.className} mt-8 flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-medium transition-colors ${
                    featured
                        ? 'bg-[#0A0A0C] text-white hover:bg-[#232327] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA]'
                        : 'border border-[#E7E5E0] text-[#0A0A0C] hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]'
                }`}>
                {cta}
                <ArrowRight size={15} />
            </MagneticButton>
        </motion.div>
    );
}

function StepCard({ n, icon: Icon, title, desc }: { n: string; icon: React.ElementType; title: string; desc: string }) {
    return (
        <TiltCard strength={7}>
            <motion.div
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative h-full overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-7 transition-colors duration-300 hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:hover:border-[#3B82F6]/40">
                <span
                    aria-hidden
                    className={`${display.className} pointer-events-none absolute -right-2 -top-6 text-[92px] font-bold leading-none text-[#0A0A0C]/[0.04] dark:text-white/[0.04]`}>
                    {n}
                </span>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                    <Icon size={19} strokeWidth={1.75} />
                </motion.div>
                <h3
                    className={`${display.className} relative mt-5 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {title}
                </h3>
                <p className="relative mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">{desc}</p>
            </motion.div>
        </TiltCard>
    );
}

/* ================================================================== */
/*  Nav                                                                */
/* ================================================================== */

const NAV_LINKS = [
    { href: '#features', label: 'Features' },
    { href: '#how', label: 'How it works' },
    { href: '#ai', label: 'AI' },
    { href: '#pricing', label: 'Pricing' },
];

function Logo() {
    return (
        <a href="#" className="flex items-center gap-2">
            <span
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                <span className={`${display.className} text-[14px] font-bold`}>Q</span>
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#FAFAF9] bg-[#10B981] dark:border-[#08080A]" />
            </span>
            <span
                className={`${display.className} text-[16px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                Qore
            </span>
        </a>
    );
}

function Nav({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => scrollY.on('change', (v) => setScrolled(v > 12)), [scrollY]);
    useEffect(() => setMobileOpen(false), [scrolled]);

    return (
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
            <motion.div
                animate={{
                    boxShadow: scrolled ? '0 12px 40px -16px rgba(10,10,12,0.18)' : '0 0px 0px 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mx-auto max-w-6xl rounded-full border border-[#E7E5E0]/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
                <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">
                    <Logo />

                    <nav
                        className={`${body.className} hidden items-center gap-7 text-[13.5px] text-[#6B6A65] dark:text-[#94938D] md:flex`}>
                        {NAV_LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onMouseEnter={() => setHovered(l.href)}
                                onMouseLeave={() => setHovered(null)}
                                className="relative py-1 transition-colors hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                {l.label}
                                {hovered === l.href && (
                                    <motion.span
                                        layoutId="nav-hover"
                                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#3B82F6]"
                                    />
                                )}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2.5">
                        <ThemeToggle theme={theme} toggle={toggleTheme} className="hidden sm:flex" />
                        <a
                            href="#"
                            className={`${body.className} hidden text-[13.5px] text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2] lg:block`}>
                            Log in
                        </a>
                        <MagneticButton
                            primary
                            showSparks
                            href="#pricing"
                            className={`${body.className} hidden cursor-pointer rounded-full bg-[#0A0A0C] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white sm:inline-block`}>
                            Start for free
                        </MagneticButton>
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E0] text-[#0A0A0C] dark:border-[#232327] dark:text-[#F5F4F2] md:hidden">
                            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="overflow-hidden border-t border-[#E7E5E0] dark:border-white/10 md:hidden">
                            <div className="flex flex-col gap-1 px-5 py-4">
                                {NAV_LINKS.map((l) => (
                                    <a
                                        key={l.href}
                                        href={l.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`${body.className} rounded-xl px-2 py-2.5 text-[14.5px] text-[#6B6A65] hover:bg-[#0A0A0C]/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]`}>
                                        {l.label}
                                    </a>
                                ))}
                                <div className="mt-2 flex items-center justify-between border-t border-[#E7E5E0] pt-4 dark:border-white/10">
                                    <a
                                        href="#"
                                        className={`${body.className} text-[14px] text-[#6B6A65] dark:text-[#94938D]`}>
                                        Log in
                                    </a>
                                    <ThemeToggle theme={theme} toggle={toggleTheme} />
                                </div>
                                <MagneticButton
                                    primary
                                    showSparks
                                    href="#pricing"
                                    onClick={() => setMobileOpen(false)}
                                    className={`${body.className} mt-3 flex cursor-pointer items-center justify-center rounded-full bg-[#0A0A0C] px-4 py-3 text-[14px] font-medium text-white dark:bg-[#F5F4F2] dark:text-[#0A0A0C]`}>
                                    Start for free
                                </MagneticButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </header>
    );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function QoreLandingAIMorphing() {
    const { theme, toggle } = useTheme();

    return (
        <div className={`${body.className} relative min-h-screen text-[#0A0A0C] antialiased dark:text-[#F5F4F2]`}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            html { scroll-behavior: smooth; }
            ::selection { background: #3B82F6; color: #FAFAF9; }
            :focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
              html { scroll-behavior: auto; }
            }
          `,
                }}
            />

            <AmbientBackground />
            <Nav theme={theme} toggleTheme={toggle} />

            {/* ---------------- HERO ---------------- */}
            <section className="relative overflow-hidden">
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-20 md:grid-cols-2 md:py-28">
                    <motion.div initial="hidden" animate="show" variants={stagger}>
                        <motion.div variants={fadeUp}>
                            <Eyebrow>QR Menu · Reservations · AI</Eyebrow>
                        </motion.div>

                        <h1
                            className={`${display.className} text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[58px]`}>
                            {['One table.', 'One cart.'].map((line, i) => (
                                <motion.span
                                    key={line}
                                    variants={fadeUp}
                                    custom={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}
                                    className="block">
                                    {line}
                                </motion.span>
                            ))}
                            <motion.span
                                variants={fadeUp}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
                                className="block bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
                                Zero chaos.
                            </motion.span>
                        </h1>

                        <motion.p
                            variants={fadeUp}
                            className="mt-6 max-w-md text-[15.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            Qore is a platform for cafés and restaurants. Guests at the same table see a shared menu in
                            real time and split the bill themselves, while the AI engine lifts average order value and
                            takes routine work off your team.
                        </motion.p>

                        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
                            <MagneticButton
                                primary
                                showSparks
                                href="#pricing"
                                className={`${body.className} flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white`}>
                                Start for free
                                <ArrowRight size={16} />
                            </MagneticButton>
                            <MagneticButton
                                href="#how"
                                className={`${body.className} cursor-pointer rounded-full border border-[#E7E5E0] px-6 py-3.5 text-[14px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:text-[#F5F4F2]`}>
                                View demo menu
                            </MagneticButton>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className={`${mono.className} mt-8 flex items-center gap-2 text-[12px] uppercase tracking-wider text-[#6B6A65]/80 dark:text-[#94938D]/80`}>
                            <LightningWithSparks size={14} />
                            <span>Server-rendered · under 1s even on slow 3G</span>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[#E7E5E0] pt-6 dark:border-[#232327]">
                            <div>
                                <div className={`${display.className} text-[22px] font-bold`}>
                                    <AnimatedNumber value={1} prefix="<" suffix="s" />
                                </div>
                                <div
                                    className={`${mono.className} mt-1 text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                    load time
                                </div>
                            </div>
                            <div>
                                <div className={`${display.className} text-[22px] font-bold`}>
                                    <AnimatedNumber value={38} suffix="%" />
                                </div>
                                <div
                                    className={`${mono.className} mt-1 text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                    higher check with AI
                                </div>
                            </div>
                            <div>
                                <div className={`${display.className} text-[22px] font-bold`}>
                                    <AnimatedNumber value={24} suffix="/7" />
                                </div>
                                <div
                                    className={`${mono.className} mt-1 text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                    AI concierge
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <AIMorphingDemo />
                </div>
            </section>

            <IntegrationsMarquee />

            {/* ---------------- PROBLEM / COMPARISON ---------------- */}
            <section className="border-b border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
                <div className="mx-auto max-w-6xl px-6 py-20">
                    <Reveal>
                        <Eyebrow>Comparison</Eyebrow>
                        <h2
                            className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                            Why not just a QR code to a PDF
                        </h2>
                    </Reveal>

                    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: EASE }}
                            className="rounded-3xl border border-[#E7E5E0] bg-white p-7 dark:border-[#232327] dark:bg-[#141417]">
                            <span
                                className={`${mono.className} text-[11px] uppercase tracking-widest text-[#6B6A65] dark:text-[#94938D]`}>
                                Typical QR menu
                            </span>
                            <ul className="mt-5 space-y-4">
                                {[
                                    "Static PDF that's hard to update from a phone",
                                    'Slow to load on weak in-house Wi-Fi',
                                    'Every guest has their own separate cart',
                                    'The server splits the bill by hand',
                                ].map((t, i) => (
                                    <motion.li
                                        key={t}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                                        className="flex items-start gap-3 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                                        <X size={15} className="mt-0.5 shrink-0 text-[#9C9B95] dark:text-[#6E6D68]" />
                                        {t}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                            className="relative rounded-3xl border border-[#3B82F6]/30 bg-white p-7 dark:bg-[#141417]">
                            <span className={`${mono.className} text-[11px] uppercase tracking-widest text-[#3B82F6]`}>
                                Qore
                            </span>
                            <ul className="mt-5 space-y-4">
                                {[
                                    'Server-rendered, ready in under a second',
                                    'One shared table cart, updated in real time',
                                    'Guests split the bill themselves — evenly or by item',
                                    'Menu is edited in the dashboard and updates instantly',
                                ].map((t, i) => (
                                    <motion.li
                                        key={t}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                                        className="flex items-start gap-3 text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        <Check
                                            size={15}
                                            className="mt-0.5 shrink-0 text-[#04916C] dark:text-[#10B981]"
                                            strokeWidth={2.5}
                                        />
                                        {t}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ---------------- HOW IT WORKS ---------------- */}
            <section id="how" className="mx-auto max-w-6xl px-6 py-24">
                <Reveal>
                    <Eyebrow>At the table</Eyebrow>
                    <h2 className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                        How it works at one table
                    </h2>
                </Reveal>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={stagger}
                    className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[
                        {
                            n: '01',
                            icon: QrCode,
                            title: 'Scan the QR',
                            desc: 'The menu opens instantly in the browser — no app, no sign-up.',
                        },
                        {
                            n: '02',
                            icon: Users,
                            title: 'Order together',
                            desc: 'Everyone at the table sees one cart and what others add, in real time.',
                        },
                        {
                            n: '03',
                            icon: SplitSquareHorizontal,
                            title: 'Split the bill',
                            desc: 'Evenly or by chosen items — guests pay themselves, no server needed.',
                        },
                    ].map((s, i) => (
                        <motion.div
                            key={s.n}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}>
                            <StepCard n={s.n} icon={s.icon} title={s.title} desc={s.desc} />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ---------------- FEATURES (bento) ---------------- */}
            <section
                id="features"
                className="border-y border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
                <div className="mx-auto max-w-6xl px-6 py-24">
                    <Reveal>
                        <Eyebrow tone="green">Free features</Eyebrow>
                        <h2
                            className={`${display.className} max-w-xl text-[26px] font-bold leading-tight sm:text-[34px]`}>
                            Everything a venue needs — free
                        </h2>
                        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            Live cart, split billing, order-ahead, and the 86 list are all on the Free plan. We
                            don&apos;t hold these back to upsell you — only AI is paid.
                        </p>
                    </Reveal>

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                        className="mt-12 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-1">
                            <FeatureCard
                                icon={Users}
                                title="Live Table Cart"
                                desc="Several guests at one table see the same menu and one shared cart, updated live."
                            />
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <FeatureCard
                                icon={SplitSquareHorizontal}
                                title="Split Bill"
                                desc="Evenly or by chosen items — guests settle up themselves, no server needed."
                            />
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <FeatureCard
                                icon={Timer}
                                title="Order-ahead"
                                desc="Guests order on the way and skip the line the moment they arrive."
                                iconType="coffee"
                            />
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <FeatureCard
                                icon={CircleSlash2}
                                title="86 list"
                                desc="86 a dish from the kitchen and it disappears from every active table session instantly."
                            />
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <FeatureCard
                                icon={Timer}
                                title="Happy Hour"
                                desc="A discount with a live countdown; prices recalculate automatically when it ends."
                                iconType="lightning"
                            />
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <FeatureCard
                                icon={Star}
                                title="NPS scores"
                                desc="Guests rate their visit right after paying — a low score pings you on Telegram instantly."
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ---------------- AI ---------------- */}
            <section id="ai" className="mx-auto max-w-6xl px-6 py-24">
                <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:items-center">
                    <Reveal>
                        <Eyebrow tone="violet">Pro & Business</Eyebrow>
                        <h2 className={`${display.className} text-[26px] font-bold leading-tight sm:text-[34px]`}>
                            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                                AI
                            </span>{' '}
                            that makes money, not just a demo
                        </h2>
                        <p className="mt-5 text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            The core product is free and built to spread on its own. We deliberately kept expensive LLM
                            calls behind the paid tiers — that&apos;s a growth engine, not a hook.
                        </p>
                        <MagneticButton
                            primary
                            showSparks
                            href="#pricing"
                            className={`${body.className} mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#8B5CF6] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#A78BFA]`}>
                            Upgrade to Pro
                            <ArrowRight size={16} />
                        </MagneticButton>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <AIDemo />
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                { icon: Palette, title: 'Design from a prompt' },
                                { icon: TrendingUp, title: 'Upsell in cart' },
                                { icon: BarChart3, title: 'AI NPS summaries' },
                            ].map((f) => (
                                <TiltCard key={f.title} strength={5}>
                                    <GlowCard className="p-4" glow="139,92,246">
                                        <div className="flex items-center gap-2.5">
                                            <motion.span
                                                whileHover={{ scale: 1.1, rotate: 15 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6]">
                                                <f.icon size={14} strokeWidth={1.75} />
                                            </motion.span>
                                            <span
                                                className={`${body.className} text-[12.5px] text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                                {f.title}
                                            </span>
                                        </div>
                                    </GlowCard>
                                </TiltCard>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ---------------- SPLIT BILL ---------------- */}
            <section className="border-y border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-24">
                    <Reveal>
                        <Eyebrow>Split Bill</Eyebrow>
                        <h2 className={`${display.className} text-[26px] font-bold leading-tight sm:text-[34px]`}>
                            The check, split in seconds
                        </h2>
                        <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            Guests pay for what they actually ordered. No awkward math with the server, no mistakes —
                            every item is tagged with the guest who added it.
                        </p>
                        <ul className="mt-6 space-y-3">
                            {[
                                'Every item remembers who ordered it',
                                'Pay just your share or split evenly',
                                'Lock items before paying — no race conditions',
                            ].map((t, i) => (
                                <motion.li
                                    key={t}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                                    className="flex items-center gap-3 text-[14px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    <Check
                                        size={16}
                                        className="shrink-0 text-[#04916C] dark:text-[#10B981]"
                                        strokeWidth={3}
                                    />
                                    {t}
                                </motion.li>
                            ))}
                        </ul>
                    </Reveal>
                    <LiveTablePanel />
                </div>
            </section>

            {/* ---------------- PRICING ---------------- */}
            <section
                id="pricing"
                className="border-b border-[#E7E5E0] bg-[#F2F1EE]/60 dark:border-[#232327] dark:bg-[#0F0F12]/60">
                <div className="mx-auto max-w-6xl px-6 py-24">
                    <Reveal className="text-center">
                        <div className="flex justify-center">
                            <Eyebrow>No hidden terms</Eyebrow>
                        </div>
                        <h2 className={`${display.className} text-[26px] font-bold sm:text-[34px]`}>Pricing</h2>
                    </Reveal>

                    <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
                        <PricingCard
                            tier="Free"
                            price="$0"
                            period="/mo"
                            description="Everything you need to launch one venue."
                            cta="Start for free"
                            features={[
                                'Menu, categories, table QR codes',
                                'Reservations and calendar',
                                'Live table cart and split billing',
                                'Order-ahead and the 86 list',
                                'Dynamic happy hour',
                                'Basic analytics and NPS',
                            ]}
                        />
                        <PricingCard
                            tier="Pro"
                            price="$39"
                            period="/mo"
                            description="Everything in Free, plus the AI growth engine."
                            featured
                            cta="Upgrade to Pro"
                            features={[
                                'Everything in Free',
                                'AI waiter concierge',
                                'AI menu design generator',
                                'AI upselling in cart',
                                'AI sentiment analysis on NPS',
                                'Advanced analytics and forecasts',
                            ]}
                        />
                        <PricingCard
                            tier="Business"
                            price="Custom"
                            description="For restaurant groups and custom infrastructure."
                            cta="Contact us"
                            features={[
                                'Everything in Pro',
                                'POS integrations (Square, Toast, Lightspeed)',
                                'Custom domain and white-label',
                                'Multi-location support',
                                'Priority support',
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* ---------------- FINAL CTA ---------------- */}
            <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-24 text-center">
                <Reveal className="relative">
                    <h2
                        className={`${display.className} mx-auto max-w-lg text-[26px] font-bold leading-tight sm:text-[40px]`}>
                        Get your venue live in one evening
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Menu migration, table QR setup, and team onboarding — free to get started.
                    </p>
                    <MagneticButton
                        primary
                        showSparks
                        href="#pricing"
                        className={`${body.className} mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-7 py-4 text-[14.5px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white`}>
                        Try Qore
                        <ArrowRight size={16} />
                    </MagneticButton>
                </Reveal>
            </section>

            {/* ---------------- FOOTER ---------------- */}
            <footer className="border-t border-[#E7E5E0] dark:border-[#232327]">
                <div className="mx-auto max-w-6xl px-6 py-14">
                    <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Logo />
                            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#6B6A65]/80 dark:text-[#94938D]/70">
                                Live QR menus, reservations, and AI for cafés and restaurants.
                            </p>
                            <p
                                className={`${mono.className} mt-3 text-[11px] uppercase tracking-widest text-[#3B82F6]/80`}>
                                useqore.app
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                            <div>
                                <span
                                    className={`${mono.className} text-[11px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]`}>
                                    Product
                                </span>
                                <ul className="mt-3 space-y-2 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                    <li>
                                        <a href="#features" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#how" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            How it works
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#pricing" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            Pricing
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <span
                                    className={`${mono.className} text-[11px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]`}>
                                    Company
                                </span>
                                <ul className="mt-3 space-y-2 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                    <li>
                                        <a href="#" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            Contact
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <span
                                    className={`${mono.className} text-[11px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]`}>
                                    Legal
                                </span>
                                <ul className="mt-3 space-y-2 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                    <li>
                                        <a href="#" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            Terms
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                            Privacy
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${mono.className} mt-12 border-t border-[#E7E5E0] pt-6 text-[11px] text-[#9C9B95] dark:border-[#232327] dark:text-[#6E6D68]`}>
                        © {new Date().getFullYear()} Qore. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
