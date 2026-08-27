import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantSettingsDto } from 'src/modules/tenants/dto/tenants.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}

    @Post()
    create(@CurrentUser('id') userId: string, @Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.createTenant(createTenantDto, userId);
    }

    @Get('my')
    getMyTenants(@CurrentUser('id') userId: string) {
        return this.tenantsService.getTenantsByUserId(userId);
    }

    @Get('/by-slug/:slug')
    getBySlug(@Param('slug') slug: string, @CurrentUser('id') userId: string) {
        return this.tenantsService.getTenantBySlug(slug, userId);
    }

    // Intentionally unauthenticated: venue guests only know the public slug.
    @Get('/public/:slug')
    getPublicBySlug(@Param('slug') slug: string) {
        return this.tenantsService.getPublicTenantBySlug(slug);
    }

    @Patch('/:slug/settings')
    updateTenantSettings(
        @Param('slug') slug: string,
        @Body() updateTenantSettingsDto: UpdateTenantSettingsDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.tenantsService.updateTenantSettings(slug, updateTenantSettingsDto, userId);
    }

    /**
     * Owner-only: mint a fresh Magic-Link token + 4-digit PIN for the isolated KDS.
     * Replaces any previously issued credentials.
     */
    @Post('/:id/kds-auth')
    generateKdsAccess(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.tenantsService.generateKdsAccess(id, userId);
    }

    /** Owner-only: revoke KDS access (clears token + pin). */
    @Delete('/:id/kds-auth')
    revokeKdsAccess(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.tenantsService.revokeKdsAccess(id, userId);
    }
}
