import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full px-3 py-2 text-sm',
          'bg-white text-black placeholder:text-gray-400',
          'border-2 border-black rounded-none',
          'shadow-[4px_4px_0_0_rgba(0,0,0,0.8)]',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400',
          'focus:shadow-[2px_2px_0_0_rgba(0,0,0,0.8)]',
          'focus:translate-x-[2px] focus:translate-y-[2px]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
