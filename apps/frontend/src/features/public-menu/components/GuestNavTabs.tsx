'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UtensilsCrossed, CalendarDays, Star, Store } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { body } from '@/shared/lib/fonts';

type GuestTab = 'menu' | 'book' | 'reviews' | 'overview';

interface GuestNavTabsProps {
    slug: string;
    activeTab: GuestTab;
    className?: string;
}

export function GuestNavTabs({ slug, activeTab, className }: GuestNavTabsProps) {
    const t = useTranslations('venue');

    const tabs: { id: GuestTab; href: string; label: string; icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
        {
            id: 'menu',
            href: `/${slug}/menu`,
            label: t('menuTab'),
            icon: UtensilsCrossed,
        },
        {
            id: 'book',
            href: `/${slug}/book`,
            label: t('bookTab'),
            icon: CalendarDays,
        },
        {
            id: 'reviews',
            href: `/${slug}/reviews`,
            label: t('reviewsTab'),
            icon: Star,
        },
        {
            id: 'overview',
            href: `/${slug}`,
            label: t('infoTab'),
            icon: Store,
        },
    ];

    return (
        <nav
            aria-label="Venue Sections"
            className={cn(
                'flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-black/5 bg-black/[0.03] p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] hide-scrollbar',
                className,
            )}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={cn(
                            body.className,
                            'group relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200',
                            isActive
                                ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1E1E24] dark:text-[#F5F4F2]'
                                : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]',
                        )}>
                        <Icon
                            size={14}
                            className={cn(
                                'transition-colors',
                                isActive
                                    ? 'text-[#3B82F6]'
                                    : 'text-[#6B6A65] group-hover:text-[#0A0A0C] dark:text-[#94938D] dark:group-hover:text-[#F5F4F2]',
                            )}
                        />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
