import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { env } from '../../config/env';
import { AuthSuccessResponse } from '@my-app/types';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { secret: env.JWT_SECRET, expiresIn: '15m' }),
            this.jwtService.signAsync(payload, { secret: env.JWT_SECRET, expiresIn: '30d' }),
        ]);
        return { accessToken, refreshToken };
    }

    async register(dto: RegisterDto): Promise<AuthSuccessResponse> {
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) throw new ConflictException('User with this email already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: { email: dto.email, password: hashedPassword, name: dto.name },
        });

        const tokens = await this.generateTokens(user.id, user.email);

        return {
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, image: user.image },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    async login(dto: LoginDto): Promise<AuthSuccessResponse> {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(user.id, user.email);

        return {
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, image: user.image },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    // Для рефрешу можна створити окремий тип, наприклад RefreshSuccessResponse в @my-app/types
    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, { secret: env.JWT_SECRET });
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) throw new UnauthorizedException('Invalid refresh token');

            const tokens = await this.generateTokens(user.id, user.email);
            return { success: true, data: tokens };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
