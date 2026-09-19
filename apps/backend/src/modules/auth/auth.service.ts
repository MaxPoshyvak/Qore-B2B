import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, VerifyOtpDto, ResendCodeDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { env } from '../../config/env';
import { AuthSuccessResponse, VerificationSentResponse } from '@my-app/types';

const RESET_TTL_MS = 15 * 60 * 1000;

const VERIFICATION_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailer: MailerService,
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

        await this.issueAndSendVerification(user.id, user.email, user.name);

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

    private generateOtp(): string {
        return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    }

    private generateMagicToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private async issueAndSendVerification(userId: string, email: string, name: string | null) {
        const otp = this.generateOtp();
        const token = this.generateMagicToken();
        const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerifyOtp: otp,
                emailVerifyToken: token,
                emailVerifyExpiresAt: expiresAt,
            },
        });

        const magicLink = `${env.FRONTEND_URL}/api/auth/verify-link?token=${token}`;

        await this.mailer.sendVerificationEmail({ email, name, otp, magicLink });
    }

    async verifyOtp(dto: VerifyOtpDto): Promise<AuthSuccessResponse> {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new NotFoundException('Account not found');

        if (user.isEmailVerified) {
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

        if (!user.emailVerifyOtp || !user.emailVerifyExpiresAt) {
            throw new BadRequestException('No verification code requested. Please resend.');
        }

        if (user.emailVerifyExpiresAt < new Date()) {
            throw new BadRequestException('Verification code expired. Please resend a new one.');
        }

        if (user.emailVerifyOtp !== dto.code) {
            throw new BadRequestException('Invalid verification code');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerifyOtp: null,
                emailVerifyToken: null,
                emailVerifyExpiresAt: null,
            },
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

    async verifyLink(token: string): Promise<string> {
        const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
        if (!user) throw new BadRequestException('Invalid or already used verification link');

        if (!user.emailVerifyExpiresAt || user.emailVerifyExpiresAt < new Date()) {
            throw new BadRequestException('Verification link expired. Please request a new one.');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerifyOtp: null,
                emailVerifyToken: null,
                emailVerifyExpiresAt: null,
            },
        });

        return user.email;
    }

    async resendCode(dto: ResendCodeDto): Promise<VerificationSentResponse> {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new NotFoundException('Account not found');
        if (user.isEmailVerified) {
            throw new BadRequestException('This email is already verified');
        }

        await this.issueAndSendVerification(user.id, user.email, user.name);

        return { success: true, message: 'A new verification code has been sent to your inbox.' };
    }

    private generateResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<VerificationSentResponse> {
        // Always respond with success to prevent email enumeration.
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

        if (user) {
            const rawToken = this.generateResetToken();
            const expiresAt = new Date(Date.now() + RESET_TTL_MS);

            await this.prisma.passwordResetToken.create({
                data: {
                    token: this.hashToken(rawToken),
                    userId: user.id,
                    expiresAt,
                },
            });

            const resetLink = `${env.FRONTEND_URL}/api/auth/reset-link?token=${rawToken}`;
            await this.mailer.sendPasswordResetEmail({ email: user.email, name: user.name, resetLink });
        }

        return {
            success: true,
            message: 'If an account exists for that email, a reset link is on its way.',
        };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<VerificationSentResponse> {
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { token: this.hashToken(dto.token) },
        });

        if (!record || record.expiresAt < new Date()) {
            throw new BadRequestException('This reset link is invalid or has expired.');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordResetToken.delete({ where: { id: record.id } }),
        ]);

        return { success: true, message: 'Your password has been reset. You can now log in.' };
    }
}

