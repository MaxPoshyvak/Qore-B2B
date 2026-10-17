import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(req);

        if (!token) {
            throw new UnauthorizedException('Master session token missing');
        }

        try {
            const secret = process.env.JWT_SECRET || 'platform_admin_super_secret';
            const payload = this.jwtService.verify(token, { secret });

            if (payload?.role !== 'PLATFORM_OWNER') {
                throw new UnauthorizedException('Insufficient platform privileges');
            }

            (req as any).platformAdmin = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired master session');
        }
    }

    private extractToken(req: Request): string | null {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7).trim();
        }

        const customHeader = req.headers['x-platform-admin-token'] as string | undefined;
        if (customHeader) {
            return customHeader.trim();
        }

        const cookieHeader = req.headers.cookie;
        if (cookieHeader) {
            const match = cookieHeader.match(/qore_owner_token=([^;]+)/);
            if (match && match[1]) {
                return decodeURIComponent(match[1]);
            }
        }

        return null;
    }
}
