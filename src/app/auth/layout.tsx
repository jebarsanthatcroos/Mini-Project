import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import AuthHeader from '@/components/authHeader';

export const metadata: Metadata = {
  title: 'Authentication - jebarsanthatcroos',
  description:
    'Sign in or create an account to access your jebarsanthatcroos dashboard and services.',
  keywords: 'authentication, sign in, sign up, login, register, account',
};

export default function AuthLayout({
  children,
}: {
  // eslint-disable-next-line no-undef
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50'>
      <AuthHeader />

      {children}

      {/* Footer */}
      <Footer />
    </div>
  );
}
