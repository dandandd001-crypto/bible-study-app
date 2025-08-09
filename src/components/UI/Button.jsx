import React from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../styles/utils.js';

const buttonVariants = tv({
  base:
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none',
  variants: {
    variant: {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      outline: 'border bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    },
    size: {
      sm: 'h-9 px-3',
      md: 'h-10 px-4',
      lg: 'h-11 px-6',
      xs: 'h-7 px-2 text-xs',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
