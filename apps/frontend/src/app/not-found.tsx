import Link from 'next/link';
import { Metadata } from 'next';
import { Home } from 'lucide-react';
import { Logo } from '@/shared/ui/Logo';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { display, mono, body } from '@/shared/lib/fonts';

export const metadata: Metadata = {
    title: '404 — Page Not Found | Qore',
    description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#FAFAF8] px-6 text-[#0A0A0C] antialiased dark:bg-[#0A0A0C] dark:text-[#F5F4F2]">
            <AmbientBackground />

            <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
                <div className="mb-8 inline-block">
                    <Logo />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#3B82F6] dark:border-white/10 dark:bg-white/5 dark:text-[#60A5FA]">
                    <span className={mono.className}>Error 404</span>
                </div>

                <h1 className={`${display.className} mt-6 text-3xl font-bold tracking-tight sm:text-4xl text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    Page not found
                </h1>

                <p className={`${body.className} mt-3 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                    The link you followed may be broken, or the page and venue might have been moved.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <Link
                        href="/"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0A0A0C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-black/80 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white/90">
                        <Home size={16} />
                        <span>Return Home</span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#E7E5E0] bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2]">
                        <span>Dashboard</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
