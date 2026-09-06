import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';

@Injectable()
export class MediaService {
    constructor() {
        cloudinary.config({
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_API_SECRET,
        });
    }

    generateSignature(folderName: string) {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000);

            // Idempotent prefix: keep as-is if already namespaced, otherwise nest
            // under `qore/`. This lets the frontend pass either `menu-items` or
            // the full `qore/menu-items` without producing a `qore/qore/...` path.
            const folder = folderName.startsWith('qore/') ? folderName : `qore/${folderName}`;

            const paramsToSign = {
                timestamp,
                folder,
            };

            const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

            return {
                signature,
                timestamp,
                folder,
                cloudName: env.CLOUDINARY_CLOUD_NAME,
                apiKey: env.CLOUDINARY_API_KEY,
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate media signature');
        }
    }
}
