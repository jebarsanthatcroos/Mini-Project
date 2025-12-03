'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  FaExclamationTriangle,
  FaRedo,
  FaHome,
  FaArrowLeft,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReset?: boolean;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showStackTrace: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showStackTrace: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      showStackTrace: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to error monitoring service (e.g., Sentry, LogRocket)
    if (process.env.NEXT_PUBLIC_LOG_ERRORS === 'true') {
      this.logErrorToService(error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    console.log('Error logged to service:', { error, errorInfo });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      showStackTrace: false,
    });
  };

  toggleStackTrace = (): void => {
    this.setState(prev => ({ showStackTrace: !prev.showStackTrace }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-pink-100 p-4'
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className='max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center'
            >
              {/* Error Icon */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className='w-20 h-20 mx-auto mb-6 bg-linear-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center'
              >
                <FaExclamationTriangle className='w-10 h-10 text-red-500' />
              </motion.div>

              {/* Error Title */}
              <h2 className='text-2xl font-bold text-gray-800 mb-3'>
                Oops! Something went wrong
              </h2>

              {/* Error Message */}
              <div className='mb-6 p-4 bg-red-50 rounded-lg'>
                <p className='text-red-700 font-medium'>
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className='space-y-4'>
                {this.props.showReset !== false && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={this.resetError}
                    className='w-full px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center gap-2'
                  >
                    <FaRedo className='w-4 h-4' />
                    Try again
                  </motion.button>
                )}

                <div className='grid grid-cols-2 gap-3'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.reload()}
                    className='px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 flex items-center justify-center gap-2'
                  >
                    <FaRedo className='w-4 h-4' />
                    Reload
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.history.back()}
                    className='px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 flex items-center justify-center gap-2'
                  >
                    <FaArrowLeft className='w-4 h-4' />
                    Go Back
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => (window.location.href = '/')}
                  className='w-full px-4 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 flex items-center justify-center gap-2'
                >
                  <FaHome className='w-4 h-4' />
                  Go to Home
                </motion.button>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: this.state.showStackTrace ? 1 : 0,
                    height: this.state.showStackTrace ? 'auto' : 0,
                  }}
                  className='mt-6 overflow-hidden'
                >
                  <button
                    onClick={this.toggleStackTrace}
                    className='w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200'
                  >
                    {this.state.showStackTrace ? 'Hide' : 'Show'} Error Details{' '}
                    (Development Only)
                  </button>

                  {this.state.showStackTrace && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg text-left overflow-auto max-h-64'
                    >
                      <div className='text-xs font-mono'>
                        <div className='text-red-400 mb-2'>Error Stack:</div>
                        <pre className='whitespace-pre-wrap wrap-break-word'>
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Error ID for tracking */}
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <p className='text-xs text-gray-500'>
                  Error ID: {Date.now().toString(36)}-
                  {Math.random().toString(36).substr(2, 9)}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  If this error persists, please contact support with the Error
                  ID.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}
