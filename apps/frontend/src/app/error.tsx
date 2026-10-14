'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Logo } from '@/shared/ui/Logo';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { display, mono, body } from '@/shared/lib/fonts';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled application error:', error);
    }, [error]);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#FAFAF8] px-6 text-[#0A0A0C] antialiased dark:bg-[#0A0A0C] dark:text-[#F5F4F2]">
            <AmbientBackground />

            <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
                <Link href="/" className="mb-8 inline-block transition-transform hover:scale-105">
                    <Logo />
                </Link>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400">
                    <AlertCircle size={28} />
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-red-500 dark:border-white/10 dark:bg-white/5 dark:text-red-400">
                    <span className={mono.className}>Application Error</span>
                </div>

                <h1 className={`${display.className} mt-4 text-2xl font-bold tracking-tight sm:text-3xl text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    Something went wrong
                </h1>

                <p className={`${body.className} mt-3 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                    An unexpected error occurred while rendering this page. You can try refreshing the view.
                </p>

                {error.digest && (
                    <p className={`${mono.className} mt-2 text-xs text-[#94938D]`}>
                        Error digest: {error.digest}
                    </p>
                )}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-500 cursor-pointer">
                        <RotateCcw size={16} />
                        <span>Try Again</span>
                    </button>

                    <Link
                        href="/"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#E7E5E0] bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2]">
                        <Home size={16} />
                        <span>Return Home</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
