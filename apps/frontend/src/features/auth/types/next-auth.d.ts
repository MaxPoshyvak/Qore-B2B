import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
        error?: 'RefreshAccessTokenError';
    }

    interface User {
        id: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number; // Час життя токена в мс (наприклад, 15 * 60 * 1000)
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number; // UNIX timestamp закінчення життя токена
        error?: 'RefreshAccessTokenError';
    }
}
