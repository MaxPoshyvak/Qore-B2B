'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../api/product.service';
import { CreateProductDTO } from '@my-app/types';

export const useGetProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: () => ProductService.getAll(),
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateProductDTO) => ProductService.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
