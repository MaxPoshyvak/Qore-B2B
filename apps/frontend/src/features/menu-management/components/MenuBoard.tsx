'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { getErrorMessage, type MenuCategoryWithItemsResponse, type MenuItemResponse } from '@my-app/types';

import { useTranslations } from 'next-intl';

import { useDeleteCategory, useGetCategories } from '@/entities/menu/hooks/useCategories';
import { useDeleteMenuItem } from '@/entities/menu/hooks/useMenuItems';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { EASE } from '@/shared/config/animations';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
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

    return (
        <>
            {categoryList.length === 0 ? (
                <MenuEmptyState onAddCategory={() => onCreateCategoryOpenChange(true)} />
            ) : (
                <motion.div layout className="flex flex-col gap-6">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {categoryList.map((category) => (
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
