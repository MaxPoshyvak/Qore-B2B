'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, UtensilsCrossed } from 'lucide-react';

import { MenuBuilderView } from '@/features/menu-management';
import { HappyHourView } from '@/features/happy-hour';
import { EASE } from '@/shared/config/animations';
import { cn } from '@/shared/lib/utils';

const SECTIONS = [
    { value: 'builder', label: 'Menu Builder', icon: UtensilsCrossed },
    { value: 'promotions', label: 'Happy Hour', icon: Clock },
] as const;

type SectionValue = (typeof SECTIONS)[number]['value'];

export default function MenuManagementPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const requested = searchParams.get('section');

    const [section, setSection] = useState<SectionValue>(
        requested === 'promotions' ? 'promotions' : 'builder',
    );

    useEffect(() => {
        if ((requested === 'builder' || requested === 'promotions') && requested !== section) {
            setSection(requested);
        }
    }, [requested, section]);

    const changeSection = (value: SectionValue) => {
        setSection(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set('section', value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mx-auto max-w-6xl">
            {/* Мобільні вкладки (приховані на десктопі) */}
            <div className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:hidden">
                {SECTIONS.map((s) => {
                    const active = section === s.value;
                    const Icon = s.icon;
                    return (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => changeSection(s.value)}
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                    : 'border-[#E7E5E0] bg-white/60 text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                            )}>
                            <Icon size={16} strokeWidth={1.9} />
                            {s.label}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: EASE }}>
                    {section === 'builder' ? (
                        <MenuBuilderView slug={resolvedSlug} />
                    ) : (
                        <HappyHourView slug={resolvedSlug} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
