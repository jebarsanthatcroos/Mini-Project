'use client';
import { MdCelebration } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const OrderPlaced = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/shop');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className='h-screen flex flex-col justify-center items-center bg-linear-to-br from-yellow-50 to-pink-50'>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.8, type: 'spring' }}
        className='bg-white shadow-xl rounded-3xl p-10 flex flex-col items-center max-w-md'
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
          className='text-lg text-gray-700 mb-6 text-center'
        >
          We&apos;re celebrating your successful order. You&apos;ll receive a
          confirmation email shortly.
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'easeInOut' }}
          className='w-full bg-pink-100 rounded-full h-2 mb-6'
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
          className='text-sm text-gray-500 mb-4'
        >
          Redirecting to shop...
        </motion.p>

        <Link
          href='/shop'
          className='mt-4 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium'
        >
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  );
};

export default OrderPlaced;
