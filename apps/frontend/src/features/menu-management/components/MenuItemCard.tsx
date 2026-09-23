'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { AlertCircle, Pencil, SlidersHorizontal, Trash2, UtensilsCrossed } from 'lucide-react';
import type { MenuItemResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { cn, formatPrice } from '@/shared/lib/utils';
import { toStringArray } from '@/shared/lib/menu-attributes';
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch';
import { useToggleMenuItem } from '@/entities/menu/hooks/useMenuItems';

type MenuItemCardProps = {
    item: MenuItemResponse;
    onEdit: (item: MenuItemResponse) => void;
    onDelete: (item: MenuItemResponse) => void;
};

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
    const toggleItem = useToggleMenuItem();
    const allergens = toStringArray(item.allergens);
    const tags = toStringArray(item.tags);
    const modifierCount = item.modifiers?.length ?? 0;

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white shadow-xs transition-all duration-300',
                'md:hover:-translate-y-0.5 md:hover:border-[#3B82F6]/40 md:hover:shadow-md md:hover:shadow-[#3B82F6]/5',
                'dark:border-[#232327] dark:bg-[#141417] dark:md:hover:border-[#3B82F6]/40 dark:md:hover:shadow-black/40',
                !item.isActive && 'opacity-75 dark:opacity-65',
            )}>
            {/* Visual Media Header — compact & proportional */}
            <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-black/[0.02] to-black/[0.06] dark:from-white/[0.02] dark:to-white/[0.06] sm:h-36">
                {item.imageUrl ? (
                    <>
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            unoptimized
                            className={cn(
                                'object-cover transition-transform duration-500 ease-out md:group-hover:scale-105',
                                !item.isActive && 'grayscale contrast-75',
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Gradient scrim for overlay badges */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/35" />
                    </>
                ) : (
                    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/[0.08] via-[#8B5CF6]/[0.04] to-transparent" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                            <UtensilsCrossed size={17} className="text-[#3B82F6] dark:text-[#8B5CF6]" />
                        </div>
                        <span className="relative mt-1.5 text-[10px] font-medium text-[#6B6A65]/80 dark:text-[#94938D]/80">
                            No image
                        </span>
                    </div>
                )}

                {/* Top status indicator & toggle */}
                <div className="absolute inset-x-2.5 top-2.5 z-10 flex items-center justify-between gap-2">
                    {item.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300 backdrop-blur-md shadow-xs">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </span>
                            Live
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-md shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Hidden
                        </span>
                    )}

                    {/* Availability toggle switch */}
                    <div className="flex items-center rounded-full border border-white/20 bg-black/40 p-0.5 backdrop-blur-md shadow-xs transition-colors hover:bg-black/60 dark:border-white/10 dark:bg-black/50">
                        <ToggleSwitch
                            checked={item.isActive}
                            onChange={() => toggleItem.mutate(item.id)}
                            aria-label={`Toggle availability for ${item.name}`}
                        />
                    </div>
                </div>

                {/* Quick actions — ALWAYS visible on mobile, reveal on desktop hover */}
                <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-white/90 text-[#0A0A0C] shadow-sm backdrop-blur-md transition-all active:scale-90 md:hover:scale-105 dark:border-white/15 dark:bg-[#141417]/90 dark:text-[#F5F4F2] dark:md:hover:bg-[#1F1F26]">
                        <Pencil size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(item)}
                        aria-label={`Delete ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-white/90 text-red-500 shadow-sm backdrop-blur-md transition-all active:scale-90 md:hover:scale-105 md:hover:bg-red-50 md:hover:text-red-600 dark:border-white/15 dark:bg-[#141417]/90 dark:md:hover:bg-red-950/40">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Content Area — standard Inter font */}
            <div className="flex flex-1 flex-col p-4">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-2.5">
                    <h4
                        title={item.name}
                        className="line-clamp-1 text-sm font-semibold text-[#0A0A0C] transition-colors md:group-hover:text-[#3B82F6] dark:text-[#F5F4F2] dark:md:group-hover:text-[#60A5FA]">
                        {item.name}
                    </h4>
                    <div className="shrink-0 text-right">
                        {item.happyHourPrice ? (
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[11px] text-[#6B6A65] line-through dark:text-[#94938D]">
                                    {formatPrice(item.price)}
                                </span>
                                <span className="text-sm font-bold text-[#10B981] tabular-nums">
                                    {formatPrice(item.happyHourPrice)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-[#0A0A0C] dark:text-[#F5F4F2] tabular-nums">
                                {formatPrice(item.price)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="mt-1.5 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                    {item.description || 'No description provided.'}
                </p>

                {/* Footer metadata: Dietary Tags, Modifiers, Allergens */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#E7E5E0] pt-2.5 dark:border-[#232327]">
                    {tags.slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center rounded-md border border-black/5 bg-black/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]">
                            {tag.replace(/_/g, ' ')}
                        </span>
                    ))}
                    {tags.length > 2 && (
                        <span className="text-[10px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                            +{tags.length - 2}
                        </span>
                    )}

                    {modifierCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB] dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]/10 dark:text-[#60A5FA]">
                            <SlidersHorizontal size={9.5} />
                            {modifierCount} {modifierCount === 1 ? 'group' : 'groups'}
                        </span>
                    )}

                    {allergens.length > 0 && (
                        <span
                            title={`Allergens: ${allergens.join(', ')}`}
                            className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                            <AlertCircle size={9.5} />
                            {allergens.length}
                        </span>
                    )}

                    {tags.length === 0 && modifierCount === 0 && allergens.length === 0 && (
                        <span className="text-[10px] text-[#A8A6A0] dark:text-[#5A5A56]">
                            Standard item
                        </span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
