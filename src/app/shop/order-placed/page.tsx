'use client';
import { MdCelebration } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Error from '@/components/Error';

const OrderPlaced = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/';
    fetch(`${apiUrl}/orders`)
      .then(res => res.json())
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts');
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  return (
    <div className='h-screen flex flex-col justify-center items-center bg-linear-to-tr from-yellow-50 to-pink-50'>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.8, type: 'spring' }}
        className='bg-white shadow-xl rounded-3xl p-10 flex flex-col items-center'
      >
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <MdCelebration className='text-pink-500 text-7xl mb-4 drop-shadow-lg' />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className='text-3xl font-extrabold text-pink-700 mb-2'
        >
          Order Confirmed!
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className='text-lg text-gray-700 mb-6'
        >
          We’re celebrating your successful order.
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          className='w-full bg-pink-100 rounded-full h-2 mb-3'
        >
          <div
            className='bg-pink-400 h-2 rounded-full'
            style={{ width: '100%' }}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className='text-sm text-gray-500'
        >
          Redirecting to your orders...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OrderPlaced;
