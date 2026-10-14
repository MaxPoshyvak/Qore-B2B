'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Search, X } from 'lucide-react';
import { getErrorMessage, type MenuCategoryWithItemsResponse, type MenuItemResponse } from '@my-app/types';

import { useTranslations } from 'next-intl';

import { useDeleteCategory, useGetCategories } from '@/entities/menu/hooks/useCategories';
import { useDeleteMenuItem } from '@/entities/menu/hooks/useMenuItems';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { EASE } from '@/shared/config/animations';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { cn } from '@/shared/lib/utils';
import { CategorySection } from './CategorySection';
import { CreateCategoryForm } from './CreateCategoryForm';
import { EditCategoryForm } from './EditCategoryForm';
import { MenuBoardSkeleton } from './MenuBoardSkeleton';
import { MenuEmptyState } from './MenuEmptyState';
import { MenuItemForm } from './MenuItemForm';

type MenuBoardProps = {
    slug: string;
    /** Controlled by the page so its header button can open the same modal. */
    createCategoryOpen: boolean;
    onCreateCategoryOpenChange: (open: boolean) => void;
};

function BoardError({ message }: { message: string }) {
    const t = useTranslations('menuManagement');
    return (
        <div className="flex items-start gap-3 rounded-3xl border border-red-400/30 bg-red-500/5 p-6">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
                <p className="text-sm font-semibold text-red-500">{t('cantLoadMenu')}</p>
                <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">{message}</p>
            </div>
        </div>
    );
}

export function MenuBoard({ slug, createCategoryOpen, onCreateCategoryOpenChange }: MenuBoardProps) {
    const t = useTranslations('menuManagement');
    const {
        data: tenantResponse,
        isLoading: isTenantLoading,
        isError: isTenantError,
        error: tenantError,
    } = useGetTenantBySlug(slug);

    const tenantId = tenantResponse?.data.id ?? '';

    const {
        data: categories,
        isLoading: isCategoriesLoading,
        isError: isCategoriesError,
        error: categoriesError,
    } = useGetCategories(tenantId);

    const { mutateAsync: deleteMenuItem, isPending: isDeletingItem } = useDeleteMenuItem();
    const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory();

    const [addItemCategory, setAddItemCategory] = useState<MenuCategoryWithItemsResponse | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItemResponse | null>(null);
    const [deletingItem, setDeletingItem] = useState<MenuItemResponse | null>(null);
    const [editingCategory, setEditingCategory] = useState<MenuCategoryWithItemsResponse | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<MenuCategoryWithItemsResponse | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDeleteItem() {
        if (!deletingItem) return;
        setDeleteError(null);

        try {
            await deleteMenuItem(deletingItem.id);
            setDeletingItem(null);
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    }

    async function handleDeleteCategory() {
        if (!deletingCategory) return;
        setDeleteError(null);

        try {
            await deleteCategory(deletingCategory.id);
            setDeletingCategory(null);
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    }

    const [searchQuery, setSearchQuery] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'soldOut'>('all');

    if (isTenantLoading || isCategoriesLoading) return <MenuBoardSkeleton />;
    if (isTenantError) return <BoardError message={getErrorMessage(tenantError)} />;
    if (isCategoriesError) return <BoardError message={getErrorMessage(categoriesError)} />;

    // PRO (and higher) plans unlock the AI dish generator.
    const plan = tenantResponse?.data.subscriptionPlan;
    const isPro = plan === 'pro' || plan === 'business';

    const categoryList = categories ?? [];
    // A category can only be removed once it is empty (the API restricts deletes
    // that would orphan menu items), so surface that up front.
    const blockedByItems = (deletingCategory?.items.length ?? 0) > 0;

    const currency = tenantResponse?.data?.settings?.currency ?? 'USD';

    const allDishes = useMemo(() => {
        return (categories ?? []).flatMap((c) => c.items);
    }, [categories]);

    const totalCount = allDishes.length;
    const availableCount = allDishes.filter((d) => d.isActive).length;
    const soldOutCount = allDishes.filter((d) => !d.isActive).length;

    const filteredCategoryList = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return (categories ?? [])
            .map((cat) => {
                const matchingItems = cat.items.filter((item) => {
                    const matchesQuery =
                        !q ||
                        item.name.toLowerCase().includes(q) ||
                        (item.description && item.description.toLowerCase().includes(q));

                    const matchesAvailability =
                        availabilityFilter === 'all' ||
                        (availabilityFilter === 'available' && item.isActive) ||
                        (availabilityFilter === 'soldOut' && !item.isActive);

                    return matchesQuery && matchesAvailability;
                });

                return {
                    ...cat,
                    items: matchingItems,
                };
            })
            .filter((cat) => {
                if (q || availabilityFilter !== 'all') {
                    return cat.items.length > 0;
                }
                return true;
            });
    }, [categories, searchQuery, availabilityFilter]);

    return (
        <>
            {categoryList.length === 0 ? (
                <MenuEmptyState onAddCategory={() => onCreateCategoryOpenChange(true)} />
            ) : (
                <motion.div layout className="flex flex-col gap-6">
                    {/* Search and Availability Bar */}
                    <div className="flex flex-col gap-3 rounded-3xl border border-[#E7E5E0] bg-white p-4 shadow-sm dark:border-[#232327] dark:bg-[#121215] sm:flex-row sm:items-center sm:justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6A65] dark:text-[#94938D]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search dishes by name or description..."
                                className="w-full rounded-2xl border border-[#E7E5E0] bg-[#FAFAF8] py-2 pl-10 pr-9 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#6B6A65] focus:border-[#3B82F6] focus:outline-none dark:border-[#232327] dark:bg-white/[0.03] dark:text-[#F5F4F2] dark:placeholder:text-[#94938D]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white cursor-pointer">
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* Filter Chips */}
                        <div className="flex items-center gap-1.5 rounded-2xl border border-[#E7E5E0] bg-[#FAFAF8] p-1 text-xs dark:border-[#232327] dark:bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={() => setAvailabilityFilter('all')}
                                className={cn(
                                    'rounded-xl px-3 py-1.5 font-medium transition-colors cursor-pointer',
                                    availabilityFilter === 'all'
                                        ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#232327] dark:text-white'
                                        : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white',
                                )}>
                                All ({totalCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAvailabilityFilter('available')}
                                className={cn(
                                    'rounded-xl px-3 py-1.5 font-medium transition-colors cursor-pointer',
                                    availabilityFilter === 'available'
                                        ? 'bg-white text-emerald-600 shadow-sm dark:bg-[#232327] dark:text-emerald-400'
                                        : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white',
                                )}>
                                Available ({availableCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAvailabilityFilter('soldOut')}
                                className={cn(
                                    'rounded-xl px-3 py-1.5 font-medium transition-colors cursor-pointer',
                                    availabilityFilter === 'soldOut'
                                        ? 'bg-white text-red-600 shadow-sm dark:bg-[#232327] dark:text-red-400'
                                        : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white',
                                )}>
                                Sold Out / 86 ({soldOutCount})
                            </button>
                        </div>
                    </div>

                    {filteredCategoryList.length === 0 ? (
                        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#E7E5E0] bg-white p-8 text-center dark:border-[#232327] dark:bg-[#121215]">
                            <Search size={28} className="text-[#94938D]" />
                            <h4 className="mt-3 text-base font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                No dishes match your filter
                            </h4>
                            <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                We couldn't find any dishes matching "{searchQuery}".
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setAvailabilityFilter('all');
                                }}
                                className="mt-4 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] px-4 py-2 text-xs font-semibold text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] cursor-pointer">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout" initial={false}>
                            {filteredCategoryList.map((category) => (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    currency={currency}
                                    onAddItem={setAddItemCategory}
                                    onEditItem={setEditingItem}
                                    onDeleteItem={setDeletingItem}
                                    onRenameCategory={setEditingCategory}
                                    onDeleteCategory={setDeletingCategory}
                                />
                            ))}
                        </AnimatePresence>
                    )}

                    <motion.button
                        layout
                        type="button"
                        onClick={() => onCreateCategoryOpenChange(true)}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-black/15 py-6 text-sm font-medium text-[#6B6A65] transition-colors hover:border-[#3B82F6]/50 hover:text-[#3B82F6] dark:border-white/15 dark:text-[#94938D] dark:hover:border-[#3B82F6]/50">
                        {t('addAnotherCategory')}
                    </motion.button>
                </motion.div>
            )}

            <CreateCategoryForm
                open={createCategoryOpen}
                tenantId={tenantId}
                onClose={() => onCreateCategoryOpenChange(false)}
            />

            <EditCategoryForm category={editingCategory} onClose={() => setEditingCategory(null)} />

            {/* Створення і редагування страви — один і той самий розширений
                білдер. Тримаємо два інстанси, щоб стан форм не перетікав. */}
            <MenuItemForm
                open={!!addItemCategory}
                category={addItemCategory}
                tenantId={tenantId}
                isPro={isPro}
                onClose={() => setAddItemCategory(null)}
            />

            <MenuItemForm
                open={!!editingItem}
                initialData={editingItem}
                tenantId={tenantId}
                isPro={isPro}
                onClose={() => setEditingItem(null)}
            />

            <ConfirmDialog
                open={!!deletingItem}
                title={t('deleteDishTitle')}
                description={t('deleteDishDesc', { name: deletingItem?.name ?? '' })}
                confirmLabel={t('delete')}
                loading={isDeletingItem}
                error={deleteError}
                onConfirm={handleDeleteItem}
                onClose={() => {
                    setDeletingItem(null);
                    setDeleteError(null);
                }}
            />

            <ConfirmDialog
                open={!!deletingCategory}
                title={t('deleteCategoryTitle')}
                description={
                    blockedByItems
                        ? t('deleteCategoryBlocked', {
                              name: deletingCategory?.name ?? '',
                              count: deletingCategory?.items.length ?? 0,
                          })
                        : t('deleteCategoryDesc', { name: deletingCategory?.name ?? '' })
                }
                confirmLabel={t('delete')}
                confirmDisabled={blockedByItems}
                loading={isDeletingCategory}
                error={deleteError}
                onConfirm={handleDeleteCategory}
                onClose={() => {
                    setDeletingCategory(null);
                    setDeleteError(null);
                }}
            />
        </>
    );
}
