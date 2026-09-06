'use client';

import { useMutation } from '@tanstack/react-query';

import { MediaService } from '../api/media.service';

type UploadVariables = {
    folder: string;
    file: File;
};

/**
 * Chains signature fetch + direct Cloudinary upload and returns the uploaded
 * image's `secure_url`. Feed the result straight into a form field's `onChange`.
 */
export const useMediaUpload = () => {
    return useMutation({
        mutationFn: async ({ folder, file }: UploadVariables) => {
            const signature = await MediaService.getSignature(folder);
            return MediaService.uploadToCloudinary(file, signature);
        },
    });
};
