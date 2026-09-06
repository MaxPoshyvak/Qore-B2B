import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @UseGuards(JwtAuthGuard)
    @Post('signature')
    async generateSignature(@Body('folderName') folderName: string) {
        const targetFolder = folderName || 'general';
        return this.mediaService.generateSignature(targetFolder);
    }
}
