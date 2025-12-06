'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { z } from 'zod';

// Components
import AuthLayout from '@/components/auth/AuthLayout';
import OAuthButtons from '@/components/auth/OAuthButtons';
import SignInForm from '@/components/auth/SignInForm';
import StatusMessage from '@/components/ui/StatusMessage';
import Loading from '@/components/Loading';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthDivider from '@/components/auth/AuthDivider';

// Validation schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signInSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isMounted) {
      router.push(callbackUrl);
    }
  }, [user, callbackUrl, router, isMounted]);

  // Show success message
  useEffect(() => {
    if (message && isMounted) {
      setSuccess(message);
    }
  }, [message, isMounted]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account';
      case 'CredentialsSignin':
        return 'Invalid email or password';
      case 'Configuration':
        return 'There is a problem with the server configuration';
      case 'AccessDenied':
        return 'Access denied. Please contact support.';
      case 'Verification':
        return 'Verification required. Please check your email.';
      default:
        return 'An error occurred during sign in';
    }
  };

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(getErrorMessage(result.error));
      } else {
        setSuccess('Sign in successful! Redirecting...');
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1000);
      }
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setSuccess('');
    await signIn(provider, { callbackUrl });
  };

  // Show loading skeleton during SSR
  if (!isMounted) {
    return <Loading />;
  }

  return (
    <AuthLayout>
      {/* Back Button */}
      <Link
        href='/'
        className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6'
      >
        <BackIcon className='mr-2' />
        Back to home
      </Link>

      {/* Card */}
      <div className='bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100'>
        {/* Header */}
        <AuthHeader
          title='Log in or sign up'
          subtitle='you can connect with us'
        />
        {/* Error/Success Messages */}
        {error && (
          <StatusMessage type='error' message={getErrorMessage(error)} />
        )}

        {success && <StatusMessage type='success' message={success} />}

        {/* OAuth Buttons */}
        <OAuthButtons
          onGoogleSignIn={() => handleOAuthSignIn('google')}
          onGithubSignIn={() => handleOAuthSignIn('github')}
          loading={loading}
        />

        {/* Divider */}
        <AuthDivider />

        {/* Credentials Form */}
        <SignInForm onSubmit={handleSignIn} loading={loading} />
      </div>
    </AuthLayout>
  );
}

// Simple icon components
const BackIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    width='16'
    height='16'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M10 19l-7-7m0 0l7-7m-7 7h18'
    />
  </svg>
);
