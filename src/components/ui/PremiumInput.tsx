'use client';

import React, { useState, forwardRef, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { InputPropsInterface } from '@/types';
import { cn } from '@/utils/cn';

interface PremiumInputProps extends InputPropsInterface {
  label?: string;
  floatingLabel?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  validation?: {
    pattern?: RegExp;
    message?: string;
    required?: boolean;
  };
  showValidationIcon?: boolean;
  animatedBorder?: boolean;
  glowEffect?: boolean;
  breathingAnimation?: boolean;
  autoResize?: boolean; // For textarea-like behavior
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({
    type = 'text',
    placeholder,
    value = '',
    onChange,
    onBlur,
    onFocus,
    error,
    disabled = false,
    className,
    required = false,
    label,
    floatingLabel = false,
    showCharacterCount = false,
    maxLength,
    validation,
    showValidationIcon = true,
    animatedBorder = true,
    glowEffect = true,
    breathingAnimation = false,
    autoResize = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [localError, setLocalError] = useState<string>('');
    const [characterCount, setCharacterCount] = useState(0);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const shouldReduceMotion = useReducedMotion();

    // Combine refs
    const combinedRef = useCallback((node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // Update character count
    useEffect(() => {
      setCharacterCount(typeof value === 'string' ? value.length : 0);
    }, [value]);

    // Validate input on change
    useEffect(() => {
      if (validation && value) {
        const isValidInput = validation.pattern ? validation.pattern.test(value.toString()) : true;
        const isRequiredMet = validation.required ? value.toString().length > 0 : true;
        
        setIsValid(isValidInput && isRequiredMet);
        
        if (!isValidInput && validation.message) {
          setLocalError(validation.message);
        } else if (!isRequiredMet) {
          setLocalError('This field is required');
        } else {
          setLocalError('');
        }
      } else if (validation?.required && !value) {
        setIsValid(false);
        setLocalError('This field is required');
      } else {
        setIsValid(null);
        setLocalError('');
      }
    }, [value, validation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Respect maxLength
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      
      // Trigger shake animation on error
      if (error || localError) {
        setAnimationKey(prev => prev + 1);
      }
      
      if (onChange) {
        onChange(newValue);
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

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const hasError = !!(error || localError);
    const displayError = error || localError;
    const showFloatingLabel = floatingLabel && (isFocused || value);
    const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    // Animation variants
    const containerVariants = {
      idle: {
        scale: 1,
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      focused: {
        scale: !shouldReduceMotion ? 1.01 : 1,
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      error: {
        x: shouldReduceMotion ? 0 : [-4, 4, -4, 4, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    };

    const labelVariants = {
      default: {
        scale: 1,
        y: 0,
        color: '#9CA3AF',
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      floating: {
        scale: 0.85,
        y: -24,
        color: isFocused ? '#FF6B9D' : '#9CA3AF',
        transition: { duration: 0.2, ease: 'easeOut' },
      },
    };

    const borderVariants = {
      idle: {
        pathLength: 0,
        opacity: 0,
        transition: { duration: 0.2 },
      },
      focused: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    };

    const validationIconVariants = {
      hidden: { scale: 0, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { type: 'spring', stiffness: 200 }
      },
    };

    return (
      <div className="relative">
        {/* Static Label */}
        {label && !floatingLabel && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <motion.div
          className="relative"
          variants={containerVariants}
          animate={
            hasError 
              ? 'error' 
              : isFocused 
                ? 'focused' 
                : 'idle'
          }
          key={animationKey}
        >
          {/* Background Glow Effect */}
          {glowEffect && isFocused && !shouldReduceMotion && (
            <motion.div
              className={cn(
                'absolute inset-0 rounded-lg blur-md -z-10',
                hasError 
                  ? 'bg-red-500/20' 
                  : isValid 
                    ? 'bg-green-500/20'
                    : 'bg-accent/20'
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Main Input */}
          <input
            ref={combinedRef}
            type={actualType}
            placeholder={floatingLabel ? '' : placeholder}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            className={cn(
              'w-full px-4 py-3 bg-white/5 border rounded-lg',
              'focus:ring-2 focus:ring-offset-0',
              'transition-all duration-300',
              'placeholder:text-text-secondary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-white',
              floatingLabel && 'pt-6 pb-2',
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                : isValid 
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50'
                  : 'border-white/20 focus:border-accent focus:ring-accent/50',
              showValidationIcon && (type !== 'password') && 'pr-10',
              type === 'password' && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                'absolute left-4 pointer-events-none select-none',
                'transform-gpu origin-left',
                showFloatingLabel ? 'top-1' : 'top-3'
              )}
              variants={labelVariants}
              animate={showFloatingLabel ? 'floating' : 'default'}
            >
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </motion.label>
          )}

          {/* Animated Border */}
          {animatedBorder && isFocused && !shouldReduceMotion && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <motion.rect
                x="1"
                y="1"
                width="98"
                height="98"
                rx="6"
                fill="none"
                stroke={
                  hasError 
                    ? '#EF4444' 
                    : isValid 
                      ? '#10B981' 
                      : '#FF6B9D'
                }
                strokeWidth="0.5"
                variants={borderVariants}
                initial="idle"
                animate="focused"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}

          {/* Password Toggle */}
          {type === 'password' && (
            <motion.button
              type="button"
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2',
                'text-text-secondary hover:text-white',
                'focus:outline-none focus:text-accent',
                'transition-colors duration-200'
              )}
              onClick={togglePasswordVisibility}
              whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
              whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div
                    key="hide"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  >
                    <EyeOff className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="show"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Validation Icon */}
          {showValidationIcon && type !== 'password' && isValid !== null && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              variants={validationIconVariants}
              initial="hidden"
              animate="visible"
            >
              {isValid ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
            </motion.div>
          )}

          {/* Breathing Animation */}
          {breathingAnimation && !isFocused && !shouldReduceMotion && !hasError && (
            <motion.div
              className="absolute inset-0 border border-accent/30 rounded-lg pointer-events-none"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.01, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <motion.div
            className={cn(
              'flex justify-end mt-1 text-xs',
              characterCount > maxLength * 0.8
                ? characterCount >= maxLength
                  ? 'text-red-400'
                  : 'text-yellow-400'
                : 'text-text-secondary'
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {characterCount}/{maxLength}
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {displayError && (
            <motion.div
              className="flex items-center gap-2 mt-2 text-sm text-red-400"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{displayError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {isValid && !displayError && validation && (
            <motion.div
              className="flex items-center gap-2 mt-2 text-sm text-green-400"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Valid input</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';

// Preset configurations
export const InputPresets = {
  default: {
    animatedBorder: true,
    glowEffect: true,
    showValidationIcon: true,
  },
  
  minimal: {
    animatedBorder: false,
    glowEffect: false,
    showValidationIcon: false,
  },
  
  premium: {
    floatingLabel: true,
    animatedBorder: true,
    glowEffect: true,
    showValidationIcon: true,
    breathingAnimation: true,
  },
  
  email: {
    type: 'email' as const,
    floatingLabel: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
      required: true,
    },
    showValidationIcon: true,
  },
  
  password: {
    type: 'password' as const,
    floatingLabel: true,
    validation: {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      required: true,
    },
    showValidationIcon: true,
  },
} as const;

export default PremiumInput;
export type { PremiumInputProps };