import { apiClient } from '@/lib/api-client';
import type { SignatureResponse } from '@my-app/types';

const SIGNATURE_URL = '/media/signature';

/**
 * Direct-to-Cloudinary media access.
 *
 * `getSignature` hits our backend for a signed upload (the API secret never
 * leaves the server). `uploadToCloudinary` then posts the file straight to
 * Cloudinary from the browser — no bytes pass through our API.
 */
export class MediaService {
    /**
     * Requests a signed upload from the backend.
     *
     * The backend prefixes the folder with `qore/`, so pass the bare sub-folder
     * (e.g. `menu-items`). The returned `folder` is authoritative for the upload.
     */
    static async getSignature(folder: string): Promise<SignatureResponse> {
        const res = await apiClient<SignatureResponse>(
            SIGNATURE_URL,
            { method: 'POST', body: JSON.stringify({ folderName: folder }) },
            false,
        );
        return res;
    }

    /**
     * Uploads a file directly to Cloudinary using a backend-issued signature.
     * Resolves with the `secure_url` of the stored asset.
     */
    static async uploadToCloudinary(file: File, signature: SignatureResponse): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signature.apiKey);
        formData.append('timestamp', String(signature.timestamp));
        formData.append('signature', signature.signature);
        formData.append('folder', signature.folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
            { method: 'POST', body: formData },
        );

        if (!response.ok) {
            let message = 'Failed to upload image';
            try {
                const data = await response.json();
                message = data?.error?.message ?? message;
            } catch {
                /* ignore parse errors, keep default message */
            }
            throw new Error(message);
        }

        const data = (await response.json()) as { secure_url?: string };
        if (!data.secure_url) {
            throw new Error('Upload succeeded but returned no image URL');
        }
        return data.secure_url;
    }
}
