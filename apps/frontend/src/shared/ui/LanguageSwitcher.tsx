'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, Loader2 } from 'lucide-react';
import { LOCALES_CONFIG, getLocaleConfig, type Locale } from '@my-app/types';
import { cn } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import { setUserLocale } from '@/i18n/locale';

type LanguageSwitcherProps = {
    className?: string;
    variant?: 'compact' | 'full';
    direction?: 'up' | 'down';
    align?: 'left' | 'right';
};

export function LanguageSwitcher({
    className,
    variant = 'compact',
    direction = 'down',
    align = 'right',
}: LanguageSwitcherProps) {
    const t = useTranslations('common');
    const locale = useLocale() as Locale;
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentConfig = getLocaleConfig(locale);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelectLanguage = (newLocale: Locale) => {
        if (newLocale === locale) {
            setIsOpen(false);
            return;
        }

        setIsOpen(false);

        // 1. Immediately write to client document.cookie & localStorage
        if (typeof document !== 'undefined') {
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        }
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('NEXT_LOCALE', newLocale);
        }

        // 2. Set server cookie via Server Action and reload for full RootLayout re-hydration
        startTransition(async () => {
            try {
                await setUserLocale(newLocale);
            } catch {
                // Fallback in case of server action error
            }
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        });
    };

    return (
        <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Change language"
                className={cn(
                    'flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#0A0A0C] shadow-xs backdrop-blur-md transition-all [@media(hover:hover)]:hover:border-black/20 dark:border-white/10 dark:bg-[#141417]/80 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:border-white/20',
                    isOpen && 'border-[#3B82F6] dark:border-[#60A5FA]',
                    variant === 'full' && 'px-3.5 py-2 text-sm',
                )}>
                <span className="text-sm leading-none">{currentConfig.flag}</span>
                <span className="uppercase tracking-wider">
                    {variant === 'full' ? currentConfig.localName : currentConfig.code}
                </span>
                {isPending ? (
                    <Loader2 size={13} className="animate-spin text-[#3B82F6] dark:text-[#60A5FA]" />
                ) : (
                    <ChevronDown
                        size={13}
                        className={cn(
                            'text-[#6B6A65] transition-transform duration-200 dark:text-[#94938D]',
                            isOpen && 'rotate-180',
                        )}
                    />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: direction === 'down' ? 6 : -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: direction === 'down' ? 6 : -6 }}
                        transition={{ duration: 0.15, ease: EASE }}
                        className={cn(
                            'absolute z-50 min-w-44 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#141417]/95',
                            direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2',
                            align === 'left' ? 'left-0' : 'right-0',
                        )}>
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                            {t('selectLanguage')}
                        </div>
                        <div className="space-y-0.5 max-h-[min(320px,calc(100dvh-120px))] overflow-y-auto">
                            {LOCALES_CONFIG.map((lang) => {
                                const isSelected = lang.code === locale;
                                return (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => handleSelectLanguage(lang.code)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors',
                                            isSelected
                                                ? 'bg-[#3B82F6]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]'
                                                : 'text-[#0A0A0C] [@media(hover:hover)]:hover:bg-black/5 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:bg-white/5',
                                        )}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm leading-none">{lang.flag}</span>
                                            <span className="font-semibold">{lang.localName}</span>
                                            <span className="text-[10px] text-[#6B6A65] dark:text-[#94938D]">
                                                ({lang.name})
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Check size={14} className="shrink-0 text-[#2563EB] dark:text-[#60A5FA]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
