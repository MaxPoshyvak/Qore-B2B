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

/**
 * Дні тижня у порядку Mon→Sun (згідно з вимогою UX, а не Prisma-значенням 0=Sun).
 * Значення у payload залишаються Prisma-сумісними (0=Sun, 1=Mon, …).
 */
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
    { value: 'PERCENTAGE' as const, label: 'Off', icon: Percent },
    { value: 'FIXED' as const, label: 'Off', icon: DollarSign },
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

/**
 * Модальне вікно створення/редагування правила Happy Hour.
 *
 * Внутрішній стан поділено на дві частини:
 *  - React Hook Form — валідація + базові поля (name, days, time, discount).
 *  - Локальний `useState` — `scope` (ENTIRE_MENU / SPECIFIC) і масив `groups` для Rule Builder.
 *
 * Перед submit ми зводимо `groups` → плоскі `categoryIds` / `itemIds` (див. `useRuleBuilder`).
 */
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

    /**
     * Ініціалізуємо форму щоразу при відкритті модального вікна.
     * Це безпечніше за `defaultValues` з `editing` у `useForm`,
     * бо дозволяє коректно перемикатися між create/edit без ручного reset.
     */
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

            /**
             * Відновлюємо візуальний стан Rule Builder з плоских масивів бекенда:
             *  - Кожна категорія без itemIds → окрема "порожня" група.
             *  - Кожна категорія, яка має itemIds у правилі → окрема група з цими itemIds.
             */
            const flatItemIds = new Set(editing.items.map((i) => i.id));
            const restoredGroups: RuleBuilderGroup[] = [];

            for (const cat of editing.categories) {
                restoredGroups.push({ uid: `restored_${cat.id}`, categoryId: cat.id, itemIds: [] });
            }

            if (editing.items.length > 0) {
                // Групуємо позиції за категорією
                const itemsByCat = new Map<string, string[]>();
                for (const item of editing.items) {
                    // Потрібен categoryId — отримуємо з повного списку категорій.
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
        // === ЗВОРОТНЄ ПЕРЕТВОРЕННЯ: groups → flat categoryIds / itemIds ===
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
            className="max-w-md"
            maxHeightClass="max-h-[85vh]">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* === NAME === */}
                <AuthInput
                    id="hh-name"
                    label="Rule name"
                    placeholder="Friday Cocktails"
                    error={form.formState.errors.name?.message}
                    {...form.register('name')}
                />

                {/* === DAYS === */}
                <div>
                    <span className="mb-2 block text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                        Days of week
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {DAY_OPTIONS.map((day) => {
                            const active = days.includes(day.value);
                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    aria-pressed={active}
                                    className={cn(
                                        'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                                        active
                                            ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                            : 'border-[#E7E5E0] bg-white/60 text-[#6B6A65] hover:border-[#3B82F6]/30 dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                                    )}>
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                    {form.formState.errors.daysOfWeek && (
                        <p className="mt-1.5 text-[12.5px] text-red-500">
                            {form.formState.errors.daysOfWeek.message as unknown as string}
                        </p>
                    )}
                </div>

                {/* === TIME (grid 50/50) === */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* === DISCOUNT (toggle + input aligned at bottom) === */}
                <div>
                    <span className="mb-2 block text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">Discount</span>
                    {/*
                      `items-end` вирівнює нижню межу toggle-групи та інпуту.
                      Toggle-група має власний лейбл вище, але без `mb` — це гарантує,
                      що toggle та інпут "стоять" на одному baseline.
                    */}
                    <div className="flex items-end gap-4">
                        <div>
                            <span className="mb-1.5 block text-[13px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                                Type
                            </span>
                            <div className="flex h-[46px] rounded-2xl border border-[#E7E5E0] bg-white/60 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                {DISCOUNT_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const active = discountType === opt.value;
                                    return (
                                        <motion.button
                                            key={opt.value}
                                            type="button"
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() =>
                                                form.setValue('discountType', opt.value, { shouldValidate: true })
                                            }
                                            aria-pressed={active}
                                            className={cn(
                                                'inline-flex h-full items-center justify-center gap-1.5 rounded-xl px-3.5 text-[13px] font-medium transition-colors',
                                                active
                                                    ? 'bg-[#3B82F6]/10 text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#93C5FD]'
                                                    : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]',
                                            )}>
                                            <Icon size={13} strokeWidth={2.2} />
                                            {opt.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <AuthInput
                                id="hh-value"
                                label="Value"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="20"
                                error={form.formState.errors.discountValue?.message}
                                {...form.register('discountValue', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                </div>

                {/* === RULE BUILDER (categories & items) === */}
                <div>
                    <span className="mb-2 block text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">Apply to</span>
                    <RuleBuilder
                        scope={scope}
                        onScopeChange={setScope}
                        groups={groups}
                        onGroupsChange={setGroups}
                        categories={categories}
                    />
                </div>

                {/* === ACTIVE TOGGLE (only in edit mode) === */}
                {editing && (
                    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                            <Power size={14} className="text-[#6B6A65] dark:text-[#94938D]" />
                            Promotion active
                        </span>
                        <Switch checked={isActive} onChange={setIsActive} />
                    </div>
                )}

                {/* === ACTIONS === */}
                <div className="flex justify-end gap-2 border-t border-black/5 pt-4 dark:border-white/10">
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
