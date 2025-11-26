import Logo from '@/components/Logo';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className='text-center'>
      <Logo />
      <h2 className='mt-6 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
        {title}
      </h2>
      <p className='mt-2 text-sm text-gray-600'>{subtitle}</p>
    </div>
  );
}
