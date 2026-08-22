'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';

import {
    createTableSchema,
    updateTableSchema,
    type CreateTableDto,
    type UpdateTableDto,
} from '@my-app/types';
import { type Table } from '@my-app/database';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/shadcn/Input';
import { FormToggle } from '@/shared/ui/FormControls';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { EASE } from '@/shared/config/animations';

import { useCreateTable } from '../hooks/useCreateTable';
import { useUpdateTable } from '../hooks/useUpdateTable';

type FormValues = {
    name: string;
    capacity: number;
    isActive: boolean;
};

type TableFormModalProps = {
    open: boolean;
    onClose: () => void;
    slug: string;
    /** When provided the modal edits this table, otherwise it creates a new one. */
    table?: Table | null;
};

export function TableFormModal({ open, onClose, slug, table }: TableFormModalProps) {
    const isEdit = Boolean(table);
    const schema = isEdit ? updateTableSchema : createTableSchema;

    const createMutation = useCreateTable(slug);
    const updateMutation = useUpdateTable(slug);
    const isPending = createMutation.isPending || updateMutation.isPending;

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        mode: 'onTouched',
        defaultValues: {
            name: '',
            capacity: 4,
            isActive: true,
        },
    });

    useEffect(() => {
        if (!open) return;
        reset(
            table
                ? { name: table.name, capacity: table.capacity, isActive: table.isActive }
                : { name: '', capacity: 4, isActive: true },
        );
    }, [open, table, reset]);

    async function onSubmit(values: FormValues) {
        try {
            if (isEdit && table) {
                await updateMutation.mutateAsync({
                    tableId: table.id,
                    dto: values as UpdateTableDto,
                });
            } else {
                await createMutation.mutateAsync(values as CreateTableDto);
            }
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            if (/already exists/i.test(message)) {
                setError('name', { message: 'A table with this name already exists' });
            } else {
                setError('root', { message });
            }
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit table' : 'Add table'}
            description={
                isEdit
                    ? 'Update the details for this table.'
                    : 'Give your table a name and seating capacity.'
            }>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                        Table name
                    </span>
                    <Input
                        type="text"
                        placeholder="e.g. Window 1"
                        className={errors.name ? 'border-red-400/70' : ''}
                        {...register('name')}
                    />
                    {errors.name?.message && (
                        <span className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                            <AlertCircle size={13} className="shrink-0" />
                            {errors.name.message}
                        </span>
                    )}
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                        Capacity (seats)
                    </span>
                    <Input
                        type="number"
                        min={1}
                        max={50}
                        className="w-28"
                        {...register('capacity', { valueAsNumber: true })}
                    />
                </label>

                <FormToggle
                    label="Active"
                    description="Inactive tables cannot be opened by guests via QR."
                    {...register('isActive')}
                />

                {errors.root && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-500">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                <div className="mt-2 flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={onClose} disabled={isPending}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" loading={isPending} icon={isPending ? undefined : undefined}>
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        {isEdit ? 'Save changes' : 'Create table'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
