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
