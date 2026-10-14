'use client';

import { useTranslations } from 'next-intl';
import { mono } from '@/shared/lib/fonts';
import { Logo } from '@/shared/ui/Logo';

export function FooterSection() {
    const t = useTranslations('landing.footer');

    const columns = [
        {
            title: t('product'),
            links: [
                { label: t('features'), href: '#features' },
                { label: t('howItWorks'), href: '#how' },
                { label: t('pricing'), href: '#pricing' },
            ],
        },
        {
            title: t('company'),
            links: [
                { label: t('about'), href: '#' },
                { label: t('contact'), href: '#' },
            ],
        },
        {
            title: t('legal'),
            links: [
                { label: t('terms'), href: '#' },
                { label: t('privacy'), href: '#' },
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
                                            <a
                                                href={l.href}
                                                className="hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                                {l.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    className={`${mono.className} mt-12 border-t border-[#E7E5E0] pt-6 text-[11px] text-[#9C9B95] dark:border-[#232327] dark:text-[#6E6D68]`}>
                    {t('copyright', { year: new Date().getFullYear() })}
                </div>
            </div>
        </footer>
    );
}
