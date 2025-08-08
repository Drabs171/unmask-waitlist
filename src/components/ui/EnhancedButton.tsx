'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { ButtonPropsInterface } from '@/types';
import { cn } from '@/utils/cn';
import { useMouseParallax } from '@/hooks/useParallax';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface EnhancedButtonProps extends ButtonPropsInterface {
  success?: boolean;
  magneticEffect?: boolean;
  rippleEffect?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  hapticFeedback?: boolean;
  breathingAnimation?: boolean;
  sparkleEffect?: boolean;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'gradient',
  size = 'md',
  disabled = false,
  loading = false,
  success = false,
  magneticEffect = true,
  rippleEffect = true,
  glowIntensity = 'medium',
  hapticFeedback = true,
  breathingAnimation = false,
  sparkleEffect = false,
  onClick,
  children,
  className,
  type = 'button',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleCounter = useRef(0);
  const sparkleCounter = useRef(0);
  const shouldReduceMotion = useReducedMotion();
  const { isMobile } = useMobileDetection();

  // So clicks feel snappy on mobile, we disable heavy effects
  const effectiveMagnetic = magneticEffect && !shouldReduceMotion && !isMobile;
  const enableRipple = rippleEffect && !shouldReduceMotion && !isMobile;

  // Mouse parallax effect for magnetic buttons
  const { transform, isHovering } = useMouseParallax({
    element: buttonRef.current,
    strength: effectiveMagnetic ? 8 : 0,
    disabled: disabled || loading,
  });

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transition-shadow duration-300';
  
  const variants = {
    gradient: 'text-white shadow-lg hover:shadow-xl focus:ring-accent/50',
    ghost: 'text-white hover:bg-white/10 focus:ring-white/30',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-white focus:ring-accent/50',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  const glowIntensities = {
    low: { filter: 'drop-shadow(0 2px 4px rgba(255, 107, 157, 0.2))' },
    medium: { filter: 'drop-shadow(0 4px 8px rgba(255, 107, 157, 0.3))' },
    high: { filter: 'drop-shadow(0 8px 16px rgba(255, 107, 157, 0.4))' },
  };

  // Handle success state
  useEffect(() => {
    if (success && !showSuccess) {
      setShowSuccess(true);
      
      // Create celebration sparkles
      if (sparkleEffect && !shouldReduceMotion) {
        createSparkles();
      }
      
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, showSuccess, sparkleEffect, shouldReduceMotion]);

  // Clean up old ripples and sparkles
  useEffect(() => {
    const timer = setTimeout(() => {
      setRipples(prev => prev.slice(-3));
      setSparkles(prev => prev.slice(-5));
    }, 1000);
    return () => clearTimeout(timer);
  }, [ripples, sparkles]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!enableRipple || disabled) return;
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: rippleCounter.current++,
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const createSparkles = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const sparkleCount = 6;
    const newSparkles: Array<{ id: number; x: number; y: number }> = [];
    
    for (let i = 0; i < sparkleCount; i++) {
      newSparkles.push({
        id: sparkleCounter.current++,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
      });
    }
    
    setSparkles(prev => [...prev, ...newSparkles]);
    
    setTimeout(() => {
      setSparkles(prev => 
        prev.filter(sparkle => !newSparkles.find(ns => ns.id === sparkle.id))
      );
    }, 1000);
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      
      // Haptic feedback (if supported)
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      createRipple(event);
      onClick();
    }
  };

  // Animation variants
  const buttonVariants: any = {
    idle: {
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
    hover: {
      scale: effectiveMagnetic ? 1.02 : 1,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
    pressed: {
      scale: 0.99,
      transition: { duration: 0.1, ease: 'easeInOut' as const },
    },
    disabled: {
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
  };

  const getAnimationState = () => {
    if (disabled) return 'disabled';
    if (isPressed) return 'pressed';
    if (isHovering && !shouldReduceMotion) return 'hover';
    return 'idle';
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        // Ensure overlays never block clicks
        'after:pointer-events-none before:pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      variants={buttonVariants}
      animate={getAnimationState()}
      style={{
        transform: magneticEffect && !shouldReduceMotion
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        willChange: magneticEffect ? 'transform' : 'auto',
        ...glowIntensities[glowIntensity],
      }}
      whileTap={!shouldReduceMotion ? { scale: 0.97 } : {}}
    >
      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Sparkle Effects */}
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="absolute w-1 h-1 bg-accent rounded-full pointer-events-none"
          style={{
            left: sparkle.x,
            top: sparkle.y,
          }}
          initial={{ scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
            rotate: [0, 180, 360],
            y: [0, -30, -60],
            x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20],
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mr-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        )}

        {/* Success State */}
        {showSuccess && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-2"
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}

        {/* Button Text */}
        <motion.span
          animate={{
            opacity: loading ? 0.7 : 1,
            y: showSuccess ? -2 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {showSuccess ? 'Success!' : children}
        </motion.span>
      </div>

      {/* Background Effects */}
      {variant === 'gradient' && (
        <>
          {/* Base Gradient */}
          <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-accent via-primary-blue to-accent rounded-lg pointer-events-none"
            animate={{
              opacity: 1,
              backgroundPosition: isHovering && !shouldReduceMotion ? ['0% 50%', '100% 50%'] : '50% 50%',
            }}
            transition={{ 
              opacity: { duration: 0.3 },
              backgroundPosition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />
          
          {/* Hover Glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary-blue/30 rounded-lg blur-md pointer-events-none"
            animate={{
              opacity: isHovering && !shouldReduceMotion ? 0.8 : 0,
              scale: isHovering && !shouldReduceMotion ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Breathing Animation */}
          {breathingAnimation && !isHovering && !isPressed && !loading && !shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary-blue/20 rounded-lg"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </>
      )}

      {/* Focus Ring Enhancement */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent focus-visible:ring-accent/50 transition-all duration-200" />

      {/* Success Celebration Overlay */}
      {showSuccess && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
};

// Preset button configurations
export const ButtonPresets = {
  primary: {
    variant: 'gradient' as const,
    magneticEffect: true,
    rippleEffect: true,
    glowIntensity: 'medium' as const,
    breathingAnimation: false,
  },
  
  secondary: {
    variant: 'outline' as const,
    magneticEffect: false,
    rippleEffect: true,
    glowIntensity: 'low' as const,
    breathingAnimation: false,
  },
  
  ghost: {
    variant: 'ghost' as const,
    magneticEffect: false,
    rippleEffect: false,
    glowIntensity: 'low' as const,
    breathingAnimation: false,
  },
  
  premium: {
    variant: 'gradient' as const,
    magneticEffect: true,
    rippleEffect: true,
    glowIntensity: 'high' as const,
    hapticFeedback: true,
    breathingAnimation: true,
    sparkleEffect: true,
  },

  cta: {
    variant: 'gradient' as const,
    magneticEffect: true,
    rippleEffect: true,
    glowIntensity: 'high' as const,
    hapticFeedback: true,
    breathingAnimation: true,
    sparkleEffect: false,
    size: 'lg' as const,
  },
} as const;

export default EnhancedButton;
export type { EnhancedButtonProps };