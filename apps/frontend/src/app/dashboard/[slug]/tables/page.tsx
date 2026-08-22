'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { TableGrid } from '@/features/dashboard-tables/components/TableGrid';
import { Toaster } from '@/features/dashboard-tables/components/Toaster';

export default function TablesDashboardPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { data: publicTenant } = useGetPublicTenant(resolvedSlug);

    return (
        <div className="mx-auto max-w-6xl">
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/5 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#93C5FD]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                        Tables
                    </span>
                    <h1
                        className={`${display.className} mt-4 text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl`}>
                        Tables &{' '}
                        <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                            QR Codes
                        </span>
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Create physical tables, generate scannable QR codes and let guests open your
                        menu the moment they sit down.
                    </p>
                </div>
            </motion.header>

            <div className="mt-8">
                <TableGrid slug={resolvedSlug} venueName={publicTenant?.name} />
            </div>

            <Toaster />
        </div>
    );
}
