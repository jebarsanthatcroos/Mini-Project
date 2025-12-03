/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Components
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import InvalidTokenState from '@/components/auth/InvalidTokenState';
import SuccessState from '@/components/auth/ResetPasswordSuccess';
import LoadingSkeleton from '@/components/auth/LoadingSkeleton';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token = searchParams.get('token');
      if (!token) {
        setError('Invalid or missing reset token');
        setTokenValid(false);
        return;
      }
      setToken(token);
      validateToken(token);
    }
  }, [searchParams, isMounted]);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError(data.error || 'Invalid or expired reset token');
      }
    } catch (error) {
      setTokenValid(false);
      setError('Failed to validate token');
    }
  };

  const handleResetPassword = async (
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton during SSR
  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  if (!tokenValid && error) {
    return <InvalidTokenState error={error} />;
  }

  if (success) {
    return <SuccessState />;
  }

  return (
    <AuthLayout gradient='from-blue-50 to-indigo-100'>
      <ResetPasswordForm
        loading={loading}
        error={error}
        tokenValid={tokenValid}
        onSubmit={handleResetPassword}
      />
    </AuthLayout>
  );
}
