'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Pencil, Tag, Trash2 } from 'lucide-react';

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

function formatDays(days: number[]): string {
    if (!days.length) return 'No days';
    if (days.length === 7) return 'Every day';
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
    const shown = names.slice(0, 2).join(', ');
    const extra = names.length - 2;
    return extra > 0 ? `${shown} +${extra} more` : shown;
}

export function HappyHourRuleCard({ rule, onToggleActive, onEdit, onDelete }: HappyHourRuleCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn(
                'flex flex-col rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-xs transition-all dark:border-[#232327] dark:bg-[#141417] sm:p-5',
                rule.isActive ? '' : 'opacity-75 dark:opacity-65',
            )}>
            {/* Header: Icon + Title + Discount + Active Toggle */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#7C3AED] dark:bg-[#8B5CF6]/15 dark:text-[#C4B5FD]">
                        <Clock size={16} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                {rule.name}
                            </h3>
                            <span className="shrink-0 rounded-full bg-[#8B5CF6]/10 px-2 py-0.5 text-xs font-medium text-[#7C3AED] dark:bg-[#8B5CF6]/20 dark:text-[#C4B5FD]">
                                {formatDiscount(rule)}
                            </span>
                            {!rule.isActive && (
                                <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-[#A8A6A0] dark:bg-white/5 dark:text-[#5A5A56]">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Toggle Switch */}
                <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-xs text-[#6B6A65] dark:text-[#94938D] sm:inline">
                        {rule.isActive ? 'Active' : 'Paused'}
                    </span>
                    <Switch
                        checked={rule.isActive}
                        onChange={() => onToggleActive(rule)}
                        aria-label="Toggle promotion"
                    />
                </div>
            </div>

            {/* Generous Divider Line with intentional margin top & bottom */}
            <div className="my-3.5 border-t border-[#E7E5E0] dark:border-[#232327]" />

            {/* Bottom Details & Actions Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Schedule and Target items */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#6B6A65] dark:text-[#94938D]">
                    <div className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0 text-[#3B82F6]" />
                        <span>{formatDays(rule.daysOfWeek)}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="shrink-0 text-[#8B5CF6]" />
                        <span>
                            {rule.startTime} – {rule.endTime}
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                        <Tag
                            size={13}
                            className={
                                rule.categories.length === 0 && rule.items.length === 0
                                    ? 'shrink-0 text-emerald-500'
                                    : 'shrink-0 text-[#9C9B95]'
                            }
                        />
                        <span
                            className={
                                rule.categories.length === 0 && rule.items.length === 0
                                    ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                    : 'font-medium text-[#0A0A0C] dark:text-[#F5F4F2]'
                            }>
                            {formatAppliesTo(rule)}
                        </span>
                    </div>
                </div>

                {/* Edit / Delete actions — accessible on touch and desktop */}
                <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0">
                    <button
                        type="button"
                        onClick={() => onEdit(rule)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E7E5E0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#6B6A65] shadow-xs transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-[#232327] dark:bg-[#1A1A1E] dark:text-[#94938D] dark:hover:text-[#60A5FA]">
                        <Pencil size={12} />
                        <span>Edit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(rule)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-xs transition-colors hover:bg-red-100/60 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                        <Trash2 size={12} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
