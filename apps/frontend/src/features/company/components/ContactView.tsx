'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones,
    Briefcase,
    Shield,
    Send,
    CheckCircle2,
    ChevronDown,
    Mail,
    Clock,
    Sparkles,
} from 'lucide-react';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { PublicShell } from '@/shared/ui/PublicShell';

export function ContactView() {
    const t = useTranslations('contact');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [venue, setVenue] = useState('');
    const [subject, setSubject] = useState('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // FAQ Accordion state
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const contactCards = [
        {
            icon: Headphones,
            title: t('cards.supportTitle'),
            email: t('cards.supportEmail'),
            desc: t('cards.supportDesc'),
            meta: t('cards.supportMeta'),
            color: 'from-[#3B82F6]/20 to-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]',
        },
        {
            icon: Briefcase,
            title: t('cards.salesTitle'),
            email: t('cards.salesEmail'),
            desc: t('cards.salesDesc'),
            meta: t('cards.salesMeta'),
            color: 'from-[#8B5CF6]/20 to-[#7C3AED]/10 text-[#7C3AED] dark:text-[#C4B5FD]',
        },
        {
            icon: Shield,
            title: t('cards.privacyTitle'),
            email: t('cards.privacyEmail'),
            desc: t('cards.privacyDesc'),
            meta: t('cards.privacyMeta'),
            color: 'from-[#10B981]/20 to-[#059669]/10 text-[#04916C] dark:text-[#10B981]',
        },
    ];

    const faqs = [
        { q: t('faq1Q'), a: t('faq1A') },
        { q: t('faq2Q'), a: t('faq2A') },
        { q: t('faq3Q'), a: t('faq3A') },
        { q: t('faq4Q'), a: t('faq4A') },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;

        setIsSubmitting(true);
        // Simulate smooth network dispatch
        await new Promise((r) => setTimeout(r, 800));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleReset = () => {
        setName('');
        setEmail('');
        setVenue('');
        setMessage('');
        setIsSuccess(false);
    };

    return (
        <PublicShell>
            <div className="mx-auto max-w-5xl px-6 py-4">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/5 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#93C5FD]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                        {t('badge')}
                    </span>

                    <h1
                        className={`${display.className} mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl lg:text-5xl`}>
                        {t('title')}
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#6B6A65] dark:text-[#94938D] sm:text-lg">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Direct Contact Channels */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
                    className="mt-12 grid gap-5 sm:grid-cols-3">
                    {contactCards.map((c) => {
                        const Icon = c.icon;
                        return (
                            <div
                                key={c.title}
                                className="flex flex-col rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color}`}>
                                    <Icon size={20} strokeWidth={2.2} />
                                </span>

                                <h2 className={`${display.className} mt-4 text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {c.title}
                                </h2>

                                <a
                                    href={`mailto:${c.email}`}
                                    className="mt-1 text-sm font-semibold text-[#3B82F6] hover:underline dark:text-[#60A5FA]">
                                    {c.email}
                                </a>

                                <p className="mt-2 text-xs leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                    {c.desc}
                                </p>

                                <div className="mt-auto pt-4 flex items-center gap-1.5 text-[11px] font-medium text-[#9C9B95] dark:text-[#6E6D68]">
                                    <Clock size={12} />
                                    <span>{c.meta}</span>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Main Grid: Interactive Form & FAQ */}
                <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:items-start">
                    {/* Left: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="rounded-[32px] border border-black/5 bg-white/80 p-7 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#141417]/90 lg:col-span-7 sm:p-8">
                        <span className={`${mono.className} text-[11px] uppercase tracking-widest text-[#3B82F6]`}>
                            {t('form.badge')}
                        </span>
                        <h2 className={`${display.className} mt-1 text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {t('form.title')}
                        </h2>
                        <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                            {t('form.desc')}
                        </p>

                        <div className="mt-6">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 text-center">
                                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/15 text-[#04916C] dark:text-[#10B981]">
                                        <CheckCircle2 size={30} strokeWidth={2.2} />
                                    </span>
                                    <h3 className={`${display.className} mt-4 text-xl font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                        {t('form.successTitle')}
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                        {t('form.successDesc')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="mt-6 rounded-xl border border-[#E7E5E0] bg-white px-4 py-2.5 text-xs font-semibold text-[#0A0A0C] transition-colors hover:bg-black/5 dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                                        {t('form.sendAnother')}
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-medium text-[#3A3A36] dark:text-[#C7C6C1]">
                                                {t('form.nameLabel')} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder={t('form.namePlaceholder')}
                                                className="mt-1.5 w-full rounded-xl border border-[#E7E5E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:placeholder:text-[#6E6D68]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[#3A3A36] dark:text-[#C7C6C1]">
                                                {t('form.emailLabel')} *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t('form.emailPlaceholder')}
                                                className="mt-1.5 w-full rounded-xl border border-[#E7E5E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:placeholder:text-[#6E6D68]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-medium text-[#3A3A36] dark:text-[#C7C6C1]">
                                                {t('form.venueLabel')}
                                            </label>
                                            <input
                                                type="text"
                                                value={venue}
                                                onChange={(e) => setVenue(e.target.value)}
                                                placeholder={t('form.venuePlaceholder')}
                                                className="mt-1.5 w-full rounded-xl border border-[#E7E5E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:placeholder:text-[#6E6D68]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[#3A3A36] dark:text-[#C7C6C1]">
                                                {t('form.subjectLabel')}
                                            </label>
                                            <select
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="mt-1.5 w-full rounded-xl border border-[#E7E5E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#0A0A0C] transition-colors focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2]">
                                                <option value="general">{t('form.subjectGeneral')}</option>
                                                <option value="sales">{t('form.subjectSales')}</option>
                                                <option value="support">{t('form.subjectSupport')}</option>
                                                <option value="billing">{t('form.subjectBilling')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[#3A3A36] dark:text-[#C7C6C1]">
                                            {t('form.messageLabel')} *
                                        </label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder={t('form.messagePlaceholder')}
                                            className="mt-1.5 w-full rounded-xl border border-[#E7E5E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:placeholder:text-[#6E6D68]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-opacity hover:opacity-95 disabled:opacity-70">
                                        <Send size={15} />
                                        {isSubmitting ? t('form.submittingButton') : t('form.submitButton')}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: FAQ Accordion */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="lg:col-span-5">
                        <span className={`${mono.className} text-[11px] uppercase tracking-widest text-[#3B82F6]`}>
                            {t('faqBadge')}
                        </span>
                        <h2 className={`${display.className} mt-1 text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {t('faqTitle')}
                        </h2>

                        <div className="mt-6 space-y-3">
                            {faqs.map((faq, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <div
                                        key={faq.q}
                                        className="overflow-hidden rounded-2xl border border-black/5 bg-white/70 transition-colors dark:border-white/10 dark:bg-white/[0.03]">
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : i)}
                                            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                                            <span className="text-[14px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                {faq.q}
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                className={`shrink-0 text-[#6B6A65] transition-transform duration-200 dark:text-[#94938D] ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: EASE }}
                                                    className="overflow-hidden">
                                                    <p className="px-4 pb-4 text-[13px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                                        {faq.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </PublicShell>
    );
}
