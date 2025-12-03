'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import { Button } from '@/components/ui/button/button';
import Image from 'next/image';

interface Post {
  _id: string;
  name: string;
  headline: string | null;
  button: string;
  title: string;
  bg: string | null;
  button_color: string | null;
  image: string;
}

export default function ProductList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    fetch(`${apiUrl}/api/products?`)
      .then(res => res.json())
      .then(data => {
        // Handle both response formats
        const postsArray = data.data || data;
        setPosts(Array.isArray(postsArray) ? postsArray : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts');
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='grid md:grid-cols-2 gap-6 p-6'>
      {posts.map((post, index) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-xl shadow-lg ${
            post.bg ? post.bg : 'bg-linear-to-r from-purple-500 to-pink-500'
          } text-white flex items-center justify-between relative`}
        >
          <div className='max-w-sm'>
            <h4 className='text-sm uppercase opacity-75'>{post.name}</h4>
            <h2 className='text-sm uppercase opacity-75'>
              {post.headline || 'Explore our featured product'}
            </h2>
            <h2 className='text-2xl font-bold whitespace-pre-line'>
              {post.title || 'Explore our featured product'}
            </h2>
            <Link
              href={`/shop/${post.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Button
                className={`${post.button_color ? post.button_color : 'bg-red-500 hover:bg-red-600'}`}
              >
                {post.button}
              </Button>
            </Link>
          </div>
          <div className='flex gap-4'>
            <Image
              src={post.image}
              alt='Product'
              width={240}
              height={260}
              className='h-65 w-60 object-contain'
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
