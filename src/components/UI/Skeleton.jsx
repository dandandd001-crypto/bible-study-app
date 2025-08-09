import React from 'react';
import { cn } from '../../styles/utils.js';

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded bg-slate-200 dark:bg-slate-800', className)} />;
}
