import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Menu Category                                                     */
/* ------------------------------------------------------------------ */

export const CreateCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    tenantId: z.string().min(1, 'Tenant id is required'),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;

/* ------------------------------------------------------------------ */
/*  Modifiers (dynamic add-ons / removals)                            */
/* ------------------------------------------------------------------ */

export const ModifierOptionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Option name is required').max(60, 'Option name too long'),
    priceAdjustment: z.number().default(0),
});

export const ModifierGroupSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Group name is required').max(60, 'Group name too long'),
    minSelections: z.number().int().nonnegative().default(0),
    maxSelections: z.number().int().positive('Max selections must be at least 1').default(1),
    options: z.array(ModifierOptionSchema).default([]),
});

export type ModifierOptionDTO = z.infer<typeof ModifierOptionSchema>;
export type ModifierGroupDTO = z.infer<typeof ModifierGroupSchema>;
export type ModifierOptionInput = z.input<typeof ModifierOptionSchema>;
export type ModifierGroupInput = z.input<typeof ModifierGroupSchema>;

/**
 * Знімок обраної опції, який зберігається у `CartItem`/`OrderItem` (Json).
 *
 * Це НЕ зв'язок на `ModifierOption`, а свідома копія: чек за минулий тиждень
 * має показувати ту назву й надбавку, які діяли на момент замовлення, навіть
 * якщо опцію потім перейменували, переоцінили або видалили з меню.
 */
export const SelectedModifierSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    priceAdjustment: z.number(),
});

export type SelectedModifier = z.infer<typeof SelectedModifierSchema>;

/**
 * Захищено читає Json-колонку зі знімком модифікаторів.
 *
 * Колонка типізована як `unknown`, а дані могли лягти ще до появи цієї схеми,
 * тому кожен елемент валідуємо окремо і тихо відкидаємо битий: підсумок
 * ніколи не має падати через один зіпсований рядок.
 */
export function parseSelectedModifiers(value: unknown): SelectedModifier[] {
    if (!Array.isArray(value)) return [];

    const parsed: SelectedModifier[] = [];
    for (const entry of value) {
        const result = SelectedModifierSchema.safeParse(entry);
        if (result.success) parsed.push(result.data);
    }
    return parsed;
}

/** Сума надбавок за обрані опції. */
export function sumModifierAdjustments(modifiers: SelectedModifier[]): number {
    return modifiers.reduce((total, modifier) => {
        // Явний `Number(...)` + перевірка: захист від NaN та конкатенації рядків.
        const value = Number(modifier.priceAdjustment);
        return total + (Number.isFinite(value) ? value : 0);
    }, 0);
}

/**
 * Стабільний ключ конфігурації страви.
 *
 * Дві однакові страви зливаються в один рядок кошика ЛИШЕ якщо набір опцій
 * ідентичний. Ідентифікатори сортуються, щоб порядок вибору гостя не впливав
 * на ключ («Milk, Syrup» і «Syrup, Milk» — та сама конфігурація).
 */
export function buildCartItemConfigKey(menuItemId: string, optionIds: string[]): string {
    return [menuItemId, ...[...optionIds].sort()].join('-');
}

/* ------------------------------------------------------------------ */
/*  Menu Item                                                         */
/* ------------------------------------------------------------------ */

export const CreateMenuItemSchema = z.object({
    name: z.string().min(1, 'Name is required').max(80, 'Name must be less than 80 characters'),
    price: z.number().nonnegative('Price must be zero or greater'),
    description: z.string().max(500, 'Description too long').optional(),
    categoryId: z.string().min(1, 'Category id is required'),
    tenantId: z.string().min(1, 'Tenant id is required'),
    // Public contract uses `isAvailable`; the DB column is `isActive`.
    isAvailable: z.boolean().default(true),
    // Enterprise builder: фото, модифікатори, алергени та дієтичні теги.
    imageUrl: z.string().url('Enter a valid image URL').nullable().optional(),
    allergens: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    modifiers: z.array(ModifierGroupSchema).default([]),
});

/**
 * PATCH-контракт страви.
 *
 * Похідний від `CreateMenuItemSchema`, щоб редагування ніколи не "відставало"
 * від створення — раніше тут бракувало `imageUrl`, `allergens`, `tags` та
 * `modifiers`, тому розширений білдер фізично не міг зберегти ці поля.
 * `tenantId` виключено: власника страви змінювати не можна.
 *
 * `.partial()` обгортає навіть поля з `.default(...)` у `ZodOptional`, тож
 * відсутній ключ залишається `undefined` (а не підставляє дефолт) — саме така
 * семантика потрібна для часткового оновлення.
 */
export const UpdateMenuItemSchema = CreateMenuItemSchema.omit({ tenantId: true }).partial();

export type CreateMenuItemDTO = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemDTO = z.infer<typeof UpdateMenuItemSchema>;
export type UpdateMenuItemInput = z.input<typeof UpdateMenuItemSchema>;

/**
 * Form-input shape of `CreateMenuItemSchema`.
 *
 * `isAvailable` uses `.default(true)`, so the schema input and output types
 * diverge. `zodResolver` is typed `Resolver<z.input, Context, z.output>`,
 * which means React Hook Form must be generic over the *input* type.
 */
export type CreateMenuItemInput = z.input<typeof CreateMenuItemSchema>;

/* ------------------------------------------------------------------ */
/*  Menu API response contracts                                       */
/* ------------------------------------------------------------------ */

/**
 * Опція модифікатора у вигляді, в якому приходить з HTTP.
 * `priceAdjustment` — Prisma `Decimal`, тому серіалізується у рядок.
 */
export interface ModifierOptionResponse {
    id: string;
    groupId: string;
    name: string;
    priceAdjustment: string;
    sortOrder: number;
}

export interface ModifierGroupResponse {
    id: string;
    menuItemId: string;
    name: string;
    minSelections: number;
    maxSelections: number;
    sortOrder: number;
    options: ModifierOptionResponse[];
}

/**
 * A menu item exactly as it arrives over HTTP.
 *
 * Note: the menu endpoints return raw Prisma rows, so the persisted column
 * name `isActive` is used here — the *write* contract exposes it as
 * `isAvailable`. Prisma `Decimal` columns are serialized to strings in JSON,
 * hence `price` / `happyHourPrice` are strings rather than numbers.
 */
export interface MenuItemResponse {
    id: string;
    tenantId: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: string;
    happyHourPrice: string | null;
    imageUrl: string | null;
    allergens: unknown;
    tags: unknown;
    isActive: boolean;
    sortOrder: number;
    /** Реляційні групи модифікаторів; приходять лише там, де бекенд робить `include`. */
    modifiers?: ModifierGroupResponse[];
}

export interface MenuCategoryResponse {
    id: string;
    tenantId: string;
    name: string;
    icon: string | null;
    color: string | null;
    sortOrder: number;
    isActive: boolean;
}

/** `GET /menu/categories/:tenantId` returns every category with its items. */
export interface MenuCategoryWithItemsResponse extends MenuCategoryResponse {
    items: MenuItemResponse[];
}

/* ------------------------------------------------------------------ */
/*  Public (B2C) menu                                                 */
/* ------------------------------------------------------------------ */

/** Guest-facing venue info — never expose owner id or internal flags. */
export interface PublicMenuVenueResponse {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
}

/** Public category payload — only categories that still contain items. */
export interface PublicMenuCategoryResponse extends MenuCategoryResponse {
    items: MenuItemResponse[];
}

export interface PublicMenuResponseDTO {
    venue: PublicMenuVenueResponse;
    categories: PublicMenuCategoryResponse[];
}
