import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface ErrorComponentProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorComponent({
  message,
  onRetry,
}: ErrorComponentProps) {
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='max-w-md w-full bg-red-50 border border-red-200 rounded-xl p-8 text-center'>
        <div className='flex justify-center mb-4'>
          <FiAlertTriangle className='w-12 h-12 text-red-500' />
        </div>

        <h2 className='text-xl font-semibold text-red-800 mb-2'>
          Something went wrong
        </h2>

        <p className='text-red-700 mb-6 opacity-90'>{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className='flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
          >
            <FiRefreshCw className='w-4 h-4' />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
