'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, QrCode, UtensilsCrossed } from 'lucide-react';

import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { Logo } from '@/shared/ui/Logo';
import { EASE } from '@/shared/config/animations';
import { PublicTableResolveApi } from '@/features/public-table-resolve/api/public-table.api';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';

type ResolveStatus = 'loading' | 'success' | 'error';

export default function PublicTableResolvePage() {
    const { qrToken } = useParams<{ qrToken: string }>();
    const router = useRouter();
    const setTableSession = useTableSessionStore((s) => s.setTableSession);

    const [status, setStatus] = useState<ResolveStatus>('loading');

    useEffect(() => {
        if (!qrToken) {
            setStatus('error');
            return;
        }

        let active = true;
        PublicTableResolveApi.resolve(qrToken)
            .then((data) => {
                if (!active) return;
                setTableSession({
                    tableId: data.table.id,
                    tableName: data.table.name,
                    tenantSlug: data.tenant.slug,
                });
                // The menu page re-initializes its session from `?table=`, so the link must
                // carry the canonical table id (the name is kept in the session store).
                router.replace(`/${data.tenant.slug}/menu?table=${encodeURIComponent(data.table.id)}`);
            })
            .catch(() => {
                if (active) setStatus('error');
            });

        return () => {
            active = false;
        };
    }, [qrToken, router, setTableSession]);

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-transparent px-4 antialiased dark:bg-transparent">
            <AmbientBackground />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/15 opacity-50 blur-3xl dark:bg-[#8B5CF6]/15" />

            <div className="relative w-full max-w-md">
                <div className="mb-6 flex justify-center">
                    <Logo />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#121215]/80">
                    <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-px rounded-t-3xl bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />

                    {status === 'loading' && (
                        <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                                <Loader2 size={26} className="animate-spin" />
                            </div>
                            <h1 className="mt-5 text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                Connecting to your table...
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                One moment while we prepare your menu.
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                                <QrCode size={26} />
                            </div>
                            <h1 className="mt-5 text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                Invalid or inactive table QR code
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                This code could not be matched to a table. It may have been regenerated
                                or the table is no longer active.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                                    <UtensilsCrossed size={16} />
                                    Go to homepage
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
