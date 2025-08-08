'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  animate = true,
}) => {
  return (
    <motion.span
      className={cn('gradient-text', className)}
      initial={animate ? { backgroundPosition: '0% 50%' } : undefined}
      animate={
        animate
          ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }
          : undefined
      }
      style={{
        backgroundSize: '200% 200%',
      }}
    >
      {children}
    </motion.span>
  );
};

export default GradientText;