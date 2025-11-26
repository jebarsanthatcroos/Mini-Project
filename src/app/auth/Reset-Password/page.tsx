/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MdPassword,
  MdArrowBack,
  MdCheckCircle,
  MdError,
} from 'react-icons/md';
import { FaSpinner, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
              <div className='h-12 bg-gray-200 rounded-xl'></div>
              <div className='h-12 bg-gray-200 rounded-xl'></div>
              <div className='h-12 bg-gray-300 rounded-xl'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid && error) {
    return (
      <div className='min-h-screen bg-linear-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full'>
          <Link
            href='/auth/signin'
            className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6'
          >
            <MdArrowBack className='mr-2' />
            Back to sign in
          </Link>

          <div className='bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100'>
            <div className='mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6'>
              <MdError className='text-4xl text-red-600' />
            </div>

            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Invalid Reset Link
            </h2>

            <p className='text-gray-600 mb-6'>
              {error || 'This password reset link is invalid or has expired.'}
            </p>

            <Link
              href='/auth/forgot-password'
              className='inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200'
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className='min-h-screen bg-linear-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full'>
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100'>
            <div className='mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6'>
              <MdCheckCircle className='text-4xl text-green-600' />
            </div>

            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Password reset successfully!
            </h2>

            <p className='text-gray-600 mb-6'>
              Your password has been updated successfully. You can now sign in
              with your new password.
            </p>

            <div className='bg-green-50 rounded-lg p-4 border border-green-200 mb-6'>
              <p className='text-sm text-green-800'>
                Redirecting to sign in page in 3 seconds...
              </p>
            </div>

            <Link
              href='/auth/signin'
              className='inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200'
            >
              Go to sign in
            </Link>
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
            <div className='mx-auto h-16 w-16 bg-linear-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg'>
              <FaShieldAlt className='text-xl text-white' />
            </div>
            <h2 className='mt-6 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              Set new password
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Create a new password for your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3'>
              <MdError className='text-red-500 mt-0.5 shrink-0' />
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          {/* Form */}
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                New Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <MdPassword className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  placeholder='Enter new password'
                  suppressHydrationWarning
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  ) : (
                    <FaEye className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  )}
                </button>
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Confirm New Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <MdPassword className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  placeholder='Confirm new password'
                  suppressHydrationWarning
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  ) : (
                    <FaEye className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading || !tokenValid}
              className='w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]'
            >
              {loading ? (
                <>
                  <FaSpinner className='animate-spin -ml-1 mr-3 h-4 w-4' />
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
