'use client';
import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';

type SearchInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  delayMs?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm pl-9',
  md: 'px-4 py-2 text-base pl-10',
  lg: 'px-5 py-3 text-lg pl-12',
};

const iconSizeClasses = {
  sm: 'h-4 w-4 left-3',
  md: 'h-5 w-5 left-3',
  lg: 'h-6 w-6 left-3',
};

export default function SearchInput({ 
  value = '', 
  onChange, 
  placeholder = 'Search posts...', 
  delayMs = 300,
  className,
  size = 'md'
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (!onChange) return;
    
    const id = setTimeout(() => {
      onChange(local);
    }, delayMs);
    return () => clearTimeout(id);
  }, [local, delayMs, onChange]);

  const handleClear = () => {
    setLocal('');
    onChange?.('');
  };

  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MagnifyingGlassIcon className={cn(
          'absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500',
          iconSizeClass
        )} />
        
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'block w-full rounded-lg border border-gray-300 dark:border-slate-600',
            'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            'transition-colors duration-200',
            sizeClass
          )}
        />
        
        {local && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 right-3 transform -translate-y-1/2',
              'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              'transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700'
            )}
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Optional: Add search suggestions or loading indicator here */}
      {isFocused && local.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to search
        </div>
      )}
    </div>
  );
}


