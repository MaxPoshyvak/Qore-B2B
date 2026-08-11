'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    UpdateMenuItemSchema,
    getErrorMessage,
    type MenuItemResponse,
    type UpdateMenuItemDTO,
} from '@my-app/types';

import { useUpdateMenuItem } from '@/entities/menu/hooks/useMenuItems';
import { AuthInput } from '@/shared/ui/AuthInput';
import { FormTextarea, FormToggle } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { humanizePriceError } from '../lib/humanize-price-error';
import { FormRootError } from './FormRootError';

type EditMenuItemFormProps = {
    item: MenuItemResponse | null;
    onClose: () => void;
};

export function EditMenuItemForm({ item, onClose }: EditMenuItemFormProps) {
    const { mutateAsync: updateMenuItem } = useUpdateMenuItem();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<UpdateMenuItemDTO>({
        resolver: zodResolver(UpdateMenuItemSchema),
        defaultValues: { name: '', description: '', isAvailable: true },
    });

    useEffect(() => {
        if (!item) return;
        reset({
            name: item.name,
            // Prices arrive as strings (Prisma `Decimal`), the DTO expects a number.
            price: Number.parseFloat(item.price),
            description: item.description ?? '',
            // The read model exposes `isActive`; the write contract uses `isAvailable`.
            isAvailable: item.isActive,
        });
    }, [item, reset]);

    async function onSubmit(values: UpdateMenuItemDTO) {
        if (!item) return;

        try {
            await updateMenuItem({ id: item.id, dto: values });
            onClose();
        } catch (error) {
            setError('root', { message: getErrorMessage(error) });
        }
    }

    return (
        <Modal open={!!item} onClose={onClose} title="Edit dish" description={item?.name}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="edit-item-name"
                    label="Dish name"
                    placeholder="e.g. Flat White"
                    error={errors.name?.message}
                    autoFocus
                    {...register('name')}
                />

                <AuthInput
                    id="edit-item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    label="Price"
                    placeholder="0.00"
                    error={humanizePriceError(errors.price?.message)}
                    {...register('price', { valueAsNumber: true })}
                />

                <FormTextarea
                    id="edit-item-description"
                    label="Description (optional)"
                    placeholder="Double shot, silky microfoam…"
                    rows={3}
                    error={errors.description?.message}
                    {...register('description')}
                />

                <FormToggle
                    label="Available"
                    description="Hide it instantly when you run out."
                    {...register('isAvailable')}
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
