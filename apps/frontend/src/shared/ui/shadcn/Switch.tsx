import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    size?: 'sm' | 'md';
    onCheckedChange?: (checked: boolean) => void;
};

/**
 * Headless, fully accessible switch built on a native checkbox input so it
 * works out-of-the-box with React Hook Form's `register`/`Controller`.
 * The visual track/thumb is rendered via sibling elements and driven by the
 * `peer-checked` / `peer-focus-visible` pseudo-classes.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, defaultChecked, size = 'md', disabled, onCheckedChange, onChange, ...props }, ref) => {
        const dims = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
        const knob = size === 'sm' ? 'h-4 w-4 peer-checked:translate-x-4' : 'h-5 w-5 peer-checked:translate-x-5';
        const isControlled = checked !== undefined;

        return (
            <span className={cn('relative inline-flex shrink-0 items-center', disabled && 'opacity-50', className)}>
                <input
                    type="checkbox"
                    ref={ref}
                    role="switch"
                    aria-checked={isControlled ? checked : defaultChecked}
                    disabled={disabled}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    onChange={(e) => {
                        onCheckedChange?.(e.target.checked);
                        onChange?.(e);
                    }}
                    className="peer h-0 w-0 appearance-none rounded-full focus:outline-none"
                    {...props}
                />
                <span
                    className={cn(
                        'pointer-events-none absolute inset-0 rounded-full bg-black/15 transition-colors duration-200',
                        'peer-checked:bg-gradient-to-r peer-checked:from-[#3B82F6] peer-checked:to-[#8B5CF6]',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-[#3B82F6]/40',
                        'dark:bg-white/15',
                        dims,
                    )}
                />
                <span
                    className={cn(
                        'pointer-events-none absolute left-0.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200',
                        knob,
                    )}
                />
            </span>
        );
    },
);
Switch.displayName = 'Switch';

export { Switch };
