'use client';

import { JSX, useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        id: Math.random().toString(36).substr(2, 9),
        ...event.detail,
      };
      setToasts(prev => [...prev, toast]);
    };

    window.addEventListener('showToast', handleToast as EventListener);
    return () =>
      window.removeEventListener('showToast', handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className='h-5 w-5 text-green-500' />;
      case 'error':
        return <FaExclamationTriangle className='h-5 w-5 text-red-500' />;
      case 'warning':
        return <FaExclamationTriangle className='h-5 w-5 text-yellow-500' />;
      case 'info':
        return <FaInfoCircle className='h-5 w-5 text-blue-500' />;
      default:
        return <FaInfoCircle className='h-5 w-5 text-gray-500' />;
    }
  };

  const getBackgroundColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          getIcon={getIcon}
          getBackgroundColor={getBackgroundColor}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  getIcon: (type: Toast['type']) => JSX.Element;
  getBackgroundColor: (type: Toast['type']) => string;
}

function ToastItem({
  toast,
  onRemove,
  getIcon,
  getBackgroundColor,
}: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`animate-fade-in flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-80 ${getBackgroundColor(toast.type)}`}
    >
      {getIcon(toast.type)}
      <span className='flex-1 text-sm font-medium text-gray-900'>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
      >
        <FaTimes className='h-4 w-4' />
      </button>
    </div>
  );
}

// Utility function to show toasts
export const showToast = (
  message: string,
  type: Toast['type'] = 'success',
  duration?: number
) => {
  const event = new CustomEvent('showToast', {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
};
