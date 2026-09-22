import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUIRED_PLAN_KEY, RequiredPlan } from 'src/common/decorators/require-plan.decorator';

const PLAN_RANK: Record<SubscriptionPlan, number> = {
    free: 0,
    pro: 1,
    business: 2,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPlan = this.reflector.getAllAndOverride<RequiredPlan | undefined>(
            REQUIRED_PLAN_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPlan) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.id) {
            throw new UnauthorizedException('Authentication required');
        }

        const tenantId: string | undefined =
            user.tenantId ?? request.params?.tenantId ?? request.body?.tenantId;

        let tenantPlan: SubscriptionPlan | undefined;

        if (tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { subscriptionPlan: true },
            });
            tenantPlan = tenant?.subscriptionPlan;
        } else {
            const dbUser = await this.prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    tenants: {
                        take: 1,
                        select: { subscriptionPlan: true },
                    },
                },
            });
            tenantPlan = dbUser?.tenants?.[0]?.subscriptionPlan;
        }

        if (!tenantPlan || PLAN_RANK[tenantPlan] < PLAN_RANK[requiredPlan]) {
            throw new ForbiddenException({
                code: 'PRO_PLAN_REQUIRED',
                message: 'Upgrade to PRO to access AI features.',
            });
        }

        return true;
    }
}
