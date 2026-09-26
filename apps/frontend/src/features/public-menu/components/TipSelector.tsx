'use client';

import { useState } from 'react';
import { formatPrice } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';

type TipSelectorProps = {
    baseAmount: number;
    tipAmount: number;
    onTipChange: (tip: number) => void;
};

const TIP_PERCENTAGES = [0, 10, 15, 20] as const;

export function TipSelector({ baseAmount, tipAmount, onTipChange }: TipSelectorProps) {
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState('');

    function handlePresetClick(pct: number) {
        setIsCustom(false);
        setCustomValue('');
        const calculated = pct === 0 ? 0 : Math.round(baseAmount * (pct / 100) * 100) / 100;
        onTipChange(calculated);
    }

    function handleCustomChange(value: string) {
        setCustomValue(value);
        const parsed = Number.parseFloat(value);
        if (Number.isFinite(parsed) && parsed >= 0) {
            onTipChange(Math.round(parsed * 100) / 100);
        } else {
            onTipChange(0);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                <span>Add tip for staff</span>
                {tipAmount > 0 && (
                    <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                        +{formatPrice(tipAmount)}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {TIP_PERCENTAGES.map((pct) => {
                    const presetAmount = pct === 0 ? 0 : Math.round(baseAmount * (pct / 100) * 100) / 100;
                    const isSelected = !isCustom && tipAmount === presetAmount && (pct > 0 ? tipAmount > 0 : tipAmount === 0);

                    return (
                        <button
                            key={pct}
                            type="button"
                            onClick={() => handlePresetClick(pct)}
                            className={cn(
                                'flex flex-col items-center justify-center rounded-xl border py-2 text-xs transition-all duration-150',
                                isSelected
                                    ? 'border-[#3B82F6] bg-[#3B82F6]/10 font-bold text-[#2563EB] dark:border-[#60A5FA] dark:text-[#60A5FA]'
                                    : 'border-black/10 bg-black/[0.02] text-[#0A0A0C] [@media(hover:hover)]:hover:border-black/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:border-white/20',
                            )}>
                            <span>{pct === 0 ? 'No tip' : `${pct}%`}</span>
                            {pct > 0 && (
                                <span className="text-[10px] opacity-75">
                                    {formatPrice(presetAmount)}
                                </span>
                            )}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={() => {
                        setIsCustom(true);
                    }}
                    className={cn(
                        'flex flex-col items-center justify-center rounded-xl border py-2 text-xs transition-all duration-150',
                        isCustom
                            ? 'border-[#3B82F6] bg-[#3B82F6]/10 font-bold text-[#2563EB] dark:border-[#60A5FA] dark:text-[#60A5FA]'
                            : 'border-black/10 bg-black/[0.02] text-[#0A0A0C] [@media(hover:hover)]:hover:border-black/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:border-white/20',
                    )}>
                    <span>Custom</span>
                </button>
            </div>

            {isCustom && (
                <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6B6A65] dark:text-[#94938D]">
                        $
                    </span>
                    <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0.00"
                        value={customValue}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        autoFocus
                        className="w-full rounded-xl border border-black/10 bg-white/80 py-2 pl-7 pr-3 text-sm font-semibold text-[#0A0A0C] shadow-sm backdrop-blur-md outline-none focus:border-[#3B82F6] dark:border-white/10 dark:bg-[#141417]/80 dark:text-[#F5F4F2] dark:focus:border-[#60A5FA]"
                    />
                </div>
            )}
        </div>
    );
}
