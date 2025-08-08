'use client';

import React, { useState, forwardRef } from 'react';
import { InputPropsInterface } from '@/types';
import { cn } from '@/utils/cn';

const Input = forwardRef<HTMLInputElement, InputPropsInterface>(
  ({
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    error,
    disabled = false,
    className,
    required = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (onFocus) {
        onFocus();
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (onBlur) {
        onBlur();
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg',
            'focus:border-accent focus:ring-1 focus:ring-accent/50',
            'transition-all duration-medium',
            'placeholder:text-text-secondary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error/50',
            className
          )}
          {...props}
        />
        
        <div
          className={cn(
            'absolute inset-0 rounded-lg pointer-events-none',
            'bg-gradient-to-r from-accent/20 to-primary-blue/20',
            'opacity-0 transition-opacity duration-medium',
            isFocused && 'opacity-100'
          )}
        />
        
        {error && (
          <p className="mt-2 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;