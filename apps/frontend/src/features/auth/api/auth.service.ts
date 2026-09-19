import { apiClient } from '@/lib/api-client';
import { AuthSuccessResponse, RegisterDTO, VerifyOtpDTO, VerificationSentResponse, ForgotPasswordDTO, ResetPasswordDTO } from '@my-app/types/auth';

export class AuthService {
    static async register(dto: RegisterDTO): Promise<AuthSuccessResponse> {
        return await apiClient<AuthSuccessResponse>(
            '/auth/register',
            {
                method: 'POST',
                body: JSON.stringify(dto),
            },
            false,
        );
    }

    static async verifyOtp(dto: VerifyOtpDTO): Promise<AuthSuccessResponse> {
        return await apiClient<AuthSuccessResponse>(
            '/auth/verify-otp',
            {
                method: 'POST',
                body: JSON.stringify(dto),
            },
            false,
        );
    }

    static async resendCode(email: string): Promise<VerificationSentResponse> {
        return await apiClient<VerificationSentResponse>(
            '/auth/resend-code',
            {
                method: 'POST',
                body: JSON.stringify({ email }),
            },
            false,
        );
    }

    static async forgotPassword(email: string): Promise<VerificationSentResponse> {
        return await apiClient<VerificationSentResponse>(
            '/auth/forgot-password',
            {
                method: 'POST',
                body: JSON.stringify({ email }),
            },
            false,
        );
    }

    static async resetPassword(dto: ResetPasswordDTO): Promise<VerificationSentResponse> {
        return await apiClient<VerificationSentResponse>(
            '/auth/reset-password',
            {
                method: 'POST',
                body: JSON.stringify(dto),
            },
            false,
        );
    }
}
