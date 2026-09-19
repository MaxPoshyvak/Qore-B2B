'use client';

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const LENGTH = 6;

export function OtpInput({
    value,
    onChange,
    onComplete,
    disabled = false,
    error = false,
}: {
    value: string;
    onChange: (next: string) => void;
    onComplete?: (code: string) => void;
    disabled?: boolean;
    error?: boolean;
}) {
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (value.length === LENGTH) onComplete?.(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    function setAt(index: number, char: string) {
        const chars = value.padEnd(LENGTH, ' ').split('');
        chars[index] = char || ' ';
        const next = chars.join('').replace(/\s+$/g, '');
        onChange(next);
    }

    function handleChange(index: number, raw: string) {
        const char = raw.replace(/\D/g, '').slice(-1);
        if (!char) return;
        setAt(index, char);
        if (index < LENGTH - 1) inputs.current[index + 1]?.focus();
    }

    function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (value[index]) {
                setAt(index, '');
            } else if (index > 0) {
                inputs.current[index - 1]?.focus();
                setAt(index - 1, '');
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    }

    function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
        if (!pasted) return;
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, LENGTH - 1);
        inputs.current[focusIndex]?.focus();
    }

    return (
        <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {Array.from({ length: LENGTH }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputs.current[i] = el;
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    disabled={disabled}
                    value={value[i] ?? ''}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`h-14 w-full min-w-0 rounded-2xl border bg-white text-center text-[24px] font-medium text-[#0A0A0C] outline-none transition-colors dark:bg-[#141417] dark:text-[#F5F4F2] ${
                        error
                            ? 'border-red-400/70 focus:border-red-400'
                            : 'border-[#E7E5E0] focus:border-[#3B82F6]/60 dark:border-[#232327]'
                    } disabled:opacity-60`}
                />
            ))}
        </div>
    );
}
