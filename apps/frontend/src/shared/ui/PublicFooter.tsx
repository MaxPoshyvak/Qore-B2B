'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { mono } from '@/shared/lib/fonts';
import { Logo } from '@/shared/ui/Logo';
import { openCookieSettings } from '@/shared/ui/CookieBanner';

export function PublicFooter() {
    const t = useTranslations('landing.footer');
    const tCookies = useTranslations('cookies');

    const columns = [
        {
            title: t('product'),
            links: [
                { label: t('features'), href: '/#features' },
                { label: t('howItWorks'), href: '/#how' },
                { label: t('pricing'), href: '/#pricing' },
            ],
        },
        {
            title: t('company'),
            links: [
                { label: t('about'), href: '/about' },
                { label: t('contact'), href: '/contact' },
            ],
        },
        {
            title: t('legal'),
            links: [
                { label: t('terms'), href: '/terms' },
                { label: t('privacy'), href: '/privacy' },
            ],
        },
    ];

    return (
        <footer className="border-t border-[#E7E5E0] dark:border-[#232327]">
            <div className="mx-auto max-w-6xl px-6 py-14">
                <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Logo />
                        <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#6B6A65]/80 dark:text-[#94938D]/70">
                            {t('tagline')}
                        </p>
                        <p
                            className={`${mono.className} mt-3 text-[11px] uppercase tracking-widest text-[#3B82F6]/80`}>
                            {t('domain')}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                        {columns.map((col) => (
                            <div key={col.title}>
                                <span
                                    className={`${mono.className} text-[11px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]`}>
                                    {col.title}
                                </span>
                                <ul className="mt-3 space-y-2 text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                    {col.links.map((l) => (
                                        <li key={l.label}>
                                            <Link
                                                href={l.href}
                                                className="transition-colors hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    className={`${mono.className} mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#E7E5E0] pt-6 text-[11px] text-[#9C9B95] dark:border-[#232327] dark:text-[#6E6D68]`}>
                    <span>{t('copyright', { year: new Date().getFullYear() })}</span>
                    <button
                        type="button"
                        onClick={openCookieSettings}
                        className="transition-colors hover:text-[#0A0A0C] hover:underline dark:hover:text-[#F5F4F2]">
                        {tCookies('customize')}
                    </button>
                </div>
            </div>
        </footer>
    );
}
