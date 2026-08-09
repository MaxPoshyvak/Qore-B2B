'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, UtensilsCrossed, Grid3x3, Settings, Store } from 'lucide-react';

import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';

const NAV = [
    { label: 'Overview', href: '', icon: LayoutDashboard },
    { label: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { label: 'Tables', href: '/tables', icon: Grid3x3 },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardSidebar() {
    const { slug } = useParams<{ slug: string }>();
    const pathname = usePathname();
    const { theme, toggle, mounted } = useTheme();
    const { data, isLoading } = useGetTenantBySlug(slug ?? '');

    return (
        <aside className="flex h-16 w-full items-center gap-4 border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl md:h-screen md:w-64 md:flex-col md:items-stretch md:gap-0 md:border-b-0 md:border-r md:px-5 md:py-6">
            <div className="flex items-center justify-between md:mb-8 md:justify-start">
                <Logo />
                {mounted && (
                    <div className="md:hidden">
                        <ThemeToggle theme={theme} toggle={toggle} />
                    </div>
                )}
            </div>

            <div className="hidden md:mb-6 md:block">
                {isLoading ? (
                    <div className="h-5 w-32 animate-pulse rounded-md bg-white/10" />
                ) : (
                    <div className="flex items-center gap-2 text-[14px] text-[#94938D]">
                        <Store size={15} className="text-[#10B981]" />
                        <span className="truncate font-medium text-[#F5F4F2]">
                            {data?.data.name ?? 'Workspace'}
                        </span>
                    </div>
                )}
            </div>

            <nav className="flex flex-1 items-center gap-1 overflow-x-auto md:flex-col md:items-stretch md:gap-1.5 md:overflow-visible">
                {NAV.map((item) => {
                    const href = `/dashboard/${slug}${item.href}`;
                    const active = pathname === href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={href}
                            className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] transition-colors md:shrink ${
                                active
                                    ? 'bg-white/5 text-[#F5F4F2]'
                                    : 'text-[#94938D] hover:bg-white/5 hover:text-[#F5F4F2]'
                            }`}>
                            {active && (
                                <motion.span
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#3B82F6]"
                                />
                            )}
                            <Icon size={17} strokeWidth={1.9} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="hidden md:mt-auto md:block">
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </div>
        </aside>
    );
}
