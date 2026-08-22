'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    CreateMenuItemSchema,
    getErrorMessage,
    type CreateMenuItemDTO,
    type CreateMenuItemInput,
} from '@my-app/types';

import { useCreateMenuItem } from '@/entities/menu/hooks/useMenuItems';
import { AuthInput } from '@/shared/ui/AuthInput';
import { FormTextarea, FormToggle } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { humanizePriceError } from '../lib/humanize-price-error';
import { FormRootError } from './FormRootError';

type CreateMenuItemFormProps = {
    /** Category the new dish belongs to; `null` keeps the modal closed. */
    category: { id: string; name: string } | null;
    tenantId: string;
    onClose: () => void;
};

export function CreateMenuItemForm({ category, tenantId, onClose }: CreateMenuItemFormProps) {
    const { mutateAsync: createMenuItem } = useCreateMenuItem();

    /*
     * `CreateMenuItemSchema` declares `isAvailable` with `.default(true)`, so the
     * schema's input and output types differ. `zodResolver` is typed
     * `Resolver<z.input, Context, z.output>`, hence the explicit generics.
     */
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CreateMenuItemInput, unknown, CreateMenuItemDTO>({
        resolver: zodResolver(CreateMenuItemSchema),
        defaultValues: { name: '', description: '', categoryId: '', tenantId, isAvailable: true },
    });

    useEffect(() => {
        if (!category) return;
        reset({
            name: '',
            price: undefined,
            description: '',
            categoryId: category.id,
            tenantId,
            isAvailable: true,
        });
    }, [category, tenantId, reset]);

    async function onSubmit(values: CreateMenuItemDTO) {
        try {
            await createMenuItem({
                ...values,
                description: values.description?.trim() ? values.description : undefined,
            });
            onClose();
        } catch (error) {
            setError('root', { message: getErrorMessage(error) });
        }
    }

    return (
        <Modal
            open={!!category}
            onClose={onClose}
            title="New dish"
            description={category ? `Adding to “${category.name}”` : undefined}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="item-name"
                    label="Dish name"
                    placeholder="e.g. Flat White"
                    error={errors.name?.message}
                    autoFocus
                    {...register('name')}
                />

                <AuthInput
                    id="item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    label="Price"
                    placeholder="0.00"
                    error={humanizePriceError(errors.price?.message)}
                    {...register('price', { valueAsNumber: true })}
                />

                <FormTextarea
                    id="item-description"
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
                        Add dish
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
