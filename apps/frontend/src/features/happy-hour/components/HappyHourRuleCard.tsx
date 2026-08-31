'use client';

import { motion } from 'framer-motion';
import { Clock, Pencil, Tag, Trash2 } from 'lucide-react';

import type { HappyHourRuleResponse } from '@my-app/types';

import { ToggleSwitch as Switch } from '@/shared/ui/ToggleSwitch';
import { cn } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';

type HappyHourRuleCardProps = {
    rule: HappyHourRuleResponse;
    onToggleActive: (rule: HappyHourRuleResponse) => void;
    onEdit: (rule: HappyHourRuleResponse) => void;
    onDelete: (rule: HappyHourRuleResponse) => void;
};

/** Допоміжні форматування — тримаємо локально, щоб картка не залежала від батька. */
function formatDays(days: number[]): string {
    if (!days.length) return '—';
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return [...days]
        .sort((a, b) => a - b)
        .map((d) => labels[d] ?? '')
        .join(', ');
}

function formatDiscount(rule: HappyHourRuleResponse): string {
    return rule.discountType === 'PERCENTAGE' ? `${rule.discountValue}% off` : `$${rule.discountValue} off`;
}

function formatAppliesTo(rule: HappyHourRuleResponse): string {
    const names = [...rule.categories.map((c) => c.name), ...rule.items.map((i) => i.name)];
    if (names.length === 0) return 'All Menu';
    const shown = names.slice(0, 3).join(', ');
    const extra = names.length - 3;
    return extra > 0 ? `${shown} +${extra} more` : shown;
}

/**
 * Картка одного правила Happy Hour у списку дашборду.
 *
 * Layout (STEP 2 fix): строгий flex-рядок без absolute-позиціонування.
 * Ліва частина — іконка + текст (truncate-safe). Права частина — toggle + кнопки дій,
 * обгорнуті у власний flex-контейнер із фіксованим gap.
 */
export function HappyHourRuleCard({ rule, onToggleActive, onEdit, onDelete }: HappyHourRuleCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn(
                'flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md',
                rule.isActive ? '' : 'opacity-70',
            )}>
            {/* === LEFT: icon + meta === */}
            <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/15 to-[#8B5CF6]/15 text-[#6D28D9] dark:text-[#C4B5FD]">
                    <Clock size={18} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {rule.name}
                        </h3>
                        <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[11.5px] font-medium text-[#2563EB] dark:text-[#60A5FA]">
                            {formatDiscount(rule)}
                        </span>
                    </div>

                    <p className="mt-0.5 truncate text-[12.5px] text-[#6B6A65] dark:text-[#94938D]">
                        {formatDays(rule.daysOfWeek)} · {rule.startTime}–{rule.endTime}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[#6B6A65] dark:text-[#94938D]">
                        <Tag size={11} className="shrink-0 opacity-60" />
                        <span className="truncate">
                            {rule.categories.length === 0 && rule.items.length === 0 ? (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                    All Menu
                                </span>
                            ) : (
                                <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {formatAppliesTo(rule)}
                                </span>
                            )}
                        </span>
                    </p>
                </div>
            </div>

            {/* === RIGHT: actions (toggle + edit + delete) === */}
            <div className="flex shrink-0 items-center gap-3">
                <Switch
                    checked={rule.isActive}
                    onChange={() => onToggleActive(rule)}
                    aria-label="Toggle promotion"
                />
                <button
                    type="button"
                    onClick={() => onEdit(rule)}
                    aria-label="Edit rule"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:text-[#94938D]">
                    <Pencil size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(rule)}
                    aria-label="Delete rule"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#6B6A65] transition-colors hover:border-red-500/40 hover:text-red-500 dark:border-white/10 dark:text-[#94938D]">
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
}
