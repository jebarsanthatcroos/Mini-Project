'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BiShoppingBag } from 'react-icons/bi';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const productId = product.id || product._id;

  return (
    <motion.div
      className='w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/shop/pharmacy/${productId}`}>
        <div className='cursor-pointer relative'>
          <Image
            src={product.image || '/placeholder-product.jpg'}
            alt={product.name}
            width={288}
            height={320}
            className='h-80 w-72 object-cover rounded-t-xl'
            priority={index < 4}
            onError={e => {
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
          <span className='font-semibold'>Category:</span> {product.category}
        </p>
        <p className='text-sm text-gray-600 mb-1'>
          <span className='font-semibold'>Brand:</span> {product.manufacturer}
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
  );
}
