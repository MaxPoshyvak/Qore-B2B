import { apiClient } from '@/lib/api-client';
import { ProductResponseDTO, CreateProductDTO, SuccessResponse } from '@my-app/types';

export class ProductService {
    static async getAll(): Promise<ProductResponseDTO[]> {
        const products = await apiClient<ProductResponseDTO[]>('/products');
        return products.data;
    }

    static async getById(id: string): Promise<ProductResponseDTO> {
        const product = await apiClient<ProductResponseDTO>(`/products/${id}`);
        return product.data;
    }

    static async create(dto: CreateProductDTO): Promise<SuccessResponse<ProductResponseDTO>> {
        return apiClient<ProductResponseDTO>('/products', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    }
}
