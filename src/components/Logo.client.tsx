// components/Logo.client.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaRocket } from 'react-icons/fa';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showImage?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', showImage = true, className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const imageSizes = {
    sm: { width: 40, height: 40 },
    md: { width: 50, height: 50 },
    lg: { width: 60, height: 60 },
  };

  return (
    <Link href='/' className='inline-block'>
      <motion.div
        className={`flex items-center space-x-3 ${className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Text with gradient */}
        <motion.h1
          className={`font-bold ${sizeClasses[size]} bg-linear-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent flex items-center`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            whileHover={{ rotate: 180, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <FaRocket className='text-yellow-500 mr-2' />
          </motion.div>
          jebarsanthatcroos
        </motion.h1>

        {/* Profile Image */}
        {showImage && (
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className='relative'
          >
            <Image
              src='/Logo.jpg'
              alt='Jebarsan Thatcroos'
              width={imageSizes[size].width}
              height={imageSizes[size].height}
              className='rounded-full shadow-lg border-2 border-gray-200'
              priority
            />
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
};

export default Logo;
