export interface UserResponseDTO {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface UpdateUserDTO {
    email?: string;
    name?: string;
}

export interface ProductResponseDTO {
    id: string;
    title: string;
    price: number;
    description?: string | null;
    createdAt: string;
}

export interface CreateProductDTO {
    title: string;
    price: number;
    description?: string;
}

export interface UpdateProductDTO {
    title?: string;
    price?: number;
    description?: string;
}

export interface AddToWishlistDTO {
    productId: string;
}
