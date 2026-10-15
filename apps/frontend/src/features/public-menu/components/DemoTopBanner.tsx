'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Sparkles, ArrowRight, X, ExternalLink } from 'lucide-react';

export function DemoTopBanner({ slug }: { slug: string }) {
    const [dismissed, setDismissed] = useState(false);

    if (slug !== 'demo' || dismissed) {
        return null;
    }

    return (
        <aside
            aria-label="Demo mode announcement"
            className="sticky top-0 z-50 border-b border-black/10 bg-[#0A0A0C]/90 px-3 py-2 text-white shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-[#141417]/95">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs">
                {/* Left: Tag + Explanation */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-xs">
                        <Sparkles size={11} />
                        Demo Mode
                    </span>
                    <span className="hidden text-[12.5px] text-[#D1D0C7] sm:inline">
                        You&apos;re exploring live menu ordering. No real payment required.
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Wow feature: Quick toggle to Kitchen Display */}
                    <Link
                        href="/kds/demo-kitchen-token"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white transition-all hover:bg-white/20 hover:border-white/30 active:scale-95">
                        <ChefHat size={13} className="text-[#60A5FA]" />
                        <span>Kitchen KDS</span>
                        <span className="hidden rounded bg-black/40 px-1 py-0.2 text-[9.5px] font-mono text-[#93C5FD] md:inline">
                            PIN 1234
                        </span>
                        <ExternalLink size={10} className="opacity-60" />
                    </Link>

                    {/* CTA: Get Qore */}
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#0A0A0C] transition-all hover:bg-[#F5F4F2] active:scale-95">
                        <span>Create Venue</span>
                        <ArrowRight size={12} />
                    </Link>

                    {/* Dismiss */}
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss demo banner"
                        className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg text-[#9C9B95] transition-colors hover:bg-white/10 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
