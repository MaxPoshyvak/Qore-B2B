import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { TenantsService } from 'src/modules/tenants/tenants.service';

/**
 * Enforces tenant isolation at the controller boundary. Must run AFTER
 * `JwtAuthGuard` so that `request.user.id` has been populated.
 *
 * Resolves `tenantId` from the route param (`params.tenantId`) or request body
 * (`body.tenantId`), then verifies ownership via `TenantsService.getTenantById`.
 * Any missing context or failed ownership check becomes a 401 / 403 respectively,
 * so individual handlers no longer need manual `getTenantById` assertions.
 */
@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private readonly tenantsService: TenantsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tenantId: string | undefined =
            request.params?.tenantId ?? request.body?.tenantId;
        const userId: string | undefined = request.user?.id;

        if (!tenantId || !userId) {
            throw new UnauthorizedException('Missing tenant or user context');
        }

        try {
            await this.tenantsService.getTenantById(tenantId, userId);
        } catch {
            throw new ForbiddenException('You do not have access to this venue');
        }

        return true;
    }
}
