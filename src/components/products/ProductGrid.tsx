'use client';

import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <section
      id='Projects'
      className='w-fit mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5'
    >
      {products.map((product, index) => (
        <ProductCard
          key={`${product.id || product._id}-${index}`}
          product={product}
          index={index}
        />
      ))}
    </section>
  );
}
