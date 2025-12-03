/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/Error';
import ProductListHeader from '@/components/products/ProductListHeader';
import ProductGrid from '@/components/products/ProductGrid';
import EmptyState from '@/components/products/EmptyState';
import { Product } from '@/types/product';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      console.log('🔄 Fetching products...');

      const response = await fetch(`${apiUrl}/products/user?all=true`);

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('📦 API Response:', data);

      const productsArray = extractProductsFromResponse(data);

      if (!Array.isArray(productsArray) || productsArray.length === 0) {
        console.warn('⚠️ No products found in response');
        setProducts([]);
        setLoading(false);
        return;
      }

      const normalizedProducts = normalizeProducts(productsArray);
      const uniqueProducts = deduplicateProducts(normalizedProducts);

      setProducts(uniqueProducts);
      setLoading(false);
    } catch (err) {
      setError(
        'Failed to fetch products: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
      setLoading(false);
    }
  };

  const extractProductsFromResponse = (data: any): Product[] => {
    if (data.success && data.data) {
      if (data.data.products && Array.isArray(data.data.products)) {
        return data.data.products;
      }
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (typeof data.data === 'object' && data.data.products) {
        return data.data.products;
      }
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  };

  const normalizeProducts = (productsArray: Product[]): Product[] => {
    return productsArray.map(product => ({
      ...product,
      _id: product.id || product._id,
    }));
  };

  const deduplicateProducts = (products: Product[]): Product[] => {
    return products.filter(
      (product, index, self) =>
        index ===
        self.findIndex(p => (p._id || p.id) === (product._id || product.id))
    );
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchProducts();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay message={error} />;
  if (!products.length) return <EmptyState onRetry={handleRetry} />;

  return (
    <>
      <ProductListHeader productCount={products.length} />
      <ProductGrid products={products} />
    </>
  );
}
