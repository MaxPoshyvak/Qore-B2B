'use client';

import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type ToggleSwitchProps = {
    checked: boolean;
    onChange: (next: boolean) => void;
    disabled?: boolean;
    className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'checked' | 'type'>;

/**
 * Кастомний перемикач (switch), що використовується у налаштуваннях робочих годин.
 * Винесений у shared/ui, щоб Happy Hour та інші фічі використовували ТОЙ САМИЙ
 * компонент замість баггі-шадcn Switch.
 */
export function ToggleSwitch({ checked, onChange, disabled, className, ...rest }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 disabled:cursor-not-allowed disabled:opacity-50',
                checked
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]'
                    : 'bg-black/15 dark:bg-white/15',
                className,
            )}
            {...rest}>
            <span
                className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    checked ? 'translate-x-5' : '',
                )}
            />
        </button>
    );
}
