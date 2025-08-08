'use client';

import React, { useState, forwardRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ValidationState } from '@/hooks/useRealTimeValidation';

export interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  validationState?: ValidationState;
  error?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    type = 'text',
    placeholder,
    value = '',
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    required = false,
    className,
    icon: Icon,
    validationState = 'idle',
    error,
    suggestions = [],
    onSuggestionSelect,
    label,
    helperText,
    size = 'md',
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const inputId = useId();

    const sizeClasses = {
      sm: {
        input: 'px-3 py-2 text-sm',
        icon: 'w-4 h-4',
        iconContainer: 'left-2',
        withIcon: 'pl-8',
      },
      md: {
        input: 'px-4 py-3 text-base',
        icon: 'w-5 h-5',
        iconContainer: 'left-3',
        withIcon: 'pl-11',
      },
      lg: {
        input: 'px-5 py-4 text-lg',
        icon: 'w-6 h-6',
        iconContainer: 'left-4',
        withIcon: 'pl-12',
      },
    };

    const getStateStyles = () => {
      switch (validationState) {
        case 'validating':
          return {
            border: 'border-yellow-500/50',
            ring: 'focus:ring-yellow-500/30',
            glow: 'shadow-glow-yellow',
          };
        case 'valid':
          return {
            border: 'border-success/60',
            ring: 'focus:ring-success/30',
            glow: 'shadow-glow-green',
          };
        case 'invalid':
          return {
            border: 'border-error/60',
            ring: 'focus:ring-error/30',
            glow: 'shadow-glow-red',
          };
        default:
          return {
            border: 'border-white/20',
            ring: 'focus:ring-accent/30',
            glow: 'shadow-glow-pink',
          };
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleFocus = () => {
      setIsFocused(true);
      setShowSuggestions(suggestions.length > 0);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      setTimeout(() => setShowSuggestions(false), 150); // Delay to allow suggestion clicks
      onBlur?.();
    };

    const handleSuggestionClick = (suggestion: string) => {
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
    };

    const stateStyles = getStateStyles();

    const containerVariants = {
      idle: { scale: 1 },
      focused: shouldReduceMotion ? { scale: 1 } : { 
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' as const }
      },
      error: shouldReduceMotion ? { scale: 1 } : {
        x: [-2, 2, -2, 2, 0],
        transition: { duration: 0.4, ease: 'easeInOut' as const }
      },
    };

    const labelVariants = {
      static: { 
        y: 0, 
        scale: 1, 
        color: 'rgba(160, 160, 160, 1)' 
      },
      floating: { 
        y: -24, 
        scale: 0.85, 
        color: isFocused ? '#FF6B9D' : 'rgba(160, 160, 160, 1)' 
      },
    };

    const glowVariants = {
      idle: { opacity: 0, scale: 0.8 },
      focused: shouldReduceMotion ? { opacity: 0 } : {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' as const }
      },
    };

    return (
      <div className={cn('relative', className)}>
        {/* Input Container */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="idle"
          animate={
            error && validationState === 'invalid' ? 'error' :
            isFocused ? 'focused' : 'idle'
          }
        >
          {/* Floating Label */}
          {label && (
            <motion.label
              htmlFor={inputId}
              className="absolute left-4 pointer-events-none z-10 bg-background/80 px-1 backdrop-blur-sm"
              variants={labelVariants}
              initial="static"
              animate={isFocused || value ? 'floating' : 'static'}
              transition={shouldReduceMotion ? {} : { 
                duration: 0.2, 
                ease: 'easeOut' as const 
              }}
            >
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </motion.label>
          )}

          {/* Background Glow */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-lg blur-lg',
              stateStyles.glow
            )}
            variants={glowVariants}
            initial="idle"
            animate={isFocused ? 'focused' : 'idle'}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(78, 205, 196, 0.1))',
            }}
          />

          {/* Main Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            placeholder={isFocused || !label ? placeholder : ''}
            className={cn(
              // Base styles
              'w-full bg-white/5 backdrop-blur-md border rounded-lg',
              'text-white placeholder:text-text-secondary',
              'transition-all duration-medium focus:outline-none',
              // Size styles
              sizeClasses[size].input,
              Icon ? sizeClasses[size].withIcon : '',
              // State styles
              stateStyles.border,
              `focus:${stateStyles.ring}`,
              isFocused && !shouldReduceMotion ? 'focus:ring-2' : '',
              // Disabled styles
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
              // Validation styles
              validationState === 'valid' ? 'pr-10' : '',
              validationState === 'invalid' ? 'pr-10' : '',
              validationState === 'validating' ? 'pr-10' : '',
            )}
            {...props}
          />

          {/* Icon */}
          {Icon && (
            <div className={cn(
              'absolute top-1/2 transform -translate-y-1/2 pointer-events-none z-10',
              sizeClasses[size].iconContainer
            )}>
              <Icon className={cn(
                sizeClasses[size].icon,
                'text-text-secondary transition-colors duration-medium',
                isFocused ? 'text-accent' : ''
              )} />
            </div>
          )}

          {/* Validation Indicator */}
          <AnimatePresence mode="wait">
            {validationState !== 'idle' && (
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {validationState === 'validating' && (
                  <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                )}
                {validationState === 'valid' && (
                  <Check className="w-5 h-5 text-success" />
                )}
                {validationState === 'invalid' && (
                  <AlertCircle className="w-5 h-5 text-error" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Border Gradient */}
          {isFocused && !shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 107, 157, 0.5), transparent)',
                maskImage: 'linear-gradient(0deg, transparent 2px, black 2px)',
                WebkitMaskImage: 'linear-gradient(0deg, transparent 2px, black 2px)',
              }}
            >
              <motion.div
                className="w-full h-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear' as const,
                }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 107, 157, 0.8), transparent)',
                  width: '200%',
                }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 z-20"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-background/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2">
                  <p className="text-xs text-text-secondary mb-2 px-2">
                    Did you mean?
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-white hover:bg-accent/20 transition-colors duration-150"
                      onClick={() => handleSuggestionClick(suggestion)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={shouldReduceMotion ? {} : { x: 2 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-2 text-sm text-error flex items-center gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;