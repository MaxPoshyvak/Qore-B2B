'use client';

import { Modal } from '@/shared/ui/Modal';
import { display } from '@/shared/lib/fonts';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ProUpgradeModalProps = {
    open: boolean;
    onClose: () => void;
    /** Hook for the parent to route the user to the billing/upgrade flow. */
    onUpgrade?: () => void;
};

/**
 * Editorial, glassmorphic upgrade dialog shown to free-tier users who try to
 * use the AI dish generator. Kept generic so any feature can reuse it.
 */
export function ProUpgradeModal({ open, onClose, onUpgrade }: ProUpgradeModalProps) {
    const t = useTranslations('menuManagement');

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('unlockAiTitle')}
            className="max-w-md"
            description={t('unlockAiDesc')}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-center rounded-2xl border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/15 via-[#3B82F6]/5 to-transparent p-6">
                    <Sparkles size={40} className="text-[#8B5CF6]" />
                </div>

                <ul className="flex flex-col gap-2 text-sm text-[#6B6A65] dark:text-[#94938D]">
                    <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8B5CF6]" />
                        {t('unlockAiFeature1')}
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8B5CF6]" />
                        {t('unlockAiFeature2')}
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8B5CF6]" />
                        {t('unlockAiFeature3')}
                    </li>
                </ul>

                <button
                    type="button"
                    onClick={() => {
                        onUpgrade?.();
                        onClose();
                    }}
                    className="w-full rounded-full bg-[#0A0A0C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A0A0C]/90 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-[#F5F4F2]/90">
                    {t('upgradeToPro')}
                </button>
            </div>
        </Modal>
    );
}
