'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import {
    CreateMenuItemSchema,
    getErrorMessage,
    type CreateMenuItemDTO,
    type CreateMenuItemInput,
    type GenerateDishOutput,
    type MenuItemResponse,
} from '@my-app/types';

import { useCreateMenuItem, useUpdateMenuItem } from '@/entities/menu/hooks/useMenuItems';
import { useGetCategories } from '@/entities/menu/hooks/useCategories';
import { AiDishGeneratorBar } from '../ui/AiDishGeneratorBar';
import { ALLERGENS, DIETARY_TAGS, normalizeAllergens, normalizeDietary } from '../lib/menu-constants';
import { AuthInput } from '@/shared/ui/AuthInput';
import { ImageUpload } from '@/shared/ui/ImageUpload';
import { FormTextarea } from '@/shared/ui/FormControls';
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch';
import { Modal } from '@/shared/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/shared/ui/PrimaryButton';
import { cn } from '@/shared/lib/utils';
import { toStringArray } from '@/shared/lib/menu-attributes';
import { humanizePriceError } from '../lib/humanize-price-error';
import { FormRootError } from './FormRootError';

// Повні довідники — критичні для майбутнього AI-консультанта, який має вміти
// відповідати на "що у вас без глютену?" без ручного тегування кожної страви.
// Тепер живуть у `lib/menu-constants`, щоб бар AI-генератора ділився ними без
// циклічного імпорту між компонентами.

const TABS = [
    { id: 'general', label: 'General' },
    { id: 'modifiers', label: 'Modifiers' },
    { id: 'attributes', label: 'Attributes' },
] as const;

type TabId = (typeof TABS)[number]['id'];

type MenuItemFormValues = CreateMenuItemInput;

/**
 * Розкладає існуючу страву у `defaultValues` форми.
 *
 * Тут живуть усі розбіжності між read- і write-контрактами:
 * `price` приходить рядком (Prisma `Decimal`), доступність називається
 * `isActive` у відповіді та `isAvailable` у DTO, а `priceAdjustment` опцій —
 * теж рядок. Без цього маппінгу форма редагування відкривалася порожньою.
 *
 * Тип — `DefaultValues<…>` (а не самі значення), бо для нової страви `price`
 * лишається `undefined`: інпут має бути порожнім, а не показувати 0.
 */
function buildDefaultValues(
    initialData: MenuItemResponse | null | undefined,
    categoryId: string,
    tenantId: string,
): DefaultValues<MenuItemFormValues> {
    if (!initialData) {
        return {
            name: '',
            price: undefined,
            description: '',
            categoryId,
            tenantId,
            isAvailable: true,
            imageUrl: null,
            allergens: [],
            tags: [],
            modifiers: [],
        };
    }

    return {
        name: initialData.name,
        price: Number.parseFloat(initialData.price),
        description: initialData.description ?? '',
        categoryId: initialData.categoryId,
        tenantId: initialData.tenantId,
        isAvailable: initialData.isActive,
        imageUrl: initialData.imageUrl,
        allergens: toStringArray(initialData.allergens),
        tags: toStringArray(initialData.tags),
        modifiers: (initialData.modifiers ?? []).map((group) => ({
            id: group.id,
            name: group.name,
            minSelections: group.minSelections,
            maxSelections: group.maxSelections,
            options: group.options.map((option) => ({
                id: option.id,
                name: option.name,
                priceAdjustment: Number.parseFloat(option.priceAdjustment),
            })),
        })),
    };
}

type MenuItemFormProps = {
    open: boolean;
    tenantId: string;
    /** Категорія, у яку додається нова страва (режим створення). */
    category?: { id: string; name: string } | null;
    /** Наявна страва — якщо передана, форма працює в режимі редагування. */
    initialData?: MenuItemResponse | null;
    /** Чи має поточний заклад PRO (або вищий) тариф — керує доступом до AI. */
    isPro?: boolean;
    onClose: () => void;
};

/**
 * Єдина розширена форма страви для створення І редагування.
 *
 * Раніше існувала друга, примітивна форма редагування на 4 поля, тож кнопка
 * "Edit" не давала доступу ні до модифікаторів, ні до фото. Тепер обидва
 * сценарії йдуть через цей компонент, а режим визначає `initialData`.
 */
export function MenuItemForm({ open, tenantId, category, initialData, isPro, onClose }: MenuItemFormProps) {
    const { mutateAsync: createMenuItem } = useCreateMenuItem();
    const { mutateAsync: updateMenuItem } = useUpdateMenuItem();
    const { data: categories } = useGetCategories(tenantId);

    const isEdit = !!initialData;
    const [tab, setTab] = useState<TabId>('general');
    const [highlight, setHighlight] = useState(false);

    /*
     * `CreateMenuItemSchema` оголошує поля з `.default(...)`, тому input- та
     * output-типи різняться. `zodResolver` має сигнатуру
     * `Resolver<z.input, Context, z.output>`, звідси явні дженерики.
     */
    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        getValues,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<MenuItemFormValues, unknown, CreateMenuItemDTO>({
        resolver: zodResolver(CreateMenuItemSchema),
        defaultValues: buildDefaultValues(initialData, category?.id ?? '', tenantId),
    });

    // Динамічний масив груп модифікаторів.
    const {
        fields: groups,
        append: appendGroup,
        remove: removeGroup,
        replace: replaceGroups,
    } = useFieldArray({ control, name: 'modifiers' });

    /*
     * Перезаливаємо форму лише коли модалка відкривається (або підмінили
     * страву), а не на кожен рендер: `reset` під час набору тексту скидав би
     * незбережені правки користувача.
     */
    useEffect(() => {
        if (!open) return;
        reset(buildDefaultValues(initialData, category?.id ?? '', tenantId));
        setTab('general');
    }, [open, initialData, category?.id, tenantId, reset]);

    function togglePill(key: 'allergens' | 'tags', value: string) {
        const current = (getValues(key) as string[]) ?? [];
        setValue(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value], {
            shouldDirty: true,
        });
    }

    /** Maps AI modifiers onto the form's write contract (drops `required`). */
    function mapAiModifiers(modifiers: GenerateDishOutput['modifiers']) {
        return modifiers.map((modifier) => ({
            name: modifier.name,
            minSelections: modifier.minSelections,
            maxSelections: modifier.maxSelections,
            options: modifier.options.map((option) => ({
                name: option.name,
                priceAdjustment: option.priceAdjustment,
            })),
        }));
    }

    /**
     * Called by the AI bar once the backend returns a validated draft.
     * Fills the form, highlights the touched fields, and returns to the
     * general tab so the user immediately sees the populated name/description.
     */
    function handleAiDraft(output: GenerateDishOutput) {
        setValue('name', output.name, { shouldDirty: true });
        setValue('description', output.description ?? '', { shouldDirty: true });
        setValue('allergens', normalizeAllergens(output.allergens), { shouldDirty: true });
        setValue('tags', normalizeDietary(output.dietary), { shouldDirty: true });
        replaceGroups(mapAiModifiers(output.modifiers));

        const suggested = output.suggestedCategory.trim().toLowerCase();
        const match = (categories ?? []).find(
            (c) => c.name.toLowerCase() === suggested || c.name.toLowerCase().includes(suggested),
        );
        if (match) setValue('categoryId', match.id, { shouldDirty: true });

        setTab('general');
        setHighlight(true);
        window.setTimeout(() => setHighlight(false), 1200);
    }

    /** Temporary violet glow applied to AI-populated fields. */
    const highlightCls = (active: boolean) =>
        cn(
            'rounded-2xl transition-all duration-700 ease-out',
            active && 'ring-2 ring-[#8B5CF6]/40 bg-[#8B5CF6]/5',
        );

    async function onSubmit(values: CreateMenuItemDTO) {
        try {
            const payload = {
                ...values,
                description: values.description?.trim() ? values.description : undefined,
                // Порожнє поле зберігаємо як NULL, а не як "" — інакше в БД
                // осідає невалідний URL, який потім ламає рендер <img />.
                imageUrl: values.imageUrl?.trim() ? values.imageUrl : null,
            };

            if (initialData) {
                // PATCH не приймає `tenantId`: власника страви змінювати не можна.
                const { tenantId: _tenantId, ...dto } = payload;
                await updateMenuItem({ id: initialData.id, dto });
            } else {
                await createMenuItem(payload);
            }

            onClose();
        } catch (error) {
            setError('root', { message: getErrorMessage(error) });
        }
    }

    const inputCls =
        'w-full rounded-xl border border-[#E7E5E0] bg-white px-3 py-2 text-sm text-[#0A0A0C] outline-none transition-colors placeholder:text-[#A8A6A0] focus:border-[#3B82F6]/60 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] dark:placeholder:text-[#5A5A56]';

    const allergens = watch('allergens') as string[];
    const tags = watch('tags') as string[];
    const imageUrl = watch('imageUrl');

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit dish' : 'New dish'}
            description={
                isEdit ? initialData?.name : category ? `Adding to “${category.name}”` : undefined
            }
            scrollable
            className="max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" noValidate>
                {/* AI-асистент: компактний бар над формою, доступний у всіх вкладках. */}
                <AiDishGeneratorBar
                    isPro={!!isPro}
                    categories={categories ?? []}
                    onPopulate={handleAiDraft}
                    className="mb-6"
                />

                {/* Перемикач вкладок (піл-світч) */}
                <div className="flex gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                tab === t.id
                                    ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1A1A1A] dark:text-[#F5F4F2]'
                                    : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D]',
                            )}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Контент вкладки з анімацією перемикання.
                    `popLayout` (а не `wait`) — щоб вихідна вкладка одразу
                    випадала з потоку: інакше контейнер на мить лишався
                    порожнім і модалка "складалася" перед новою висотою. */}
                <div className="mt-6 min-h-0 pb-7">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={tab}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            className="flex flex-col gap-5">
                            {tab === 'general' && (
                                <>
                                    {/* Dish photo: drag-and-drop upload straight to Cloudinary.
                                        The `secure_url` is written back into `imageUrl`. */}
                                    <div>
                                        <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                                            Dish photo
                                        </span>
                                        <ImageUpload
                                            value={imageUrl}
                                            folder="qore/menu-items"
                                            onChange={(url) =>
                                                setValue('imageUrl', url ?? null, { shouldDirty: true })
                                            }
                                            className="h-48 w-full"
                                        />
                                        {errors.imageUrl?.message && (
                                            <span className="mt-1.5 block text-xs text-red-500">
                                                {errors.imageUrl.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className={highlightCls(highlight)}>
                                        <AuthInput
                                            id="item-name"
                                            label="Item name"
                                            placeholder="e.g. Flat White"
                                            error={errors.name?.message}
                                            autoFocus
                                            {...register('name')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <AuthInput
                                            id="item-price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            label="Base price"
                                            placeholder="$0.00"
                                            error={humanizePriceError(errors.price?.message)}
                                            {...register('price', { valueAsNumber: true })}
                                        />

                                        <div className="block">
                                            <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                                                Category
                                            </span>
                                            <select {...register('categoryId')} className={cn(inputCls, 'h-[42px]')}>
                                                <option value="" disabled>
                                                    Select a category
                                                </option>
                                                {(categories ?? []).map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.categoryId?.message && (
                                                <span className="mt-1.5 block text-xs text-red-500">
                                                    {errors.categoryId.message}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={highlightCls(highlight)}>
                                        <FormTextarea
                                            id="item-description"
                                            label="Description (optional)"
                                            placeholder="Double shot, silky microfoam…"
                                            rows={3}
                                            error={errors.description?.message}
                                            {...register('description')}
                                        />
                                    </div>

                                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                        <span>
                                            <span className="block text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                Available
                                            </span>
                                            <span className="mt-0.5 block text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                Hide it instantly when you run out.
                                            </span>
                                        </span>
                                        <ToggleSwitch
                                            checked={watch('isAvailable') ?? true}
                                            onChange={(next) => setValue('isAvailable', next, { shouldDirty: true })}
                                        />
                                    </label>
                                </>
                            )}

                            {tab === 'modifiers' && (
                                <div className={highlightCls(highlight)}>
                                <>
                                    {groups.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#E7E5E0] bg-white/40 px-4 py-8 text-center text-sm text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]">
                                            No modifiers yet. Add options like “Size”, “Extra Toppings”, or “Remove
                                            ingredients”.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-5">
                                            {groups.map((group, gi) => (
                                                <ModifierGroupCard
                                                    key={group.id}
                                                    groupIndex={gi}
                                                    register={register}
                                                    control={control}
                                                    errors={errors}
                                                    inputCls={inputCls}
                                                    onRemove={() => removeGroup(gi)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            appendGroup({ name: '', minSelections: 0, maxSelections: 1, options: [] })
                                        }
                                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-3 text-sm font-semibold text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                                        <Plus size={15} />
                                        Add modifier group
                                    </button>
                                </>
                                </div>
                            )}

                            {tab === 'attributes' && (
                                <div className={highlightCls(highlight)}>
                                <>
                                    <PillGroup
                                        title="Allergens"
                                        hint="Flag anything a guest might react to."
                                        values={ALLERGENS}
                                        selected={allergens}
                                        onToggle={(value) => togglePill('allergens', value)}
                                    />

                                    <PillGroup
                                        title="Dietary tags"
                                        hint="Used for guest filters and search."
                                        values={DIETARY_TAGS}
                                        selected={tags}
                                        onToggle={(value) => togglePill('tags', value)}
                                    />
                                </>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <FormRootError message={errors.root?.message} />

                {/* Липкий футер з діями */}
                <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex items-center justify-end gap-2 border-t border-[#E7E5E0] bg-white/80 px-6 py-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#121215]/80">
                    <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" loading={isSubmitting}>
                        {isEdit ? 'Save changes' : 'Save Item'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

/* -------------------------------------------------------------------------- */
/*  Pill toggles (алергени / дієтичні теги)                                   */
/* -------------------------------------------------------------------------- */

type PillGroupProps = {
    title: string;
    hint: string;
    values: readonly string[];
    selected: string[] | undefined;
    onToggle: (value: string) => void;
};

function PillGroup({ title, hint, values, selected, onToggle }: PillGroupProps) {
    return (
        <div>
            <span className="block text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{title}</span>
            <span className="mt-0.5 block text-xs text-[#6B6A65] dark:text-[#94938D]">{hint}</span>
            <div className="mt-3 flex flex-wrap gap-2">
                {values.map((value) => {
                    const active = selected?.includes(value) ?? false;
                    return (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onToggle(value)}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                                active
                                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                                    : 'border-black/10 text-[#6B6A65] hover:border-blue-500/30 hover:text-blue-500 dark:border-white/10 dark:text-[#94938D]',
                            )}>
                            {value}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Modifier group card (з вкладеним масивом опцій)                          */
/* -------------------------------------------------------------------------- */

type MenuItemFormHook = ReturnType<typeof useForm<MenuItemFormValues, unknown, CreateMenuItemDTO>>;

type ModifierGroupCardProps = {
    groupIndex: number;
    register: MenuItemFormHook['register'];
    control: MenuItemFormHook['control'];
    errors: MenuItemFormHook['formState']['errors'];
    inputCls: string;
    onRemove: () => void;
};

function ModifierGroupCard({
    groupIndex,
    register,
    control,
    errors,
    inputCls,
    onRemove,
}: ModifierGroupCardProps) {
    // Вкладений масив опцій конкретної групи.
    const {
        fields: options,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({ control, name: `modifiers.${groupIndex}.options` });

    const groupError = errors.modifiers?.[groupIndex];

    return (
        <div className="rounded-2xl border border-black/10 bg-black/5 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <input
                        {...register(`modifiers.${groupIndex}.name`)}
                        placeholder="Group name (e.g. Choice of Milk)"
                        className={cn(inputCls, groupError?.name && 'border-red-400/70')}
                    />
                    {groupError?.name?.message && (
                        <span className="mt-1.5 block text-xs text-red-500">{groupError.name.message}</span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Remove modifier group"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 text-[#6B6A65] transition-colors hover:border-red-500/40 hover:text-red-500 dark:border-white/10 dark:text-[#94938D] dark:hover:text-red-500">
                    <Trash2 size={15} />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                        Min selections
                    </span>
                    <input
                        type="number"
                        min={0}
                        {...register(`modifiers.${groupIndex}.minSelections`, { valueAsNumber: true })}
                        className={cn(inputCls, 'h-9')}
                    />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                        Max selections
                    </span>
                    <input
                        type="number"
                        min={1}
                        {...register(`modifiers.${groupIndex}.maxSelections`, { valueAsNumber: true })}
                        className={cn(inputCls, 'h-9')}
                    />
                </label>
            </div>

            {options.length > 0 && (
                <div className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-4 dark:border-white/10">
                    {options.map((option, oi) => {
                        const optionError = groupError?.options?.[oi];
                        return (
                            <div key={option.id} className="flex items-center gap-3">
                                <input
                                    {...register(`modifiers.${groupIndex}.options.${oi}.name`)}
                                    placeholder="Option name (e.g. Almond Milk)"
                                    className={cn(inputCls, 'flex-1', optionError?.name && 'border-red-400/70')}
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="+0.00"
                                    {...register(`modifiers.${groupIndex}.options.${oi}.priceAdjustment`, {
                                        valueAsNumber: true,
                                    })}
                                    className={cn(inputCls, 'w-28')}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOption(oi)}
                                    aria-label="Remove option"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 text-[#6B6A65] transition-colors hover:border-red-500/40 hover:text-red-500 dark:border-white/10 dark:text-[#94938D] dark:hover:text-red-500">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <button
                type="button"
                onClick={() => appendOption({ name: '', priceAdjustment: 0 })}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#2563EB] transition-colors hover:underline dark:text-[#60A5FA]">
                <Plus size={14} />
                Add option
            </button>
        </div>
    );
}
