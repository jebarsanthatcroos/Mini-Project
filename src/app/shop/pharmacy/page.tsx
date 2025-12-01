'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BiShoppingBag } from 'react-icons/bi';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/Error';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  manufacturer: string;
  requiresPrescription: boolean;
  // Add other fields from your Product model as needed
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

        // Try multiple endpoints in case one fails
        const endpoints = [`${apiUrl}/products/user`, `${apiUrl}/products`];

        let response = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              response = res;
              console.log(`✅ Successfully fetched from: ${endpoint}`);
              break;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            console.log(`❌ Failed to fetch from: ${endpoint}`);
            continue;
          }
        }

        if (!response) {
          throw new Error('All API endpoints failed');
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Handle different response formats
        let productsArray;

        if (data.success && Array.isArray(data.data)) {
          productsArray = data.data;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else {
          throw new Error('Invalid data format received from API');
        }

        // Ensure all products have unique _id values
        const uniqueProducts = productsArray.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (product: { _id: any }, index: any, self: any[]) =>
            index === self.findIndex(p => p._id === product._id)
        );

        setProducts(uniqueProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(
          'Failed to fetch products: ' +
            (err instanceof Error ? err.message : 'Unknown error')
        );
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay message={error} />;

  // Check if products array is empty
  if (!products.length) {
    return (
      <div className='text-center p-10'>
        <h1 className='font-bold text-5xl text-gray-800 mb-4'>Products</h1>
        <p className='text-lg text-gray-500 mt-2'>No products found.</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='text-center p-10'>
      <h1 className='font-bold text-5xl text-gray-800 mb-4'>Products</h1>
      <h2 className='font-semibold text-3xl text-gray-600'>
        Pharmacy Products
      </h2>
      <p className='text-lg text-gray-500 mt-2'>
        Discover our range of high-quality pharmacy products and medications.
      </p>

      <div className='mt-5 mb-8'>
        <p className='text-sm text-gray-600'>
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <section
        id='Projects'
        className='w-fit mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5'
      >
        {products.map((product, index) => (
          <motion.div
            key={`${product._id}-${index}`}
            className='w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/shop/pharmacy/${product._id}`}>
              <div className='cursor-pointer relative'>
                <Image
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  width={288}
                  height={320}
                  className='h-80 w-72 object-cover rounded-t-xl'
                  priority={index < 4}
                  onError={e => {
                    // Fallback for broken images
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
                {!product.inStock && (
                  <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                    Out of Stock
                  </div>
                )}
                {product.requiresPrescription && (
                  <div className='absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                    Rx Required
                  </div>
                )}
              </div>
            </Link>

            <div className='px-4 py-3 w-72'>
              <h2 className='text-xl font-semibold text-black mb-2 truncate'>
                {product.name}
              </h2>
              <p className='text-sm text-gray-600 mb-1 line-clamp-2 h-10'>
                {product.description}
              </p>
              <p className='text-sm text-gray-600 mb-1'>
                <span className='font-semibold'>Category:</span>{' '}
                {product.category}
              </p>
              <p className='text-sm text-gray-600 mb-1'>
                <span className='font-semibold'>Brand:</span>{' '}
                {product.manufacturer}
              </p>
              <p
                className={`text-sm mb-1 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}
              >
                <span className='font-semibold'>Stock:</span>{' '}
                {product.inStock
                  ? `${product.stockQuantity} available`
                  : 'Out of Stock'}
              </p>

              <div className='flex items-center justify-between mt-3'>
                <p className='text-lg font-bold text-black'>
                  ${product.price?.toFixed(2) || '0.00'}
                </p>
                <motion.button
                  className='flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  whileHover={{ scale: product.inStock ? 1.05 : 1 }}
                  whileTap={{ scale: product.inStock ? 0.95 : 1 }}
                  disabled={!product.inStock}
                  onClick={e => {
                    e.preventDefault();
                    // Add to cart functionality here
                    console.log('Add to cart:', product.name);
                  }}
                >
                  <BiShoppingBag className='text-xl' />
                  <span className='text-sm'>
                    {product.inStock ? 'Add to Cart' : 'Unavailable'}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
