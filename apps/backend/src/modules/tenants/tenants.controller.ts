import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from 'src/modules/tenants/dto/tenants.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}

    @Post()
    create(@CurrentUser('id') userId: string, @Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.createTenant(createTenantDto, userId);
    }
}
