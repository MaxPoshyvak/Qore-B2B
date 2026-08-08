import { apiClient } from '@/lib/api-client';
import { AuthSuccessResponse, RegisterDTO } from '@my-app/types/auth';

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
}
