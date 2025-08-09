'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, CheckCircle2, AlertCircle, X, LucideIcon } from 'lucide-react';

interface MobileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'filled' | 'outline';
  showCharacterCount?: boolean;
  maxLength?: number;
  clearable?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  touchOptimized?: boolean;
  smartKeyboard?: boolean;
  hapticFeedback?: boolean;
}

const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  success,
  loading,
  icon: Icon,
  size = 'md',
  variant = 'default',
  showCharacterCount = false,
  maxLength,
  clearable = false,
  suggestions = [],
  onSuggestionSelect,
  touchOptimized = true,
  smartKeyboard = true,
  hapticFeedback = true,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const hasValue = Boolean(value && String(value).length > 0);
  const isPassword = type === 'password';
  const hasError = Boolean(error);
  const characterCount = String(value || '').length;

  // Size variants with touch optimization
  const sizeVariants = {
    sm: touchOptimized 
      ? 'h-touch-target px-touch-sm text-base' // enforce >=16px to prevent iOS zoom
      : 'h-10 px-3 text-sm',
    md: touchOptimized
      ? 'h-touch-target-lg px-touch-md text-base' // enforce >=16px on iOS
      : 'h-12 px-4 text-base',
    lg: touchOptimized
      ? 'h-touch-target-xl px-touch-lg text-lg'
      : 'h-14 px-6 text-lg',
  };

  // Handle focus with haptic feedback
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setShowSuggestions(suggestions.length > 0 && hasValue);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
    
    // Avoid iOS auto-zoom jumping
    try { e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch {}
    onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 150);
    onBlur?.(e);
  };

  // Handle value change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setShowSuggestions(suggestions.length > 0 && e.target.value.length > 0);
  };

  // Handle clear
  const handleClear = () => {
    if (inputRef.current) {
      const event = new Event('input', { bubbles: true });
      inputRef.current.value = '';
      inputRef.current.dispatchEvent(event);
      inputRef.current.focus();
      
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setShowSuggestions(false);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Get input type based on password visibility
  const inputType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

  // Get smart keyboard attributes
  const getSmartKeyboardProps = () => {
    if (!smartKeyboard) return {};
    
    const props: Record<string, any> = {};
    
    switch (type) {
      case 'email':
        props.inputMode = 'email';
        props.autoComplete = 'email';
        props.autoCapitalize = 'off';
        props.autoCorrect = 'off';
        props.spellCheck = 'false';
        break;
      case 'tel':
        props.inputMode = 'tel';
        props.autoComplete = 'tel';
        props.autoCapitalize = 'off';
        props.autoCorrect = 'off';
        props.spellCheck = 'false';
        break;
      case 'url':
        props.inputMode = 'url';
        props.autoComplete = 'url';
        props.autoCapitalize = 'off';
        props.autoCorrect = 'off';
        props.spellCheck = 'false';
        break;
      case 'number':
        props.inputMode = 'numeric';
        props.pattern = '[0-9]*';
        break;
      case 'search':
        props.inputMode = 'search';
        props.autoComplete = 'off';
        break;
      default:
        if (props.name?.includes('name')) {
          props.autoComplete = 'name';
          props.autoCapitalize = 'words';
        }
        break;
    }
    
    return props;
  };

  const inputClasses = cn(
    // Base styles
    'w-full bg-white/10 backdrop-blur-md border rounded-xl transition-all duration-300',
    'text-white focus:outline-none focus:ring-2 focus:ring-accent/50',
    'placeholder:text-white/70',
    
    // Touch optimization
    touchOptimized && [
      'touch-manipulation', // Improve touch responsiveness  
      'tap-highlight-transparent', // Remove default highlight
      'selection:bg-accent/30 selection:text-white', // Custom selection
    ],
    
    // Size styles
    sizeVariants[size],
    
    // Variant styles
    {
      default: 'border-white/40 focus:border-accent/70',
      floating: 'border-white/40 focus:border-accent/70',
      filled: 'bg-white/15 border-transparent focus:border-accent/70',
      outline: 'bg-transparent border-2 border-white/50 focus:border-accent',
    }[variant],
    
    // State styles
    hasError && 'border-error/70 focus:border-error focus:ring-error/20',
    success && 'border-success/70 focus:border-success focus:ring-success/20',
    loading && 'opacity-70',
    
    // Icon padding
    Icon && (size === 'lg' ? 'pl-14' : size === 'md' ? 'pl-12' : 'pl-10'),
    (clearable && hasValue) || isPassword ? (size === 'lg' ? 'pr-14' : size === 'md' ? 'pr-12' : 'pr-10') : '',
    
    className
  );

  const containerClasses = cn(
    'relative w-full',
    variant === 'floating' && 'pt-2'
  );

  return (
    <div className={containerClasses}>
      {/* Floating Label */}
      {label && variant === 'floating' && (
        <motion.label
          className={cn(
            'absolute pointer-events-none transition-all duration-200 text-text-secondary',
            // Move label to the right of the leading icon when idle
            isFocused || hasValue
              ? 'left-4 top-2 text-xs translate-y-0 text-accent'
              : Icon
                ? (size === 'lg' ? 'left-14 top-8 text-lg' : size === 'md' ? 'left-12 top-6 text-base' : 'left-10 top-5 text-sm')
                : (size === 'lg' ? 'left-4 top-8 text-lg' : size === 'md' ? 'left-4 top-6 text-base' : 'left-4 top-5 text-sm')
          )}
          animate={shouldReduceMotion ? {} : {
            y: isFocused || hasValue ? -2 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
          }}
        >
          {label}
        </motion.label>
      )}
      
      {/* Static Label */}
      {label && variant !== 'floating' && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Leading Icon */}
        {Icon && (
          <div className={cn(
            'absolute left-0 top-0 flex items-center justify-center pointer-events-none text-text-secondary z-10',
            size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-12 h-12' : 'w-10 h-10'
          )}>
            <Icon className={size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} />
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClasses}
          maxLength={maxLength}
          inputMode={type === 'email' ? 'email' : undefined}
          autoComplete={type === 'email' ? 'email' : undefined}
          enterKeyHint="done"
          {...getSmartKeyboardProps()}
          {...props}
          placeholder={variant === 'floating' ? '' : (props.placeholder as string)}
        />

        {/* Trailing Actions */}
        <div className={cn(
          'absolute right-0 top-0 flex items-center gap-1 pr-4',
          size === 'lg' ? 'h-14' : size === 'md' ? 'h-12' : 'h-10'
        )}>
          {/* Loading Spinner */}
          {loading && (
            <motion.div
              className="text-text-secondary"
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={shouldReduceMotion ? {} : {
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <div className="w-4 h-4 border-2 border-text-secondary/30 border-t-text-secondary rounded-full" />
            </motion.div>
          )}

          {/* Success/Error Icons */}
          {!loading && success && (
            <CheckCircle2 className="w-5 h-5 text-success" />
          )}
          {!loading && hasError && (
            <AlertCircle className="w-5 h-5 text-error" />
          )}

          {/* Clear Button */}
          {!loading && clearable && hasValue && !isPassword && (
            <button
              type="button"
              onClick={handleClear}
              className="text-text-secondary hover:text-white transition-colors p-1 -mr-1 rounded touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Password Toggle */}
          {!loading && isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-text-secondary hover:text-white transition-colors p-1 -mr-1 rounded touch-manipulation"
            >
              {isPasswordVisible ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Focus Ring Animation */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isFocused ? 1 : 0,
              boxShadow: isFocused 
                ? hasError 
                  ? '0 0 0 2px rgba(239, 68, 68, 0.2), 0 0 20px rgba(239, 68, 68, 0.1)'
                  : '0 0 0 2px rgba(255, 107, 157, 0.2), 0 0 20px rgba(255, 107, 157, 0.1)'
                : 'none'
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl touch-manipulation"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <span className="text-white text-sm">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text / Error / Character Count */}
      <div className="flex justify-between items-center mt-2 min-h-[1.25rem]">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {hasError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-error"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {showCharacterCount && maxLength && (
          <span className={cn(
            'text-xs',
            characterCount > maxLength * 0.8 
              ? characterCount >= maxLength 
                ? 'text-error' 
                : 'text-yellow-400'
              : 'text-text-secondary'
          )}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default MobileInput;