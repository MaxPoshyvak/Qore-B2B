'use client';

import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../api/auth.service';
import { RegisterDTO } from '@my-app/types/auth';

export const useRegister = () => {
    return useMutation({
        mutationFn: (dto: RegisterDTO) => AuthService.register(dto),
    });
};
