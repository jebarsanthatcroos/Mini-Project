// components/Logo.static.tsx
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showImage?: boolean;
  className?: string;
}

const LogoStatic = ({
  size = 'md',
  showImage = true,
  className = '',
}: LogoProps) => {
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
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Text with gradient */}
        <h1
          className={`font-bold ${sizeClasses[size]} bg-linear-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent flex items-center`}
        >
          jebarsanthatcroos
        </h1>

        {/* Profile Image */}
        {showImage && (
          <div className='relative'>
            <Image
              src='/Logo.jpg'
              alt='Jebarsan Thatcroos'
              width={imageSizes[size].width}
              height={imageSizes[size].height}
              className='rounded-full shadow-lg border-2 border-gray-200'
              priority
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default LogoStatic;
