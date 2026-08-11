'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

import { Modal } from '@/shared/ui/Modal';
import { SecondaryButton } from '@/shared/ui/PrimaryButton';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    loading?: boolean;
    /** Blocks confirmation when the action is not currently allowed. */
    confirmDisabled?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onClose: () => void;
};

/** Destructive-action confirmation built on top of the shared `Modal`. */
export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Delete',
    loading = false,
    confirmDisabled = false,
    error,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">{description}</p>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
                <SecondaryButton type="button" onClick={onClose} disabled={loading}>
                    {confirmDisabled ? 'Close' : 'Cancel'}
                </SecondaryButton>
                {!confirmDisabled && (
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                )}            </div>
        </Modal>
    );
}
