'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface MobileButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  magneticStrength?: number;
  glowIntensity?: 'low' | 'medium' | 'high';
  touchOptimized?: boolean;
  fullWidth?: boolean;
}

const MobileButton: React.FC<MobileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  hapticFeedback = true,
  rippleEffect = true,
  magneticStrength = 0.3,
  glowIntensity = 'medium',
  touchOptimized = true,
  fullWidth = false,
  disabled,
  onMouseMove,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  // Variants for different button styles
  const variants = {
    primary: 'bg-gradient-to-r from-accent to-primary-blue text-white shadow-glow-brand hover:shadow-xl hover:shadow-accent/40',
    secondary: 'bg-white/15 backdrop-blur-md border border-white/40 text-white hover:bg-white/20',
    ghost: 'bg-transparent border-2 border-white/30 text-white hover:bg-white/10',
    outline: 'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white',
    gradient: 'bg-gradient-to-r from-accent via-primary-blue to-accent bg-[length:200%] text-white animate-gradient shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/50',
  };

  // Size variants with touch-optimized minimums
  const sizeVariants = {
    sm: touchOptimized 
      ? 'px-touch-sm py-touch-xs min-h-touch-target text-button-sm min-w-[2.75rem]'
      : 'px-4 py-2 text-sm min-h-[2.25rem]',
    md: touchOptimized
      ? 'px-touch-md py-touch-sm min-h-touch-target text-button-md min-w-[3rem]'
      : 'px-6 py-3 text-base min-h-[2.5rem]',
    lg: touchOptimized
      ? 'px-touch-lg py-touch-md min-h-touch-target-lg text-button-lg min-w-[3.5rem]'
      : 'px-8 py-4 text-lg min-h-[3rem]',
    xl: touchOptimized
      ? 'px-touch-xl py-touch-lg min-h-touch-target-xl text-button-lg min-w-[4rem]'
      : 'px-10 py-5 text-xl min-h-[3.5rem]',
  };

  // Glow intensities
  const glowVariants = {
    low: 'shadow-md hover:shadow-glow-pink/30',
    medium: 'shadow-lg hover:shadow-glow-brand hover:shadow-xl',
    high: 'shadow-xl hover:shadow-glow-brand shadow-glow-pink hover:shadow-2xl',
  };

  // Handle magnetic mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || shouldReduceMotion) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;
    
    x.set(deltaX);
    y.set(deltaY);
    
    onMouseMove?.(e);
  };

  // Handle mouse leave
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!shouldReduceMotion) {
      x.set(0);
      y.set(0);
    }
    onMouseLeave?.(e);
  };
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovering(true);
  };

  // Handle touch interactions with haptic feedback
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    
    // Haptic feedback for supported devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onTouchEnd?.(e);
  };

  // Handle ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Create ripple effect
    if (rippleEffect && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        x,
        y,
        id: Date.now(),
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    // Stronger haptic feedback on click
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
    
    onClick?.(e);
  };

  // Clean up ripples on unmount
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);

  const buttonClasses = cn(
    // Base styles
    'relative overflow-hidden rounded-xl font-semibold transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background',
    'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none touch-manipulation', // Optimize for touch
    
    // Variant styles
    variants[variant],
    
    // Size styles
    sizeVariants[size],
    
    // Glow styles
    glowVariants[glowIntensity],
    
    // Width styles
    fullWidth && 'w-full',
    
    // Touch-specific improvements
    touchOptimized && [
      'tap-highlight-transparent', // Remove default mobile tap highlight
      'touch-action-manipulation', // Improve touch responsiveness
    ],
    
    className
  );

  return (
    <motion.button
      ref={buttonRef}
      className={buttonClasses}
      style={
        shouldReduceMotion || magneticStrength <= 0
          ? undefined
          : { x, y, rotateX, rotateY }
      }
      whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {/* Content */}
      <span className={cn(
        'relative z-10 flex items-center justify-center gap-2',
        loading && 'opacity-0'
      )}>
        {children}
      </span>
      
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.div>
      )}
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          initial={{
            width: 0,
            height: 0,
            x: '-50%',
            y: '-50%',
            opacity: 0.5,
          }}
          animate={{
            width: 400,
            height: 400,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-xl opacity-0 pointer-events-none"
        whileHover={{ opacity: shouldReduceMotion ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Press effect for touch */}
      <motion.div
        className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Gradient animation background for gradient variant */}
      {variant === 'gradient' && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent via-primary-blue to-accent bg-[length:200%] opacity-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0, backgroundPosition: '0% 50%' }}
          animate={isHovering ? { opacity: 0.25, backgroundPosition: '100% 50%' } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onAnimationComplete={() => setIsHovering(false)}
        />
      )}
    </motion.button>
  );
};

export default MobileButton;