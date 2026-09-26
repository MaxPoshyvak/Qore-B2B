import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantsModule } from '../tenants/tenants.module';
import { ProfanityService } from 'src/common/profanity/profanity.service';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [PrismaModule, TenantsModule, AiModule],
    controllers: [FeedbackController],
    providers: [FeedbackService, ProfanityService],
    exports: [FeedbackService],
})
export class FeedbackModule {}
