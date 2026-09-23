'use client';

import { Layers, Plus, Trash2, UtensilsCrossed } from 'lucide-react';

import type { MenuCategoryWithItemsResponse } from '@my-app/types';

import { SecondaryButton } from '@/shared/ui/PrimaryButton';
import { cn } from '@/shared/lib/utils';
import { mono } from '@/shared/lib/fonts';

import type { RuleBuilderGroup } from '../hooks/useRuleBuilder';
import { useRuleBuilder } from '../hooks/useRuleBuilder';

export type RuleScope = 'ENTIRE_MENU' | 'SPECIFIC';

type RuleBuilderProps = {
    scope: RuleScope;
    onScopeChange: (scope: RuleScope) => void;
    groups: RuleBuilderGroup[];
    onGroupsChange: (groups: RuleBuilderGroup[]) => void;
    categories: MenuCategoryWithItemsResponse[];
};

let uidCounter = 0;
const nextUid = () => `grp_${Date.now().toString(36)}_${(uidCounter++).toString(36)}`;

/**
 * Конструктор вибору категорій та страв для Happy Hour — оптимізований для мобільних та ПК.
 */
export function RuleBuilder({ scope, onScopeChange, groups, onGroupsChange, categories }: RuleBuilderProps) {
    const { availableCategories, itemsForGroup } = useRuleBuilder(groups, categories);

    function addGroup() {
        onGroupsChange([...groups, { uid: nextUid(), categoryId: '', itemIds: [] }]);
    }

    function removeGroup(uid: string) {
        onGroupsChange(groups.filter((g) => g.uid !== uid));
    }

    function updateGroup(uid: string, patch: Partial<Omit<RuleBuilderGroup, 'uid'>>) {
        onGroupsChange(groups.map((g) => (g.uid === uid ? { ...g, ...patch } : g)));
    }

    function toggleItem(uid: string, itemId: string) {
        const group = groups.find((g) => g.uid === uid);
        if (!group) return;

        const nextItems = group.itemIds.includes(itemId)
            ? group.itemIds.filter((id) => id !== itemId)
            : [...group.itemIds, itemId];

        updateGroup(uid, { itemIds: nextItems });
    }

    function selectAllItems(uid: string) {
        const group = groups.find((g) => g.uid === uid);
        if (!group || !group.categoryId) return;
        const items = itemsForGroup(group);
        updateGroup(uid, { itemIds: items.map((i) => i.id) });
    }

    function clearItems(uid: string) {
        updateGroup(uid, { itemIds: [] });
    }

    return (
        <div className="space-y-4">
            {/* === SCOPE TOGGLE === */}
            <div
                role="radiogroup"
                aria-label="Apply rule to"
                className="grid grid-cols-1 gap-2 rounded-2xl border border-[#E7E5E0] bg-black/[0.02] p-1.5 dark:border-[#232327] dark:bg-white/[0.02] sm:grid-cols-2">
                <ScopeButton
                    active={scope === 'ENTIRE_MENU'}
                    onClick={() => {
                        onScopeChange('ENTIRE_MENU');
                        onGroupsChange([]);
                    }}
                    icon={<Layers size={15} />}
                    label="Entire menu"
                    description="All categories & items"
                />
                <ScopeButton
                    active={scope === 'SPECIFIC'}
                    onClick={() => {
                        onScopeChange('SPECIFIC');
                        if (groups.length === 0) addGroup();
                    }}
                    icon={<UtensilsCrossed size={15} />}
                    label="Specific items"
                    description="Pick categories & dishes"
                />
            </div>

            {/* === TARGET GROUPS === */}
            {scope === 'SPECIFIC' && (
                <div className="space-y-3">
                    {groups.map((group, index) => {
                        const options = availableCategories(group.uid);
                        const items = itemsForGroup(group);
                        const selectedCategory = options.find((c) => c.id === group.categoryId);

                        return (
                            <div
                                key={group.uid}
                                className="space-y-3 rounded-2xl border border-[#E7E5E0] bg-white/80 p-3.5 shadow-2xs backdrop-blur-md dark:border-[#232327] dark:bg-[#141417]/80 sm:p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        className={cn(
                                            mono.className,
                                            'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]',
                                        )}>
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3B82F6]/15 text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA]">
                                            {index + 1}
                                        </span>
                                        Category Group
                                    </span>
                                    {groups.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeGroup(group.uid)}
                                            aria-label="Remove category group"
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E7E5E0] text-[#6B6A65] transition-colors hover:border-red-400 hover:text-red-500 dark:border-[#232327] dark:text-[#94938D]">
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>

                                {/* === CATEGORY SELECT === */}
                                <div>
                                    <span className="mb-1.5 block text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                                        Category
                                    </span>
                                    <CategoryDropdown
                                        value={group.categoryId}
                                        options={options}
                                        onChange={(categoryId) => updateGroup(group.uid, { categoryId, itemIds: [] })}
                                    />
                                </div>

                                {/* === ITEMS MULTI-SELECT (only if category chosen) === */}
                                {group.categoryId && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                                                Items{' '}
                                                <span className="font-normal text-[#94938D]">
                                                    ·{' '}
                                                    {group.itemIds.length === 0
                                                        ? `All ${selectedCategory?.name ?? ''} items`
                                                        : `${group.itemIds.length} of ${items.length} selected`}
                                                </span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {group.itemIds.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => clearItems(group.uid)}
                                                        className="text-[11px] font-medium text-[#6B6A65] underline-offset-2 hover:underline dark:text-[#94938D]">
                                                        Reset
                                                    </button>
                                                )}
                                                {items.length > 0 && group.itemIds.length !== items.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() => selectAllItems(group.uid)}
                                                        className="text-[11px] font-medium text-[#2563EB] underline-offset-2 hover:underline dark:text-[#60A5FA]">
                                                        Select all
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {items.length === 0 ? (
                                            <p className="rounded-xl border border-dashed border-[#E7E5E0] bg-black/[0.02] px-3 py-2 text-xs text-[#94938D] dark:border-[#232327] dark:bg-white/[0.02]">
                                                No items in this category yet.
                                            </p>
                                        ) : (
                                            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-[#E7E5E0] bg-black/[0.02] p-2 dark:border-[#232327] dark:bg-white/[0.02]">
                                                {items.map((item) => {
                                                    const active = group.itemIds.includes(item.id);
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => toggleItem(group.uid, item.id)}
                                                            aria-pressed={active}
                                                            className={cn(
                                                                'inline-flex max-w-full items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                                                                active
                                                                    ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                                                    : 'border-[#E7E5E0] bg-white text-[#6B6A65] hover:border-[#3B82F6]/30 dark:border-[#232327] dark:bg-[#141417] dark:text-[#94938D]',
                                                            )}>
                                                            <span className="truncate">{item.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {group.itemIds.length === 0 && items.length > 0 && (
                                            <p className="text-[11px] text-[#94938D]">
                                                Leave unselected to discount all items in this category.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <SecondaryButton
                        type="button"
                        size="sm"
                        onClick={addGroup}
                        disabled={availableCategories('__new__').length === 0}
                        className="w-full justify-center">
                        <Plus size={14} strokeWidth={2.4} className="mr-1.5" />
                        Add another category
                    </SecondaryButton>
                </div>
            )}
        </div>
    );
}

function ScopeButton({
    active,
    onClick,
    icon,
    label,
    description,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    description: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-center transition-colors',
                active
                    ? 'border border-[#3B82F6]/25 bg-white text-[#2563EB] shadow-xs dark:border-[#3B82F6]/30 dark:bg-[#1A1A1F] dark:text-[#93C5FD]'
                    : 'text-[#6B6A65] hover:bg-black/[0.03] dark:text-[#94938D] dark:hover:bg-white/[0.04]',
            )}>
            <span className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                {icon}
                {label}
            </span>
            <span className="text-[11px] font-normal opacity-75">{description}</span>
        </button>
    );
}

function CategoryDropdown({
    value,
    options,
    onChange,
}: {
    value: string;
    options: MenuCategoryWithItemsResponse[];
    onChange: (id: string) => void;
}) {
    const selected = options.find((o) => o.id === value);

    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-[#E7E5E0] bg-white px-3 pr-9 text-xs text-[#0A0A0C] outline-none transition-colors hover:border-black/20 focus-visible:border-[#3B82F6]/60 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] sm:text-sm">
                <option value="" disabled>
                    {options.length === 0 ? 'No categories available' : 'Select a category…'}
                </option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6A65] dark:text-[#94938D]">
                ▾
            </span>
            {!selected && value === '' && options.length === 0 && (
                <p className="mt-1 text-[11px] text-[#94938D]">Create categories in Menu first.</p>
            )}
        </div>
    );
}
