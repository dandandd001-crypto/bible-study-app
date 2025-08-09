import React from 'react';
import { cn } from '../../styles/utils.js';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[120px] p-3 rounded-md border bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500',
        className
      )}
      {...props}
    />
  );
}
