'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

// Components
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import OAuthButtons from '@/components/auth/OAuthButtons';
import AuthDivider from '@/components/auth/AuthDivider';
import SignUpForm from '@/components/auth/SignUpForm';
import StatusMessage from '@/components/ui/StatusMessage';
import LoadingSkeleton from '@/components/auth/LoadingSkeleton';
import TermsAndPrivacy from '@/components/auth/TermsAndPrivacy';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const message = searchParams.get('message');
  const oauthError = searchParams.get('error');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (message) {
      setSuccess(message);
    }
  }, [message]);

  useEffect(() => {
    if (oauthError) {
      // eslint-disable-next-line react-hooks/immutability
      setError(getOAuthErrorMessage(oauthError));
    }
  }, [oauthError]);

  const getOAuthErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error occurred during OAuth sign in. Please try again.';
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in with your original provider.';
      case 'EmailSignin':
        return 'Error occurred during email sign in. Please check your email.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      case 'AccountDisabled':
        return 'Your account has been disabled. Please contact support.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      console.error(`${provider} sign in error:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleSignUpSuccess = (message: string) => {
    setSuccess(message);
    setError('');
  };

  const handleSignUpError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  };

  // Show loading skeleton during SSR
  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  return (
    <AuthLayout gradient='from-purple-50 to-blue-100'>
      {/* Back Button */}
      <Link
        href='/'
        className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200'
      >
        <BackIcon className='mr-2' />
        Back to home
      </Link>

      {/* Card */}
      <div className='bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100'>
        {/* Header */}
        <AuthHeader
          title='Join with us today'
          subtitle='Create your account to get started'
        />

        {/* Error Message */}
        {error && <StatusMessage type='error' message={error} />}

        {/* Success Message */}
        {success && <StatusMessage type='success' message={success} />}

        {/* OAuth Buttons */}
        <OAuthButtons
          onGoogleSignIn={() => handleOAuthSignUp('google')}
          onGithubSignIn={() => handleOAuthSignUp('github')}
          loading={loading}
        />

        {/* Divider */}
        <AuthDivider />

        {/* Registration Form */}
        <SignUpForm
          onSuccess={handleSignUpSuccess}
          onError={handleSignUpError}
          onLoadingChange={setLoading}
        />

        {/* Sign In Link */}
        <div className='text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link
              href='/auth/signin'
              className='font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200'
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Terms and Privacy */}
        <TermsAndPrivacy />
      </div>
    </AuthLayout>
  );
}

// Simple icon component
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
