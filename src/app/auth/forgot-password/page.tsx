/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  MdEmail,
  MdArrowBack,
  MdCheckCircle,
  MdError,
  MdCheck,
} from 'react-icons/md';
import { FaSpinner, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import Logo from '@/components/Logo';

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const watchEmail = watch('email');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    clearErrors();

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email.toLowerCase() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton during SSR
  if (!isMounted) {
    return (
      <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full'>
          <div className='animate-pulse mb-6'>
            <div className='h-4 w-20 bg-gray-300 rounded'></div>
          </div>
          <div className='bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100'>
            <div className='text-center'>
              <div className='mx-auto h-16 w-16 bg-gray-300 rounded-full mb-4'></div>
              <div className='h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2 mx-auto'></div>
            </div>
            <div className='space-y-4'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-12 bg-gray-200 rounded-xl'></div>
              <div className='h-12 bg-gray-300 rounded-xl'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className='min-h-screen bg-linear-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full'>
          <Link
            href='/auth/signin'
            className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6'
          >
            <MdArrowBack className='mr-2' />
            Back to sign in
          </Link>

          <div className='bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100'>
            <div className='mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6'>
              <MdCheckCircle className='text-4xl text-green-600' />
            </div>

            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Check your email
            </h2>

            <p className='text-gray-600 mb-2'>
              We&apos;ve sent a password reset link to:
            </p>
            <p className='text-gray-900 font-medium mb-6'>{watchEmail}</p>

            <p className='text-sm text-gray-500 mb-6'>
              The link will expire in 1 hour. If you don&apos;t see the email,
              check your spam folder.
            </p>

            <div className='mt-6'>
              <Link
                href='/auth/signin'
                className='inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200'
              >
                Return to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        {/* Back Button */}
        <Link
          href='/auth/signin'
          className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6'
        >
          <MdArrowBack className='mr-2' />
          Back to sign in
        </Link>

        {/* Card */}
        <div className='bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100'>
          {/* Header */}
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <Logo />
            </div>
            <div className='mx-auto h-16 w-16 bg-linear-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg mb-4'>
              <FaShieldAlt className='text-xl text-white' />
            </div>
            <h2 className='text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              Reset your password
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </p>
          </div>

          {/* Warning Message */}
          <div className='rounded-lg bg-yellow-50 p-4 border border-yellow-200 flex items-start space-x-3'>
            <FaExclamationTriangle className='text-yellow-500 mt-0.5 shrink-0' />
            <p className='text-yellow-800 text-sm'>
              You will receive an email with a password reset link. This link
              will expire in 1 hour.
            </p>
          </div>

          {/* Form */}
          <form
            className='space-y-6'
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <MdEmail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  type='email'
                  autoComplete='email'
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder='Enter your email address'
                  suppressHydrationWarning
                  {...register('email')}
                />
                {!errors.email && watchEmail && (
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <MdCheck className='h-5 w-5 text-green-500' />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className='mt-1 text-sm text-red-600 flex items-center'>
                  <FaExclamationTriangle className='mr-1 text-xs' />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Root Error Message */}
            {errors.root && (
              <div className='rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3'>
                <MdError className='text-red-500 mt-0.5 shrink-0' />
                <p className='text-red-800 text-sm'>{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading || !isDirty || !isValid}
              className='w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]'
            >
              {loading ? (
                <>
                  <FaSpinner className='animate-spin -ml-1 mr-3 h-4 w-4' />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>

            {/* Help Text */}
            <div className='text-center'>
              <p className='text-sm text-gray-600'>
                Remember your password?{' '}
                <Link
                  href='/auth/signin'
                  className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
