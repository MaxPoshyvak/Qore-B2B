'use client';

import { useGetProducts, useCreateProduct } from '../hooks/useProducts';

export const ProductList = () => {
    const { data: products, isLoading, isError } = useGetProducts();
    const { mutate: createProduct, isPending } = useCreateProduct();

    if (isLoading) return <p>Завантаження товарів...</p>;
    if (isError) return <p>Помилка при завантаженні!</p>;

    return (
        <div>
            <button disabled={isPending} onClick={() => createProduct({ title: 'Нові кросівки', price: 2500 })}>
                {isPending ? 'Створення...' : 'Додати товар'}
            </button>

            <ul>
                {products?.map((product) => (
                    <li key={product.id}>
                        {product.title} — {product.price} CZK
                    </li>
                ))}
            </ul>
        </div>
    );
};
