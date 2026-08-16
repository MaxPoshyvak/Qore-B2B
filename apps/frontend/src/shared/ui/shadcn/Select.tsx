'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SelectContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect() {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error('Select components must be used within <Select>');
    return ctx;
}

interface SelectProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const isControlled = value !== undefined;
    const current = isControlled ? value : uncontrolled;

    const handleChange = React.useCallback(
        (next: string) => {
            if (!isControlled) setUncontrolled(next);
            onValueChange?.(next);
            setOpen(false);
        },
        [isControlled, onValueChange],
    );

    return (
        <SelectContext.Provider
            value={{
                value: current,
                onValueChange: handleChange,
                open,
                setOpen,
                triggerRef,
            }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    ariaLabel?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ariaLabel, ...props }, ref) => {
        const { open, setOpen, triggerRef } = useSelect();
        return (
            <button
                ref={(node) => {
                    triggerRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) (ref as React.RefObject<HTMLButtonElement | null>).current = node;
                }}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-label={ariaLabel}
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-[#E7E5E0] bg-white px-3 py-2 text-sm text-[#0A0A0C] outline-none transition-colors',
                    'hover:border-black/20 focus-visible:border-[#3B82F6]/60 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/15',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2]',
                    className,
                )}
                {...props}>
                {children}
                <ChevronDown
                    className={cn(
                        'h-4 w-4 shrink-0 text-[#6B6A65] transition-transform dark:text-[#94938D]',
                        open && 'rotate-180',
                    )}
                />
            </button>
        );
    },
);
SelectTrigger.displayName = 'SelectTrigger';

function SelectValue({ placeholder }: { placeholder?: string }) {
    const { value } = useSelect();
    return <span className={cn(!value && 'text-[#A8A6A0] dark:text-[#5A5A56]')}>{value || placeholder}</span>;
}

interface SelectContentProps {
    children: React.ReactNode;
    className?: string;
}

function SelectContent({ children, className }: SelectContentProps) {
    const { open, triggerRef, setOpen } = useSelect();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        const onPointer = (e: MouseEvent) => {
            if (
                contentRef.current &&
                !contentRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    return (
        <div
            ref={contentRef}
            role="listbox"
            className={cn(
                'absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-black/5 bg-white p-1 shadow-lg shadow-black/5 backdrop-blur-xl',
                'dark:border-white/10 dark:bg-[#1A1A1F] dark:shadow-black/40',
                className,
            )}>
            {children}
        </div>
    );
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

function SelectItem({ value, children, className }: SelectItemProps) {
    const { value: selected, onValueChange } = useSelect();
    const active = selected === value;
    return (
        <button
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onValueChange?.(value)}
            className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#0A0A0C] outline-none transition-colors',
                'hover:bg-black/[0.04] dark:text-[#F5F4F2] dark:hover:bg-white/[0.06]',
                active && 'bg-[#3B82F6]/10 font-medium text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#93C5FD]',
                className,
            )}>
            <span>{children}</span>
            {active && <Check className="h-4 w-4 shrink-0" />}
        </button>
    );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
