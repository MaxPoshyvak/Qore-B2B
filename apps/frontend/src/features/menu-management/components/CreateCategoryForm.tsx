'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategorySchema, getErrorMessage, type CreateCategoryDTO } from '@my-app/types';

import { useCreateCategory } from '@/entities/menu/hooks/useCategories';
import { AuthInput } from '@/shared/ui/AuthInput';
import { Modal } from '@/shared/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { FormRootError } from './FormRootError';

type CreateCategoryFormProps = {
    open: boolean;
    tenantId: string;
    onClose: () => void;
};

export function CreateCategoryForm({ open, tenantId, onClose }: CreateCategoryFormProps) {
    const { mutateAsync: createCategory } = useCreateCategory();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CreateCategoryDTO>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: { name: '', tenantId },
    });

    // `tenantId` is resolved asynchronously by the board, so keep it in sync.
    useEffect(() => {
        if (open) reset({ name: '', tenantId });
    }, [open, tenantId, reset]);

    async function onSubmit(values: CreateCategoryDTO) {
        try {
            await createCategory(values);
            onClose();
        } catch (error) {
            setError('root', { message: getErrorMessage(error) });
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New category"
            description="Group related dishes so guests can scan your menu quickly.">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="category-name"
                    label="Category name"
                    placeholder="e.g. Breakfast"
                    error={errors.name?.message}
                    autoFocus
                    {...register('name')}
                />

                <FormRootError message={errors.root?.message} />

                <div className="mt-1 flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" loading={isSubmitting}>
                        Create category
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
