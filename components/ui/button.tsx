import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-mono uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:pointer-events-none disabled:bg-opacity-50 border-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.8)] active:shadow-[2px_2px_0_0_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px]',
  {
    variants: {
      variant: {
        default: 'bg-orange-400 text-black border-black hover:bg-orange-300',
        destructive: 'bg-red-500 text-white border-black hover:bg-red-600',
        outline:
          'bg-transparent text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black',
        secondary: 'bg-gray-800 text-white border-white hover:bg-gray-700',
        ghost:
          'text-orange-400 hover:bg-orange-400 hover:text-black border-transparent shadow-none',
        link: 'text-orange-400 underline-offset-4 hover:underline border-transparent shadow-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
