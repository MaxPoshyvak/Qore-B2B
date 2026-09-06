'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ImagePlus, Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/shared/lib/utils';
import { useMediaUpload } from '@/entities/media/hooks/useMediaUpload';

type ImageUploadProps = {
    /** Current image URL (from DB or Cloudinary). */
    value?: string | null;
    /** Called with the uploaded `secure_url`, or `null` when removed. */
    onChange: (url: string | null) => void;
    /** Cloudinary sub-folder, e.g. `qore/menu-items` or `qore/venue-branding`. */
    folder: string;
    className?: string;
};

const ACCEPTED = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
};

export function ImageUpload({ value, onChange, folder, className }: ImageUploadProps) {
    const [error, setError] = useState<string | null>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const { mutateAsync, isPending } = useMediaUpload();

    useEffect(() => {
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        };
    }, [localPreview]);

    const onDrop = useCallback(
        async (accepted: File[], rejections: FileRejection[]) => {
            setError(null);

            if (rejections.length > 0) {
                setError('Please upload a valid image (JPG, PNG, WebP).');
                return;
            }

            const file = accepted[0];
            if (!file) return;

            const objectUrl = URL.createObjectURL(file);
            setLocalPreview(objectUrl);

            try {
                const url = await mutateAsync({ folder, file });
                onChange(url);
            } catch (err) {
                setLocalPreview(null);
                setError(err instanceof Error ? err.message : 'Upload failed.');
            }
        },
        [folder, mutateAsync, onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED,
        maxFiles: 1,
        multiple: false,
        disabled: isPending,
    });

    const displayUrl = localPreview || value;
    const hasImage = typeof displayUrl === 'string' && displayUrl.length > 0;

    return (
        // The outer wrapper controls the dimensions passed via className
        <div className={cn('relative flex flex-col gap-2', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border-2 transition-all duration-200 ease-out',
                    hasImage ? 'border-transparent bg-black/5 dark:bg-white/5' : 'border-dashed',
                    isDragActive
                        ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                        : !hasImage &&
                              'border-black/10 hover:border-[#3B82F6]/50 hover:bg-black/[0.02] dark:border-white/10 dark:hover:border-[#3B82F6]/50 dark:hover:bg-white/[0.02]',
                    // Ensure a sensible minimum height, but let it flex to container
                    'min-h-[140px]',
                )}>
                <input {...getInputProps()} />

                {!hasImage && (
                    // Reduced padding for smaller containers to prevent text overflow
                    <div className="flex flex-col items-center justify-center gap-2 p-3 text-center sm:gap-3 sm:p-6">
                        <div
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors sm:h-12 sm:w-12',
                                isDragActive
                                    ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                                    : 'bg-black/5 text-[#A8A6A0] dark:bg-white/10 dark:text-[#94938D]',
                            )}>
                            {isDragActive ? (
                                <UploadCloud size={20} className="sm:h-6 sm:w-6" />
                            ) : (
                                <ImagePlus size={20} className="sm:h-6 sm:w-6" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            {/* Text is hidden on very narrow mobile containers, visible on larger */}
                            <p className="text-[12px] font-medium leading-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-[14px]">
                                {isDragActive ? 'Drop image here' : 'Click or drag image'}
                            </p>
                            {/* Hide the file size text on very small containers to prevent squishing */}
                            <p className="hidden text-[11px] text-[#6B6A65] dark:text-[#94938D] min-[200px]:block sm:text-[12px]">
                                Max 5MB
                            </p>
                        </div>
                    </div>
                )}

                {hasImage && (
                    <Image
                        src={displayUrl}
                        alt="Uploaded preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={!!localPreview}
                    />
                )}

                <AnimatePresence>
                    {isPending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[1.5rem] bg-white/60 backdrop-blur-md dark:bg-black/60">
                            <Loader2 size={28} className="animate-spin text-[#3B82F6]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasImage && !isPending && (
                    <div className="absolute rounded-[1.5rem] inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                        <span className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-[13px]">
                            Replace
                        </span>
                    </div>
                )}

                {hasImage && !isPending && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (localPreview) URL.revokeObjectURL(localPreview);
                            setLocalPreview(null);
                            onChange(null);
                        }}
                        className="absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 sm:h-7 sm:w-7"
                        aria-label="Remove image">
                        <Trash2 size={15} className="sm:h-[13px] sm:w-[13px]" />
                    </button>
                )}
            </div>

            {error && <p className="text-[13px] font-medium text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
}
