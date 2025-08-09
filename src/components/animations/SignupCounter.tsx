'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SignupCounterProps {
  targetCount?: number;
  startCount?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  animateOnMount?: boolean;
  incrementInterval?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SignupCounter: React.FC<SignupCounterProps> = ({
  targetCount,
  startCount = 0,
  duration = 2000,
  prefix = '',
  suffix = ' people joined',
  className,
  animateOnMount = true,
  incrementInterval = 30000, // Auto-increment every 30 seconds
  size = 'md',
}) => {
  const [displayCount, setDisplayCount] = useState(startCount);
  const [actualCount, setActualCount] = useState(targetCount || 0);
  const [isLoading, setIsLoading] = useState(!targetCount);
  const shouldReduceMotion = useReducedMotion();
  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: true, margin: '-100px' });
  const animationRef = useRef<number | undefined>(undefined);
  const incrementRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasAnimated = useRef(false);

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };

  // Fetch real waitlist count (use stats endpoint for total signups)
  const fetchWaitlistCount = async () => {
    try {
      const response = await fetch('/api/waitlist/stats');
      if (response.ok) {
        const data = await response.json();
        const newCount = Number(data.total_signups ?? 0);
        setActualCount(newCount);
        setIsLoading(false);
        return newCount;
      }
    } catch (error) {
      console.warn('Failed to fetch waitlist count, using fallback');
    }
    setIsLoading(false);
    return actualCount;
  };

  // Easing function for smooth animation
  const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

  // Animate to target count
  const animateToTarget = (target: number, animationDuration = duration) => {
    if (shouldReduceMotion) {
      setDisplayCount(target);
      return;
    }

    const startTime = Date.now();
    const startValue = displayCount;
    const difference = target - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      const easedProgress = easeOutQuart(progress);
      const newValue = Math.round(startValue + difference * easedProgress);
      
      setDisplayCount(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animate();
  };

  // Auto-increment functionality
  const startAutoIncrement = React.useCallback(() => {
    if (incrementInterval > 0) {
      incrementRef.current = setInterval(() => {
        const increment = Math.floor(Math.random() * 3) + 1; // Random increment 1-3
        setDisplayCount(prev => prev + increment);
      }, incrementInterval);
    }
  }, [incrementInterval]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Fetch count on mount and refresh periodically
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const boot = async () => {
      await fetchWaitlistCount();
      interval = setInterval(fetchWaitlistCount, 30000);
    };
    if (!targetCount) {
      boot();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [targetCount]);

  // Initial animation when component comes into view
  useEffect(() => {
    if ((isInView || animateOnMount) && !hasAnimated.current && !isLoading) {
      hasAnimated.current = true;
      const target = targetCount || actualCount;
      animateToTarget(target);
      
      // Start auto-increment after initial animation
      const timer = setTimeout(() => {
        startAutoIncrement();
      }, duration + 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, animateOnMount, targetCount, actualCount, isLoading, duration]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (incrementRef.current) {
        clearInterval(incrementRef.current);
      }
    };
  }, []);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        delay: 0.2,
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: shouldReduceMotion ? { scale: 1 } : {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: shouldReduceMotion ? { opacity: 0 } : {
      opacity: [0.3, 0.6, 0.3],
      scale: [0.8, 1.1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  // Split number into individual digits for individual animations
  const renderAnimatedDigits = (num: number) => {
    const formattedNum = formatNumber(num);
    
    return formattedNum.split('').map((char, index) => (
      <motion.span
        key={`${char}-${index}`}
        className="inline-block"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          ease: 'easeOut' as const,
        }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <motion.div
      ref={counterRef}
      className={cn('relative text-center', className)}
      variants={containerVariants}
      initial="initial"
      animate={isInView || animateOnMount ? 'animate' : 'initial'}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 rounded-lg -m-4"
        style={{
          background: 'radial-gradient(ellipse, rgba(255, 107, 157, 0.1) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        variants={glowVariants}
        initial="initial"
        animate={isInView || animateOnMount ? 'animate' : 'initial'}
      />

      {/* Counter Container */}
      <motion.div
        className="relative z-10"
        variants={pulseVariants}
        initial="initial"
        animate={isInView || animateOnMount ? 'animate' : 'initial'}
      >
        {/* Main Counter */}
        <div className={cn(
          'text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary',
          sizeClasses[size]
        )}>
          {prefix}
          <span className="tabular-nums">
            {renderAnimatedDigits(displayCount)}
          </span>
          <motion.span
            className="text-text-secondary ml-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {suffix}
          </motion.span>
        </div>

        {/* Sparkle Effects */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-accent rounded-full"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 15}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'easeInOut' as const,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Live indicator */}
      <motion.div
        className="flex items-center justify-center gap-2 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 bg-success rounded-full"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        />
        <span className="text-xs text-text-secondary font-medium">
          Live counter
        </span>
      </motion.div>
    </motion.div>
  );
};

export default SignupCounter;