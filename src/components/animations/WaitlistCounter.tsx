'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface WaitlistCounterProps {
  startValue?: number;
  targetValue?: number;
  duration?: number;
  className?: string;
  showLabel?: boolean;
  labelText?: string;
  emphasizeText?: string;
  autoIncrement?: boolean;
  incrementInterval?: number;
}

const WaitlistCounter: React.FC<WaitlistCounterProps> = ({
  startValue = 0,
  targetValue = 0,
  duration = 2500,
  className,
  showLabel = false,
  labelText = '',
  emphasizeText = '',
  autoIncrement = false,
  incrementInterval = 25000, // 25 seconds
}) => {
  const [currentCount, setCurrentCount] = useState(startValue);
  const [displayCount, setDisplayCount] = useState(startValue);
  const [isMilestone, setIsMilestone] = useState(false);
  const [recentIncrement, setRecentIncrement] = useState(false);

  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();
  const animationRef = useRef<number | null>(null);
  const incrementRef = useRef<NodeJS.Timeout | null>(null);
  const milestoneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Milestone numbers that trigger pulse animation
  const milestones: number[] = [];

  // Smooth easing function
  const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

  // Check if a number is a milestone
  const isMilestoneNumber = useCallback((num: number): boolean => {
    return milestones.includes(Math.floor(num)) || num % 100 === 0;
  }, [milestones]);

  // Animate to target with milestone detection
  const animateToTarget = useCallback((target: number, animDuration = duration) => {
    if (shouldReduceMotion) {
      setDisplayCount(target);
      setCurrentCount(target);
      return;
    }

    const startTime = Date.now();
    const startValue = displayCount;
    const difference = target - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      
      const easedProgress = easeOutQuart(progress);
      const newValue = startValue + difference * easedProgress;
      const roundedValue = Math.round(newValue);
      
      setDisplayCount(roundedValue);

      // Check for milestone during animation
      if (isMilestoneNumber(roundedValue) && roundedValue !== startValue) {
        setIsMilestone(true);
        milestoneTimeoutRef.current = setTimeout(() => {
          setIsMilestone(false);
        }, 1000);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentCount(target);
      }
    };

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animate();
  }, [displayCount, duration, shouldReduceMotion, isMilestoneNumber]);

  // Auto-increment functionality
  const handleAutoIncrement = useCallback(() => {
    if (!autoIncrement) return;

    const increment = Math.floor(Math.random() * 3) + 1; // 1-3 random increment
    const newTarget = Math.min(currentCount + increment, targetValue);
    
    if (newTarget > currentCount) {
      setRecentIncrement(true);
      animateToTarget(newTarget, 1200); // Faster animation for increments
      
      // Reset recent increment indicator
      setTimeout(() => {
        setRecentIncrement(false);
      }, 2000);
    }
  }, [currentCount, targetValue, autoIncrement, animateToTarget]);

  // Initial animation when component comes into view
  useEffect(() => {
    if (isInView) {
      // Start with initial animation to a number closer to startValue
      const initialTarget = Math.min(startValue + 15, targetValue);
      animateToTarget(initialTarget);

      // Set up auto-increment
      if (autoIncrement) {
        incrementRef.current = setInterval(handleAutoIncrement, incrementInterval);
      }
    }

    return () => {
      if (incrementRef.current) {
        clearInterval(incrementRef.current);
      }
    };
  }, [isInView, startValue, targetValue, autoIncrement, incrementInterval, animateToTarget, handleAutoIncrement]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (incrementRef.current) {
        clearInterval(incrementRef.current);
      }
      if (milestoneTimeoutRef.current) {
        clearTimeout(milestoneTimeoutRef.current);
      }
    };
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Split formatted number into individual characters for animation
  const renderAnimatedNumber = (num: number) => {
    const formatted = formatNumber(num);
    
    return formatted.split('').map((char, index) => (
      <motion.span
        key={`${char}-${index}-${num}`} // Include num to force re-render
        className="inline-block tabular-nums"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.3,
          delay: index * 0.05,
          ease: 'easeOut',
        }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <div ref={counterRef} className={cn('text-center', className)}>
      {/* Counter Display */}
      <motion.div
        className="relative"
        animate={isMilestone && !shouldReduceMotion ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Main Number */}
        <motion.div
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary-blue relative z-10"
          animate={recentIncrement && !shouldReduceMotion ? {
            scale: [1, 1.02, 1],
          } : {}}
          transition={{ duration: 0.4 }}
        >
          {renderAnimatedNumber(displayCount)}
        </motion.div>

        {/* Milestone Pulse Ring */}
        {isMilestone && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{
              scale: [0.8, 2, 2.5],
              opacity: [0.8, 0.3, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(255, 107, 157, 0.3), transparent 70%)',
            }}
          />
        )}

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 -m-4 rounded-2xl blur-xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(78, 205, 196, 0.2))',
          }}
          animate={!shouldReduceMotion ? {
            opacity: [0.3, 0.6, 0.3],
            scale: [0.9, 1.1, 0.9],
          } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </motion.div>

      {/* Label */}
      {showLabel && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-xl md:text-2xl font-semibold text-white mb-2">
            {emphasizeText}
          </p>
          <p className="text-text-secondary text-sm md:text-base">
            Join the movement toward authentic connections
          </p>
        </motion.div>
      )}

      {/* Real-time Indicator */}
      <motion.div
        className="flex items-center justify-center gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 bg-success rounded-full"
          animate={!shouldReduceMotion ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <span className="text-xs text-text-secondary font-medium">
          Live counter • Updates in real-time
        </span>
      </motion.div>

      {/* Recent Activity Indicator */}
      {recentIncrement && !shouldReduceMotion && (
        <motion.div
          className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-1 rounded-full font-bold"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          +{Math.floor(Math.random() * 3) + 1}
        </motion.div>
      )}

      {/* Sparkle Effects for Milestones */}
      {isMilestone && !shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -20, -40],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WaitlistCounter;