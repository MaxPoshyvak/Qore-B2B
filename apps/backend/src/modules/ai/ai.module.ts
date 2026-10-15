import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UpsellCacheService } from './services/upsell-cache.service';
import { ReviewDigestService } from './services/review-digest.service';

@Module({
    imports: [],
    controllers: [AiController],
    providers: [AiService, UpsellCacheService, ReviewDigestService],
    exports: [AiService, UpsellCacheService, ReviewDigestService],
})
export class AiModule {}
