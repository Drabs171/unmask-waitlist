'use client';

import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMagneticMouse } from '@/hooks/useMagneticMouse';

interface MagneticButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  magneticStrength?: number;
  magneticRadius?: number;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    magneticStrength = 0.3,
    magneticRadius = 100,
    children,
    className,
    disabled,
    type = 'button',
    onClick,
  }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const { ref: magneticRef, isActive, isHovering } = useMagneticMouse({
      strength: magneticStrength,
      radius: magneticRadius,
      disabled: disabled || loading || !!shouldReduceMotion,
    });

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
      primary: {
        base: 'bg-gradient-to-r from-accent to-secondary text-white font-semibold',
        hover: 'hover:from-accent-dark hover:to-secondary-dark',
        disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      },
      secondary: {
        base: 'bg-white/10 text-white font-medium border border-white/20',
        hover: 'hover:bg-white/20 hover:border-white/30',
        disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      },
      ghost: {
        base: 'bg-transparent text-white font-medium',
        hover: 'hover:bg-white/10',
        disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      },
    };

    const buttonVariants = {
      idle: {
        scale: 1,
        boxShadow: variant === 'primary' ? 
          '0 4px 14px 0 rgba(255, 107, 157, 0.15)' : 
          '0 4px 14px 0 rgba(255, 255, 255, 0.05)',
      },
      hover: shouldReduceMotion ? {
        scale: 1,
        boxShadow: variant === 'primary' ? 
          '0 8px 25px 0 rgba(255, 107, 157, 0.25)' : 
          '0 8px 25px 0 rgba(255, 255, 255, 0.1)',
      } : {
        scale: 1.05,
        boxShadow: variant === 'primary' ? 
          '0 8px 25px 0 rgba(255, 107, 157, 0.25)' : 
          '0 8px 25px 0 rgba(255, 255, 255, 0.1)',
        transition: {
          duration: 0.2,
          ease: 'easeOut' as const,
        },
      },
      active: shouldReduceMotion ? {
        scale: 1,
      } : {
        scale: 0.98,
        transition: {
          duration: 0.1,
          ease: 'easeInOut' as const,
        },
      },
    };

    const glowVariants = {
      idle: { opacity: 0, scale: 0.8 },
      hover: shouldReduceMotion ? { opacity: 0 } : {
        opacity: 0.6,
        scale: 1.1,
        transition: {
          duration: 0.3,
          ease: 'easeOut' as const,
        },
      },
    };

    const textVariants = {
      idle: { y: 0 },
      hover: shouldReduceMotion ? { y: 0 } : {
        y: -1,
        transition: {
          duration: 0.2,
          ease: 'easeOut' as const,
        },
      },
    };

    const shimmerVariants = {
      idle: { x: '-100%', opacity: 0 },
      hover: shouldReduceMotion ? { x: '-100%', opacity: 0 } : {
        x: '100%',
        opacity: [0, 1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut' as const,
        },
      },
    };

    // Combine refs
    const combinedRef = (element: HTMLButtonElement | null) => {
      if (magneticRef) {
        (magneticRef as React.MutableRefObject<HTMLButtonElement | null>).current = element;
      }
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };

    return (
      <motion.button
        ref={combinedRef}
        className={cn(
          // Base styles
          'relative overflow-hidden rounded-full transition-all duration-medium',
          'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background',
          // Size styles
          sizeClasses[size],
          // Variant styles
          variantClasses[variant].base,
          variantClasses[variant].hover,
          variantClasses[variant].disabled,
          className
        )}
        variants={buttonVariants}
        initial="idle"
        animate={
          disabled || loading ? 'idle' :
          isActive && isHovering ? 'active' :
          isHovering ? 'hover' : 'idle'
        }
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: variant === 'primary' ? 
              'linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(78, 205, 196, 0.3))' :
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            filter: 'blur(10px)',
          }}
          variants={glowVariants}
          initial="idle"
          animate={isHovering && !disabled && !loading ? 'hover' : 'idle'}
        />

        {/* Shimmer Effect */}
        {variant === 'primary' && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            variants={shimmerVariants}
            initial="idle"
            animate={isHovering && !disabled && !loading ? 'hover' : 'idle'}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ width: '200%' }}
            />
          </motion.div>
        )}

        {/* Button Content */}
        <motion.div
          className="relative z-10 flex items-center justify-center gap-2"
          variants={textVariants}
          initial="idle"
          animate={isHovering && !disabled && !loading ? 'hover' : 'idle'}
        >
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          )}
          
          <motion.span
            className="relative"
            initial={{ opacity: loading ? 0.7 : 1 }}
            animate={{ opacity: loading ? 0.7 : 1 }}
          >
            {children}
          </motion.span>
        </motion.div>

        {/* Ripple Effect on Click */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
              mixBlendMode: 'overlay',
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{
              scale: [0, 1.2],
              opacity: [0.8, 0],
              transition: { duration: 0.4, ease: 'easeOut' }
            }}
          />
        )}
      </motion.button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';

export default MagneticButton;