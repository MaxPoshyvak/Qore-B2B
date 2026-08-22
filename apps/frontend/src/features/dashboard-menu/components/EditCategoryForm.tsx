'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    UpdateCategorySchema,
    getErrorMessage,
    type MenuCategoryResponse,
    type UpdateCategoryDTO,
} from '@my-app/types';

import { useUpdateCategory } from '@/entities/menu/hooks/useCategories';
import { AuthInput } from '@/shared/ui/AuthInput';
import { Modal } from '@/shared/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { FormRootError } from './FormRootError';

type EditCategoryFormProps = {
    category: MenuCategoryResponse | null;
    onClose: () => void;
};

export function EditCategoryForm({ category, onClose }: EditCategoryFormProps) {
    const { mutateAsync: updateCategory } = useUpdateCategory();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<UpdateCategoryDTO>({
        resolver: zodResolver(UpdateCategorySchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (category) reset({ name: category.name });
    }, [category, reset]);

    async function onSubmit(values: UpdateCategoryDTO) {
        if (!category) return;

        try {
            await updateCategory({ id: category.id, dto: { name: values.name } });
            onClose();
        } catch (error) {
            setError('root', { message: getErrorMessage(error) });
        }
    }

    return (
        <Modal open={!!category} onClose={onClose} title="Rename category">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="edit-category-name"
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
                        Save changes
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
