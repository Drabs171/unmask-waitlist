'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface MaskAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  enableGlow?: boolean;
}

const MaskAnimation: React.FC<MaskAnimationProps> = ({
  className,
  size = 'md',
  delay = 0.8,
  enableGlow = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-16 h-12',
    md: 'w-24 h-18',
    lg: 'w-32 h-24',
    xl: 'w-40 h-30',
  };

  const maskVariants = shouldReduceMotion
    ? {
        initial: { opacity: 1, scale: 1, y: 0 },
        animate: { opacity: 1, scale: 1, y: 0 },
      }
    : {
        initial: {
          opacity: 0,
          scale: 0.8,
          y: 20,
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 1.2,
            delay,
            ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
          },
        },
      };

  const glowVariants = shouldReduceMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 0 },
  } : {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0, 0.3, 0.6, 0.3],
      scale: [1, 1.05, 1.1, 1.05],
      transition: {
        duration: 4,
        delay: delay + 0.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }
    },
  };

  return (
    <div className={cn('relative flex justify-center', className)}>
      {/* Glow Effect */}
      {enableGlow && (
        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        >
          <div 
            className={cn(
              'rounded-full blur-xl',
              sizeClasses[size]
            )}
            style={{
              background: 'radial-gradient(circle, rgba(255, 107, 157, 0.4) 0%, rgba(78, 205, 196, 0.2) 50%, transparent 70%)',
            }}
          />
        </motion.div>
      )}

      {/* Main Mask */}
      <motion.div
        className="relative z-10"
        variants={maskVariants}
        initial="initial"
        animate="animate"
      >
        <svg
          className={cn(sizeClasses[size])}
          viewBox="0 0 200 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B9D" />
              <stop offset="50%" stopColor="#B794F6" />
              <stop offset="100%" stopColor="#4ECDC4" />
            </linearGradient>
            <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Shadow */}
          <path
            d="M50 75 Q50 65 60 65 L140 65 Q150 65 150 75 L150 95 Q150 110 135 115 L65 115 Q50 110 50 95 Z"
            fill="url(#shadowGradient)"
            transform="translate(2, 2)"
            opacity="0.3"
          />

          {/* Main Mask Body */}
          <path
            d="M50 75 Q50 65 60 65 L140 65 Q150 65 150 75 L150 95 Q150 110 135 115 L65 115 Q50 110 50 95 Z"
            fill="url(#maskGradient)"
            filter="url(#glow)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />

          {/* Left Eye */}
          <ellipse
            cx="80"
            cy="85"
            rx="12"
            ry="8"
            fill="#0a0a0a"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.5"
          />

          {/* Right Eye */}
          <ellipse
            cx="120"
            cy="85"
            rx="12"
            ry="8"
            fill="#0a0a0a"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.5"
          />

          {/* Decorative Heart at Bottom */}
          <path
            d="M100 105 Q95 100 90 105 Q90 110 100 115 Q110 110 110 105 Q105 100 100 105 Z"
            fill="rgba(255, 107, 157, 0.8)"
            filter="url(#glow)"
          />

          {/* Left String */}
          <path
            d="M50 75 Q40 70 30 65"
            stroke="url(#maskGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Right String */}
          <path
            d="M150 75 Q160 70 170 65"
            stroke="url(#maskGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Decorative Swirls */}
          <path
            d="M65 70 Q70 65 75 70"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M125 70 Q130 65 135 70"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Subtle Sparkles */}
      {!shouldReduceMotion && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -10, -20],
              }}
              transition={{
                duration: 2,
                delay: delay + 1 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeOut',
              }}
              style={{
                left: `${30 + i * 20}%`,
                top: '20%',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MaskAnimation;