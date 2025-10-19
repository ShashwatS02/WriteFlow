'use client';
import React from 'react';
import { cn } from '../lib/utils';

type SkeletonLoaderProps = {
  type: 'card' | 'list' | 'text' | 'avatar' | 'button';
  className?: string;
};

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'rounded-lg bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 overflow-hidden animate-pulse',
      className
    )}>
      <div className="h-48 w-full bg-gray-200 dark:bg-slate-700" />
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex gap-6 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 animate-pulse',
      className
    )}>
      <div className="flex-shrink-0 w-48 h-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-7 w-2/3 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function TextSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-2', className)}>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
    </div>
  );
}

function AvatarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
    </div>
  );
}

function ButtonSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
    </div>
  );
}

export default function SkeletonLoader({ type, className }: SkeletonLoaderProps) {
  switch (type) {
    case 'card':
      return <CardSkeleton className={className} />;
    case 'list':
      return <ListSkeleton className={className} />;
    case 'text':
      return <TextSkeleton className={className} />;
    case 'avatar':
      return <AvatarSkeleton className={className} />;
    case 'button':
      return <ButtonSkeleton className={className} />;
    default:
      return <CardSkeleton className={className} />;
  }
}

// Export individual skeleton components
export { CardSkeleton, ListSkeleton, TextSkeleton, AvatarSkeleton, ButtonSkeleton };

// Grid skeleton wrapper
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}


