'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Percent, DollarSign, Power } from 'lucide-react';

import {
    CreateHappyHourSchema,
    type CreateHappyHourDto,
    type HappyHourRuleResponse,
    type MenuCategoryWithItemsResponse,
    type UpdateHappyHourDto,
} from '@my-app/types';

import { AuthInput } from '@/shared/ui/AuthInput';
import { Modal } from '@/shared/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { ToggleSwitch as Switch } from '@/shared/ui/ToggleSwitch';
import { cn } from '@/shared/lib/utils';

import { RuleBuilder, type RuleScope } from './RuleBuilder';
import type { RuleBuilderGroup } from '../hooks/useRuleBuilder';

const DAY_OPTIONS = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
] as const;

const DISCOUNT_OPTIONS = [
    { value: 'PERCENTAGE' as const, label: 'Percent %', icon: Percent },
    { value: 'FIXED' as const, label: 'Fixed $', icon: DollarSign },
];

const EMPTY_FORM: CreateHappyHourDto = {
    name: '',
    daysOfWeek: [],
    startTime: '16:00',
    endTime: '18:00',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    categoryIds: [],
    itemIds: [],
};

type HappyHourFormModalProps = {
    open: boolean;
    editing: HappyHourRuleResponse | null;
    categories: MenuCategoryWithItemsResponse[];
    onClose: () => void;
    onSubmit: (values: CreateHappyHourDto & { isActive?: boolean }, editing: HappyHourRuleResponse | null) => void;
    isPending: boolean;
};

export function HappyHourFormModal({
    open,
    editing,
    categories,
    onClose,
    onSubmit,
    isPending,
}: HappyHourFormModalProps) {
    const form = useForm<CreateHappyHourDto>({
        resolver: zodResolver(CreateHappyHourSchema),
        defaultValues: EMPTY_FORM,
    });

    const [scope, setScope] = useState<RuleScope>('ENTIRE_MENU');
    const [groups, setGroups] = useState<RuleBuilderGroup[]>([]);
    const [isActive, setIsActive] = useState(true);

    const days = form.watch('daysOfWeek');
    const discountType = form.watch('discountType');

    useEffect(() => {
        if (!open) return;

        if (editing) {
            form.reset({
                name: editing.name,
                daysOfWeek: editing.daysOfWeek,
                startTime: editing.startTime,
                endTime: editing.endTime,
                discountType: editing.discountType,
                discountValue: editing.discountValue,
                categoryIds: editing.categories.map((c) => c.id),
                itemIds: editing.items.map((i) => i.id),
            });
            setIsActive(editing.isActive);

            const restoredGroups: RuleBuilderGroup[] = [];

            for (const cat of editing.categories) {
                restoredGroups.push({ uid: `restored_${cat.id}`, categoryId: cat.id, itemIds: [] });
            }

            if (editing.items.length > 0) {
                const itemsByCat = new Map<string, string[]>();
                for (const item of editing.items) {
                    const menuItem = categories.flatMap((c) => c.items).find((i) => i.id === item.id);
                    if (!menuItem) continue;
                    const arr = itemsByCat.get(menuItem.categoryId) ?? [];
                    arr.push(item.id);
                    itemsByCat.set(menuItem.categoryId, arr);
                }

                for (const [categoryId, itemIds] of itemsByCat.entries()) {
                    restoredGroups.push({ uid: `restored_items_${categoryId}`, categoryId, itemIds });
                }
            }

            setGroups(restoredGroups);
            setScope(restoredGroups.length > 0 ? 'SPECIFIC' : 'ENTIRE_MENU');
        } else {
            form.reset(EMPTY_FORM);
            setIsActive(true);
            setGroups([]);
            setScope('ENTIRE_MENU');
        }
    }, [open, editing, form, categories]);

    const toggleDay = (value: number) => {
        const next = new Set(days);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        form.setValue(
            'daysOfWeek',
            [...next].sort((a, b) => a - b),
            { shouldValidate: true },
        );
    };

    const handleSubmit = form.handleSubmit((values) => {
        const categoryIds: string[] = [];
        const itemIds: string[] = [];

        if (scope === 'SPECIFIC') {
            for (const group of groups) {
                if (!group.categoryId) continue;
                if (group.itemIds.length === 0) {
                    categoryIds.push(group.categoryId);
                } else {
                    itemIds.push(...group.itemIds);
                }
            }
        }

        const payload: CreateHappyHourDto & { isActive?: boolean } = {
            ...values,
            categoryIds: Array.from(new Set(categoryIds)),
            itemIds: Array.from(new Set(itemIds)),
        };

        if (editing) payload.isActive = isActive;

        onSubmit(payload, editing);
    });

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? 'Edit Happy Hour rule' : 'Create Happy Hour rule'}
            description="Time-boxed discounts that boost your off-peak hours."
            scrollable
            className="max-w-xl w-full"
            maxHeightClass="max-h-[85vh]">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* === NAME === */}
                <AuthInput
                    id="hh-name"
                    label="Rule name"
                    placeholder="e.g. Friday Cocktails"
                    error={form.formState.errors.name?.message}
                    {...form.register('name')}
                />

                {/* === DAYS === */}
                <div>
                    <span className="mb-2 block text-xs font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                        Days of week
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {DAY_OPTIONS.map((day) => {
                            const active = days.includes(day.value);
                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    aria-pressed={active}
                                    className={cn(
                                        'rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors',
                                        active
                                            ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                            : 'border-[#E7E5E0] bg-white text-[#6B6A65] hover:border-[#3B82F6]/30 dark:border-[#232327] dark:bg-[#141417] dark:text-[#94938D]',
                                    )}>
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                    {form.formState.errors.daysOfWeek && (
                        <p className="mt-1.5 text-xs text-red-500">
                            {form.formState.errors.daysOfWeek.message as unknown as string}
                        </p>
                    )}
                </div>

                {/* === TIME === */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <AuthInput
                        id="hh-start"
                        label="Start time"
                        type="time"
                        error={form.formState.errors.startTime?.message}
                        {...form.register('startTime')}
                    />
                    <AuthInput
                        id="hh-end"
                        label="End time"
                        type="time"
                        error={form.formState.errors.endTime?.message}
                        {...form.register('endTime')}
                    />
                </div>

                {/* === DISCOUNT (Type + Value) === */}
                <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 sm:gap-4">
                    <div>
                        <span className="mb-1.5 block text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                            Discount Type
                        </span>
                        <div className="flex h-[42px] rounded-xl border border-[#E7E5E0] bg-white p-1 dark:border-[#232327] dark:bg-[#141417]">
                            {DISCOUNT_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const active = discountType === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            form.setValue('discountType', opt.value, { shouldValidate: true })
                                        }
                                        aria-pressed={active}
                                        className={cn(
                                            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors',
                                            active
                                                ? 'bg-[#3B82F6]/10 text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#93C5FD]'
                                                : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]',
                                        )}>
                                        <Icon size={12} strokeWidth={2.2} />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="min-w-0">
                        <AuthInput
                            id="hh-value"
                            label={discountType === 'PERCENTAGE' ? 'Discount (% off)' : 'Discount ($ off)'}
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder={discountType === 'PERCENTAGE' ? '20' : '5.00'}
                            error={form.formState.errors.discountValue?.message}
                            {...form.register('discountValue', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                {/* === RULE BUILDER === */}
                <div className="border-t border-[#E7E5E0] pt-4 dark:border-[#232327]">
                    <span className="mb-2 block text-xs font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                        Apply rule to
                    </span>
                    <RuleBuilder
                        scope={scope}
                        onScopeChange={setScope}
                        groups={groups}
                        onGroupsChange={setGroups}
                        categories={categories}
                    />
                </div>

                {/* === ACTIVE TOGGLE (edit mode only) === */}
                {editing && (
                    <div className="flex items-center justify-between rounded-xl border border-[#E7E5E0] bg-white/60 px-4 py-3 dark:border-[#232327] dark:bg-[#141417]/60">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                            <Power size={14} className="text-[#6B6A65] dark:text-[#94938D]" />
                            Promotion active
                        </span>
                        <Switch checked={isActive} onChange={setIsActive} />
                    </div>
                )}

                {/* === ACTIONS === */}
                <div className="flex justify-end gap-2 border-t border-[#E7E5E0] pt-4 dark:border-[#232327]">
                    <SecondaryButton type="button" onClick={onClose} disabled={isPending}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" loading={isPending}>
                        {editing ? 'Save changes' : 'Create rule'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
