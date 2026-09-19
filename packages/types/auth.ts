import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Minimum 6 characters'),
});

export const RegisterSchema = LoginSchema.extend({
    name: z.string().min(2, 'Name is required'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;

export interface UserResponseDTO {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

export interface AuthSuccessResponse {
    success: boolean;
    data: {
        user: UserResponseDTO;
        accessToken: string;
        refreshToken: string;
    };
}

export const VerifyOtpSchema = z.object({
    email: z.string().email('Invalid email'),
    code: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const ResendCodeSchema = z.object({
    email: z.string().email('Invalid email'),
});

export type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;
export type ResendCodeDTO = z.infer<typeof ResendCodeSchema>;

export interface VerificationSentResponse {
    success: boolean;
    message: string;
}

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Invalid email'),
});

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, 'Missing or invalid token'),
    newPassword: z.string().min(6, 'Minimum 6 characters'),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
