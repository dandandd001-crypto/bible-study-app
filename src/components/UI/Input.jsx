import React from 'react';
import { cn } from '../../styles/utils.js';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-10 px-3 rounded-md border bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500',
        className
      )}
      {...props}
    />
  );
}
