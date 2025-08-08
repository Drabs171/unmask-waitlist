'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { ButtonPropsInterface } from '@/types';
import { cn } from '@/utils/cn';

const Button: React.FC<ButtonPropsInterface> = ({
  variant = 'gradient',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className,
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-fast focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    gradient: 'btn-gradient group relative overflow-hidden',
    ghost: 'btn-ghost',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-white',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-body-m',
    lg: 'px-8 py-4 text-body-l',
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      )}
      
      {variant === 'gradient' && !loading && (
        <>
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 bg-gradient-brand opacity-75 group-hover:opacity-100 transition-opacity rounded-lg" />
        </>
      )}
      
      {variant !== 'gradient' && children}
    </button>
  );
};

// Preset button configurations
export const ButtonPresets = {
  primary: {
    variant: 'gradient' as const,
    magneticEffect: true,
    rippleEffect: true,
    glowIntensity: 'medium' as const,
  },
  
  secondary: {
    variant: 'outline' as const,
    magneticEffect: false,
    rippleEffect: true,
    glowIntensity: 'low' as const,
  },
  
  ghost: {
    variant: 'ghost' as const,
    magneticEffect: false,
    rippleEffect: false,
    glowIntensity: 'low' as const,
  },
  
  premium: {
    variant: 'gradient' as const,
    magneticEffect: true,
    rippleEffect: true,
    glowIntensity: 'high' as const,
    hapticFeedback: true,
  },
} as const;

export default Button;