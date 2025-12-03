// components/Logo.static.tsx
import Image from 'next/image';
import Link from 'next/link';
import {
  FaHeartbeat,
  FaStethoscope,
  FaShieldAlt,
  FaBriefcaseMedical,
  FaClinicMedical,
} from 'react-icons/fa';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showImage?: boolean;
  className?: string;
  variant?: 'health' | 'modern' | 'minimal' | 'professional' | 'medical';
}

const LogoStatic = ({
  size = 'md',
  showImage = true,
  className = '',
  variant = 'health',
}: LogoProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // Healthcare Brand Design
  const HealthLogo = () => (
    <div className='flex items-center space-x-3'>
      {/* Medical Icon with Pulse */}
      <div className='relative'>
        <div className='w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
          <FaHeartbeat className={`text-white ${iconSizes[size]}`} />
        </div>
        <div className='absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center'>
          <div className='w-1.5 h-1.5 bg-white rounded-full'></div>
        </div>
      </div>

      {/* Company Name */}
      <div className='flex flex-col'>
        <h1
          className={`font-bold ${sizeClasses[size]} bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
        >
          Jebarsan thatcroos
        </h1>
        <p className='text-xs text-gray-600 font-medium'>Medical Solutions</p>
      </div>
    </div>
  );

  // Professional Medical Design
  const MedicalLogo = () => (
    <div className='flex items-center space-x-3 bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl px-4 py-3 border border-blue-100'>
      {/* Stethoscope Icon */}
      <div className='relative'>
        <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-200'>
          <FaStethoscope className='text-blue-600 text-lg' />
        </div>
      </div>

      {/* Company Name */}
      <div className='flex flex-col'>
        <h1 className={`font-bold ${sizeClasses[size]} text-gray-900`}>
          Jebarsanthatcroos
        </h1>
        <p className='text-xs text-blue-600 font-semibold'>
          Healthcare Provider
        </p>
      </div>
    </div>
  );

  // Modern Corporate Design
  const ModernLogo = () => (
    <div className='flex items-center space-x-3'>
      {/* Shield Icon for Trust */}
      <div className='relative'>
        <div className='w-12 h-12 bg-linear-to-br from-gray-900 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg'>
          <FaShieldAlt className='text-white text-xl' />
        </div>
      </div>

      {/* Company Name */}
      <div className='flex flex-col'>
        <h1 className={`font-bold ${sizeClasses[size]} text-gray-900`}>
          Jebarsanthatcroos
        </h1>
        <p className='text-xs text-gray-500 font-medium'>Trusted Solutions</p>
      </div>
    </div>
  );

  const MinimalLogo = () => (
    <div className='flex items-center space-x-3'>
      {/* Briefcase Medical Icon */}
      <div className='w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md'>
        <FaBriefcaseMedical className='text-white text-sm' />
      </div>

      <div>
        <h1 className={`font-semibold ${sizeClasses[size]} text-gray-800`}>
          Jebarsan Thacroos
        </h1>
        <p className='text-xs text-gray-500'>Healthcare</p>
      </div>
    </div>
  );

  const ProfessionalLogo = () => (
    <div className='flex items-center space-x-4 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100'>
      <div className='relative'>
        <div className='w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center'>
          <FaClinicMedical className='text-white text-xl' />
        </div>
      </div>

      <div className='flex flex-col'>
        <h1 className={`font-bold ${sizeClasses[size]} text-gray-900`}>
          jebarsan Thatcroos
        </h1>
        <p className='text-xs text-cyan-600 font-semibold'>
          Medical Excellence
        </p>
      </div>
    </div>
  );

  // Choose which logo variant to render
  const renderLogo = () => {
    switch (variant) {
      case 'health':
        return <HealthLogo />;
      case 'medical':
        return <MedicalLogo />;
      case 'modern':
        return <ModernLogo />;
      case 'minimal':
        return <MinimalLogo />;
      case 'professional':
        return <ProfessionalLogo />;
      default:
        return <HealthLogo />;
    }
  };

  return (
    <Link
      href='/'
      className='inline-block hover:opacity-90 transition-opacity duration-200'
    >
      <div className={className}>
        {renderLogo()}

        {/* Optional Profile Image */}
        {showImage && variant === 'health' && (
          <div className='absolute top-2 right-2'>
            <Image
              src='/Logo.jpg'
              alt='Jebarsan Thatcroos'
              width={32}
              height={32}
              className='rounded-full shadow-lg border-2 border-white'
              priority
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default LogoStatic;
