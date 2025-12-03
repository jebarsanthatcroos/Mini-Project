'use client';

import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

interface ErrorFallbackProps {
  error?: Error;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReset?: () => void;
  showRetry?: boolean;
}

export default function ErrorFallback({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  onReset,
  showRetry = true,
}: ErrorFallbackProps) {
  return (
    <div className='rounded-lg border border-red-200 bg-red-50 p-6 my-4'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0'>
          <FaExclamationCircle className='h-6 w-6 text-red-500' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-red-800'>{title}</h3>
          <div className='mt-2 text-red-700'>
            <p>{message || error?.message || 'An unexpected error occurred'}</p>
          </div>
          {showRetry && (
            <div className='mt-4 flex gap-3'>
              {onRetry && (
                <button
                  type='button'
                  onClick={onRetry}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors'
                >
                  Try again
                </button>
              )}
              {onReset && (
                <button
                  type='button'
                  onClick={onReset}
                  className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
