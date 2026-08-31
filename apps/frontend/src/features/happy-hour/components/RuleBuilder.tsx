'use client';

import { Layers, Plus, Trash2, UtensilsCrossed } from 'lucide-react';

import type { MenuCategoryWithItemsResponse } from '@my-app/types';

import { SecondaryButton } from '@/shared/ui/PrimaryButton';
import { cn } from '@/shared/lib/utils';

import type { RuleBuilderGroup } from '../hooks/useRuleBuilder';
import { useRuleBuilder } from '../hooks/useRuleBuilder';

/**
 * Радіо-група "scope" дозволяє обрати, до чого застосовується правило:
 *  - `ENTIRE_MENU` — без жодних фільтрів (порожні `categoryIds` / `itemIds`).
 *  - `SPECIFIC`    — динамічний список груп "категорія + підмножина позицій".
 */
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
 * Динамічний конструктор цілей для Happy Hour правила.
 *
 * UX:
 *  1. Тогл "Entire menu" vs "Specific categories & items".
 *  2. У режимі "Specific" — масив груп. Кожна група = одна категорія + (опційно) набір позицій.
 *  3. Якщо в групі не обрано жодної позиції — правило діє на ВСЮ категорію.
 *     Якщо обрано конкретні — тільки на них.
 *  4. Кнопка "+ Add another category" додає нову порожню групу.
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

    /**
     * Додає/прибирає конкретну позицію меню в межах однієї групи.
     * Якщо користувач знімає останню обрану позицію — `itemIds` стає порожнім,
     * і правило починає діяти на ВСЮ категорію (див. payload у `useRuleBuilder`).
     */
    function toggleItem(uid: string, itemId: string) {
        const group = groups.find((g) => g.uid === uid);
        if (!group) return;

        const nextItems = group.itemIds.includes(itemId)
            ? group.itemIds.filter((id) => id !== itemId)
            : [...group.itemIds, itemId];

        updateGroup(uid, { itemIds: nextItems });
    }

    /**
     * Додає ВСІ позиції поточної категорії одним кліком — зручний shortcut,
     * коли власник хоче швидко "підсвітити" цілу категорію без кліків по кожному пункту.
     */
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
                className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E7E5E0] bg-white/60 p-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
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
                        // Додаємо першу порожню групу, щоб UX одразу підказав "додай категорію".
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
                                className="space-y-3 rounded-2xl border border-[#E7E5E0] bg-white/60 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B6A65] dark:text-[#94938D]">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3B82F6]/15 text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA]">
                                            {index + 1}
                                        </span>
                                        Category group
                                    </span>
                                    {groups.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeGroup(group.uid)}
                                            aria-label="Remove category group"
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#6B6A65] transition-colors hover:border-red-500/40 hover:text-red-500 dark:border-white/10 dark:text-[#94938D]">
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* === CATEGORY SELECT === */}
                                <div>
                                    <span className="mb-1.5 block text-[13px] font-medium text-[#6B6A65] dark:text-[#94938D]">
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
                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between gap-2">
                                            <span className="text-[13px] font-medium text-[#6B6A65] dark:text-[#94938D]">
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
                                                        className="text-[12px] font-medium text-[#6B6A65] underline-offset-2 hover:underline dark:text-[#94938D]">
                                                        Reset
                                                    </button>
                                                )}
                                                {items.length > 0 && group.itemIds.length !== items.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() => selectAllItems(group.uid)}
                                                        className="text-[12px] font-medium text-[#2563EB] underline-offset-2 hover:underline dark:text-[#60A5FA]">
                                                        Select all
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {items.length === 0 ? (
                                            <p className="rounded-xl border border-dashed border-[#E7E5E0] bg-white/40 px-3 py-2.5 text-xs text-[#94938D] dark:border-white/10 dark:bg-white/5">
                                                No items in this category yet.
                                            </p>
                                        ) : (
                                            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-[#E7E5E0] bg-white/40 p-2.5 dark:border-white/10 dark:bg-white/5">
                                                {items.map((item) => {
                                                    const active = group.itemIds.includes(item.id);
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => toggleItem(group.uid, item.id)}
                                                            aria-pressed={active}
                                                            className={cn(
                                                                'rounded-full border px-2.5 py-1 text-[12.5px] font-medium transition-colors',
                                                                active
                                                                    ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                                                    : 'border-[#E7E5E0] bg-white/60 text-[#6B6A65] hover:border-[#3B82F6]/30 dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                                                            )}>
                                                            {item.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {group.itemIds.length === 0 && items.length > 0 && (
                                            <p className="mt-1.5 text-[11.5px] text-[#94938D]">
                                                Leave empty to discount the entire category.
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
                        className="w-full">
                        <Plus size={14} strokeWidth={2.4} className="mr-1.5" />
                        Add another category
                    </SecondaryButton>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

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
                'flex flex-col items-center justify-center text-center gap-1 rounded-xl px-3 py-2.5 transition-colors',
                active
                    ? 'bg-[#3B82F6]/10 text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#93C5FD]'
                    : 'text-[#6B6A65] hover:bg-black/[0.03] dark:text-[#94938D] dark:hover:bg-white/[0.04]',
            )}>
            <span className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold">
                {icon}
                {label}
            </span>
            <span className="text-[11.5px] font-normal opacity-80">{description}</span>
        </button>
    );
}

/**
 * Простий комбобокс для вибору ОДНІЄЄ категорії.
 * Імплементовано локально (без зовнішніх бібліотек), щоб не залежати від
 * shadcn/Select, який працює з рядковими значеннями і не дуже підходить
 * для "placeholder, поки нічого не вибрано".
 */
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
                className="h-10 w-full appearance-none rounded-xl border border-[#E7E5E0] bg-white px-3 pr-9 text-sm text-[#0A0A0C] outline-none transition-colors hover:border-black/20 focus-visible:border-[#3B82F6]/60 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2]">
                <option value="" disabled>
                    {options.length === 0 ? 'No categories available' : 'Select a category…'}
                </option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6A65] dark:text-[#94938D]">
                ▾
            </span>
            {!selected && value === '' && options.length === 0 && (
                <p className="mt-1 text-[11.5px] text-[#94938D]">Create categories in Menu first.</p>
            )}
        </div>
    );
}
