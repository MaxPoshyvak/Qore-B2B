'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

import { display, mono, body } from '../../lib/fonts';
import { EASE } from '../../config/animations';
import { PHONE_BUTTON, PHONE_PLAIN_ITEMS, PHONE_RICH_ITEMS } from '../../config/landing-data';
import { usePhoneDemo, type MorphPhase } from '../../hooks/usePhoneDemo';
import { TiltCard } from '../ui/TiltCard';
import { ScanningWave } from './ScanningWave';

export function PhoneDemo() {
    const { phase } = usePhoneDemo();
    const { x: buttonX, y: buttonY } = PHONE_BUTTON;

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
                                {PHONE_PLAIN_ITEMS.map((item, i) => (
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
                                {PHONE_RICH_ITEMS.map((item, i) => (
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
                        {phase === 'wave' && <ScanningWave buttonX={buttonX} buttonY={buttonY} />}

                        {/* ============ AUTOMATED CURSOR ============ */}
                        <AnimatedCursor phase={phase} buttonX={buttonX} buttonY={buttonY} />
                    </div>
                </div>
            </TiltCard>
        </div>
    );
}

function AnimatedCursor({ phase, buttonX, buttonY }: { phase: MorphPhase; buttonX: number; buttonY: number }) {
    return (
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
    );
}
