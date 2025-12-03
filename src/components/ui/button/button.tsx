import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition duration-200',
        variants[variant],
        className ?? ''
      )}
      {...props}
    />
  );
}
