'use client';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string[];
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product._id}/review`}>
      <div className='border rounded-lg overflow-hidden hover:shadow-lg transition'>
        <div className='bg-gray-100'>
          <Image
            src={product.image[0]}
            alt={product.name || 'products'}
            className='w-full h-48 object-cover'
          />
        </div>
        <div className='p-4'>
          <h3 className='text-lg font-semibold'>{product.name}</h3>
          <p className='text-orange-600 font-bold mt-1'>Rs.{product.price}</p>
        </div>
      </div>
    </Link>
  );
}
