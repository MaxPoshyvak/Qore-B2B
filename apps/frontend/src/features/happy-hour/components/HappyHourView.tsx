'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';

import { getErrorMessage, type CreateHappyHourDto, type HappyHourRuleResponse, type UpdateHappyHourDto } from '@my-app/types';

import { toast } from '@/shared/ui/Toaster';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { cn } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { useGetCategories } from '@/entities/menu/hooks/useCategories';

import {
    useCreateHappyHour,
    useDeleteHappyHour,
    useHappyHours,
    useUpdateHappyHour,
} from '../hooks/useHappyHour';
import { HappyHourFormModal } from './HappyHourFormModal';
import { HappyHourRuleCard } from './HappyHourRuleCard';

type HappyHourViewProps = {
    slug: string;
};

export function HappyHourView({ slug }: HappyHourViewProps) {
    const { data: tenant } = useGetTenantBySlug(slug);
    const tenantId = tenant?.data.id;

    const { data: rules = [], isLoading } = useHappyHours(tenantId);
    const createMut = useCreateHappyHour(tenantId ?? '');
    const updateMut = useUpdateHappyHour(tenantId ?? '');
    const deleteMut = useDeleteHappyHour(tenantId ?? '');

    const queryClient = useQueryClient();
    const rulesQueryKey = ['happy-hour', 'rules', tenantId] as const;

    const { data: categories = [] } = useGetCategories(tenantId ?? '');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<HappyHourRuleResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<HappyHourRuleResponse | null>(null);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(rule: HappyHourRuleResponse) {
        setEditing(rule);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditing(null);
    }

    function handleSubmit(
        values: CreateHappyHourDto & { isActive?: boolean },
        target: HappyHourRuleResponse | null,
    ) {
        if (target) {
            const { isActive: _ignored, ...rest } = values;
            const data: UpdateHappyHourDto = { ...rest, isActive: values.isActive };
            updateMut.mutate({ id: target.id, data }, { onSuccess: closeModal });
        } else {
            createMut.mutate(values, { onSuccess: closeModal });
        }
    }

    function onToggleActive(rule: HappyHourRuleResponse) {
        const nextActive = !rule.isActive;

        const previous = queryClient.getQueryData<HappyHourRuleResponse[]>(rulesQueryKey);
        queryClient.setQueryData<HappyHourRuleResponse[]>(rulesQueryKey, (old) =>
            old?.map((r) => (r.id === rule.id ? { ...r, isActive: nextActive } : r)),
        );

        updateMut.mutate(
            { id: rule.id, data: { isActive: nextActive } },
            {
                onError: (_err) => {
                    queryClient.setQueryData(rulesQueryKey, previous);
                    toast.error(getErrorMessage(_err));
                },
            },
        );
    }

    function onConfirmDelete() {
        if (!deleteTarget) return;
        deleteMut.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const isPending = createMut.isPending || updateMut.isPending;

    return (
        <div>
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 px-3 py-1 text-xs font-medium text-[#6D28D9] dark:text-[#C4B5FD]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                        Happy Hour
                    </span>
                    <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                        Promotions that{' '}
                        <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                            fill the room
                        </span>
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Run time-boxed discounts on specific days and dishes to boost your off-peak sales.
                    </p>
                </div>

                <PrimaryButton
                    type="button"
                    onClick={openCreate}
                    icon={<Plus size={17} strokeWidth={2.4} />}>
                    New Rule
                </PrimaryButton>
            </motion.header>

            <div className="mt-8">
                {isLoading ? (
                    <div className="space-y-3">
                        {[0, 1].map((i) => (
                            <div
                                key={i}
                                className="h-28 animate-pulse rounded-2xl border border-[#E7E5E0] bg-white/60 dark:border-[#232327] dark:bg-[#141417]/60"
                            />
                        ))}
                    </div>
                ) : rules.length === 0 ? (
                    <EmptyState onAction={openCreate} />
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence initial={false}>
                            {rules.map((rule) => (
                                <HappyHourRuleCard
                                    key={rule.id}
                                    rule={rule}
                                    onToggleActive={onToggleActive}
                                    onEdit={openEdit}
                                    onDelete={(r) => setDeleteTarget(r)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <HappyHourFormModal
                open={modalOpen}
                editing={editing}
                categories={categories}
                onClose={closeModal}
                onSubmit={handleSubmit}
                isPending={isPending}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete Happy Hour rule"
                description="This promotion will be permanently removed. This action cannot be undone."
                confirmLabel="Delete rule"
                loading={deleteMut.isPending}
                onConfirm={onConfirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    );
}

function EmptyState({ onAction }: { onAction: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E7E5E0] bg-white/70 px-6 py-16 text-center backdrop-blur-xl dark:border-[#232327] dark:bg-[#141417]/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/15 to-[#8B5CF6]/15 text-[#6D28D9] dark:text-[#C4B5FD]">
                <Sparkles size={28} />
            </div>
            <h3 className="mt-5 text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                Boost your off-peak sales
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                Create your first Happy Hour to drive traffic when it&apos;s quiet — set the days, hours and discount
                in seconds.
            </p>
            <PrimaryButton
                type="button"
                onClick={onAction}
                className="mt-6"
                icon={<Plus size={17} strokeWidth={2.4} />}>
                Create your first Happy Hour
            </PrimaryButton>
        </motion.div>
    );
}
