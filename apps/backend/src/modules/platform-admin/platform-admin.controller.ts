import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PlatformAdminService } from './platform-admin.service';
import { PlatformLoginDto, PlatformTrackHitDto } from './dto/platform-admin.dto';
import { PlatformAdminGuard } from './guards/platform-admin.guard';

@Controller('platform-admin')
export class PlatformAdminController {
    constructor(private readonly platformAdminService: PlatformAdminService) {}

    @Post('login')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async login(@Body() dto: PlatformLoginDto) {
        return this.platformAdminService.login(dto);
    }

    @Post('track')
    @Throttle({ default: { limit: 120, ttl: 60000 } })
    async trackHit(@Body() dto: PlatformTrackHitDto) {
        return this.platformAdminService.trackHit(dto);
    }

    @Get('me')
    @UseGuards(PlatformAdminGuard)
    async getMe() {
        return { authenticated: true, role: 'PLATFORM_OWNER' };
    }

    @Get('stats')
    @UseGuards(PlatformAdminGuard)
    async getStats() {
        return this.platformAdminService.getStats();
    }
}
