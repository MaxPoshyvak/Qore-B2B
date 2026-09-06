import { z } from 'zod';

/**
 * Cloudinary signed-upload contract.
 *
 * Returned by `POST /media/signature`. The frontend forwards `apiKey`,
 * `timestamp`, `signature` and `folder` straight into the multipart upload
 * to `https://api.cloudinary.com/v1_1/{cloudName}/image/upload`.
 */
export const cloudinarySignatureSchema = z.object({
    signature: z.string(),
    timestamp: z.number(),
    folder: z.string(),
    cloudName: z.string(),
    apiKey: z.string(),
});

export type SignatureResponse = z.infer<typeof cloudinarySignatureSchema>;
