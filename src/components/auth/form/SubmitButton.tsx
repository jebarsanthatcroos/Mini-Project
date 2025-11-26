import { FcUnlock, FcOk } from 'react-icons/fc';
import { FaSpinner } from 'react-icons/fa';

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  loadingText?: string;
  defaultText?: string;
  buttonType?: 'signin' | 'signup' | 'default';
}

export default function SubmitButton({
  loading,
  disabled,
  loadingText,
  defaultText,
  buttonType = 'default',
}: SubmitButtonProps) {
  // Determine button text and icon based on type
  const getButtonContent = () => {
    if (loading) {
      const text =
        loadingText ||
        (buttonType === 'signup' ? 'Creating Account...' : 'Signing in...');
      return {
        text,
        icon: <FaSpinner className='animate-spin -ml-1 mr-3 h-4 w-4' />,
      };
    } else {
      const text =
        defaultText || (buttonType === 'signup' ? 'Create Account' : 'Sign in');
      const Icon = buttonType === 'signup' ? FcOk : FcUnlock;
      return {
        text,
        icon: <Icon className='mr-2' />,
      };
    }
  };

  const { text, icon } = getButtonContent();

  // Determine gradient based on button type
  const getGradientClass = () => {
    switch (buttonType) {
      case 'signup':
        return 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700';
      case 'signin':
        return 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';
      default:
        return 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';
    }
  };

  return (
    <button
      type='submit'
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r ${getGradientClass()} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100`}
    >
      {icon}
      {text}
    </button>
  );
}
