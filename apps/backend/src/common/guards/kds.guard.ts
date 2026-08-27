import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

/**
 * Protects the unauthenticated KDS endpoints. There is no JWT here — a kitchen
 * tablet authenticates with the Magic-Link `token` (URL param) plus the 4-digit
 * `x-kds-pin` header. A token that no longer maps to a tenant is rejected with 404
 * (invalid/expired link), while a valid token with the wrong PIN is rejected with 401
 * so the client can drop its local PIN and re-lock.
 *
 * On success we attach the resolved `tenantId` to the request for downstream use.
 */
@Injectable()
export class KdsGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token: string | undefined = request.params?.token;
        const pin = request.headers['x-kds-pin'];

        if (!token || !pin) {
            throw new UnauthorizedException('KDS credentials are required');
        }

        const settings = await this.prisma.tenantSettings.findUnique({
            where: { kdsToken: token },
            select: { tenantId: true, kdsPin: true },
        });

        if (!settings) {
            throw new NotFoundException('Invalid or expired KDS link');
        }

        if (settings.kdsPin !== pin) {
            throw new UnauthorizedException('Incorrect KDS PIN');
        }

        request.kdsTenantId = settings.tenantId;
        return true;
    }
}
