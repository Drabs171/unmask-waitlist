'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface UnmaskLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  enableHoverEffects?: boolean;
  breathingAnimation?: boolean;
}

const UnmaskLogo: React.FC<UnmaskLogoProps> = ({
  className,
  size = 'lg',
  enableHoverEffects = true,
  breathingAnimation = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'text-4xl md:text-5xl',
    md: 'text-5xl md:text-6xl',
    lg: 'text-6xl md:text-7xl lg:text-8xl',
    xl: 'text-7xl md:text-8xl lg:text-9xl',
  };

  const breathingVariants = shouldReduceMotion ? {
    initial: { scale: 1 },
    animate: { scale: 1 },
  } : {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const hoverVariants = {
    hover: shouldReduceMotion ? {} : {
      scale: 1.05,
      rotate: [0, -1, 1, 0],
      transition: {
        scale: { duration: 0.3, ease: 'easeOut' as const },
        rotate: { duration: 0.6, ease: 'easeInOut' as const },
      },
    },
  };

  return (
    <div className={cn('relative inline-block cursor-pointer', className)}>
      {/* Main Logo */}
      <motion.div
        className="relative z-10"
        variants={breathingAnimation ? breathingVariants : undefined}
        initial="initial"
        animate="animate"
        whileHover={enableHoverEffects ? "hover" : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...hoverVariants}
      >
        <h1 
          className={cn(
            'font-black tracking-tight leading-none select-none',
            sizeClasses[size],
            'bg-gradient-to-r from-[#FF6B9D] via-[#FF6B9D] to-[#4ECDC4]',
            'bg-clip-text text-transparent',
            'filter drop-shadow-lg'
          )}
          style={{
            backgroundSize: '300% 100%',
            backgroundPosition: isHovered ? '100% 0%' : '0% 0%',
            transition: 'background-position 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Unmask
        </h1>
      </motion.div>

      {/* Hover Glow Effect */}
      {enableHoverEffects && (
        <motion.div
          className={cn(
            'absolute inset-0 font-black tracking-tight leading-none select-none pointer-events-none',
            sizeClasses[size],
            'text-[#FF6B9D] blur-lg opacity-0'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.3 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Unmask
        </motion.div>
      )}

      {/* Shimmer Effect */}
      {enableHoverEffects && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '200%' : '-100%' }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Subtle Particles */}
      {enableHoverEffects && !shouldReduceMotion && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent/60 rounded-full"
              initial={{ 
                opacity: 0,
                x: Math.random() * 100 - 50,
                y: Math.random() * 20 - 10,
              }}
              animate={isHovered ? {
                opacity: [0, 1, 0],
                y: [0, -20, -40],
                x: [0, Math.random() * 40 - 20],
                scale: [0.5, 1, 0],
              } : {}}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: '50%',
              }}
            />
          ))}
        </>
      )}

      {/* Premium Border Effect */}
      <motion.div
        className="absolute -inset-2 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(45deg, #FF6B9D, #4ECDC4, #FF6B9D)',
          backgroundSize: '300% 300%',
        }}
      >
        <motion.div
          className="w-full h-full bg-[#0a0a0a] rounded-lg"
          animate={isHovered ? {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  );
};

export default UnmaskLogo;