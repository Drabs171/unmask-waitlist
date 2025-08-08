'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface IconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  variant?: 'default' | 'hover';
}

// Blind Chat Icon - Chat bubble with mystery mask overlay
export const BlindChatIcon: React.FC<IconProps> = ({ 
  className, 
  size = 32, 
  animated = true, 
  variant = 'default' 
}) => {
  const maskVariants = {
    default: { opacity: 0.8, scale: 1, y: 0 },
    hover: { opacity: 0.2, scale: 0.8, y: -4 }
  };

  const chatVariants = {
    default: { opacity: 0.6 },
    hover: { opacity: 1 }
  };

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Chat Bubble Base */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        initial="default"
        animate={variant}
        variants={chatVariants}
        transition={{ duration: 0.3 }}
      >
        <path
          d="M8 6a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h1.5l3 3a1 1 0 0 0 1.7-.7V24H24a4 4 0 0 0 4-4V10a4 4 0 0 0-4-4H8Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Chat dots */}
        <motion.g
          animate={animated ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
          <circle cx="16" cy="15" r="1.5" fill="currentColor" />
          <circle cx="20" cy="15" r="1.5" fill="currentColor" />
        </motion.g>
      </motion.svg>

      {/* Mystery Mask Overlay */}
      <motion.svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        initial="default"
        animate={variant}
        variants={maskVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Mask shape */}
        <path
          d="M10 10h12c1.1 0 2 .9 2 2v4c0 2.2-1.8 4-4 4h-8c-2.2 0-4-1.8-4-4v-4c0-1.1.9-2 2-2Z"
          fill="currentColor"
          fillOpacity="0.9"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Eye holes */}
        <ellipse cx="14" cy="14" rx="1.5" ry="2" fill="white" fillOpacity="0.9" />
        <ellipse cx="18" cy="14" rx="1.5" ry="2" fill="white" fillOpacity="0.9" />
        {/* Mask string */}
        <motion.line
          x1="10" y1="12" x2="6" y2="10"
          stroke="currentColor"
          strokeWidth="1"
          animate={animated ? { pathLength: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.line
          x1="22" y1="12" x2="26" y2="10"
          stroke="currentColor"
          strokeWidth="1"
          animate={animated ? { pathLength: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />
      </motion.svg>

      {/* Question marks for mystery */}
      <motion.div
        className="absolute -top-1 -right-1 text-xs"
        animate={animated ? { 
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ?
      </motion.div>
    </div>
  );
};

// Authentic Heart Icon - Heart with authenticity verification badge
export const AuthenticHeartIcon: React.FC<IconProps> = ({ 
  className, 
  size = 32, 
  animated = true, 
  variant = 'default' 
}) => {
  const heartVariants = {
    default: { scale: 1, rotate: 0 },
    hover: { scale: 1.05, rotate: 2 }
  };

  const badgeVariants = {
    default: { scale: 0.8, opacity: 0.9 },
    hover: { scale: 1, opacity: 1 }
  };

  const checkVariants = {
    default: { pathLength: 0.8 },
    hover: { pathLength: 1 }
  };

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Heart shape */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        initial="default"
        animate={variant}
        variants={heartVariants}
        transition={{ duration: 0.3 }}
      >
        <motion.path
          d="M16 28c7.5-4.8 12-10.2 12-16 0-4.4-3.6-8-8-8-2.4 0-4.5 1.1-6 2.8C12.5 5.1 10.4 4 8 4c-4.4 0-8 3.6-8 8 0 5.8 4.5 11.2 12 16Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={animated ? { 
            scale: [1, 1.05, 1],
            strokeWidth: [1.5, 2, 1.5]
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Heart pulse effect */}
        {animated && (
          <motion.path
            d="M16 28c7.5-4.8 12-10.2 12-16 0-4.4-3.6-8-8-8-2.4 0-4.5 1.1-6 2.8C12.5 5.1 10.4 4 8 4c-4.4 0-8 3.6-8 8 0 5.8 4.5 11.2 12 16Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.svg>

      {/* Authenticity Badge */}
      <motion.div
        className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
        initial="default"
        animate={variant}
        variants={badgeVariants}
        transition={{ duration: 0.3 }}
      >
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <motion.path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={checkVariants}
            transition={{ duration: 0.4 }}
            initial="default"
            animate={variant}
          />
        </motion.svg>
      </motion.div>

      {/* Sparkle effects */}
      {animated && (
        <>
          <motion.div
            className="absolute top-1 left-1 w-1 h-1 bg-current rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-2 right-1 w-1 h-1 bg-current rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, -180, -360]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </>
      )}
    </div>
  );
};

// No Swipe Icon - Crossed-out swipe gesture
export const NoSwipeIcon: React.FC<IconProps> = ({ 
  className, 
  size = 32, 
  animated = true, 
  variant = 'default' 
}) => {
  const cardVariants = {
    default: { x: 0, rotate: 0 },
    hover: { x: 2, rotate: 1 }
  };

  const crossVariants = {
    default: { scale: 0.9, opacity: 0.8 },
    hover: { scale: 1, opacity: 1 }
  };

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Card stack */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
      >
        {/* Back cards */}
        <rect
          x="3"
          y="6"
          width="18"
          height="24"
          rx="3"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        <rect
          x="5"
          y="4"
          width="18"
          height="24"
          rx="3"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
        
        {/* Front card with swipe animation */}
        <motion.rect
          x="7"
          y="2"
          width="18"
          height="24"
          rx="3"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
          initial="default"
          animate={variant}
          variants={cardVariants}
          transition={{ duration: 0.3 }}
        />

        {/* Swipe gesture arrow (when animated) */}
        {animated && (
          <motion.g
            animate={variant === 'default' ? {
              x: [0, 8, 0],
              opacity: [0.5, 1, 0.5]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path
              d="M26 14l-4-3v2h-6v2h6v2l4-3Z"
              fill="currentColor"
              opacity="0.6"
            />
          </motion.g>
        )}
      </motion.svg>

      {/* Prohibition Cross */}
      <motion.svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        initial="default"
        animate={variant}
        variants={crossVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Red circle */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.5"
          opacity="0.9"
        />
        {/* Diagonal slash */}
        <motion.line
          x1="6"
          y1="6"
          x2="26"
          y2="26"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
          animate={animated ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </motion.svg>

      {/* "No" text indicator */}
      {variant === 'hover' && (
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-500"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          NO
        </motion.div>
      )}
    </div>
  );
};

// Personality Icon - Brain with neural connections
export const PersonalityIcon: React.FC<IconProps> = ({ 
  className, 
  size = 32, 
  animated = true, 
  variant = 'default' 
}) => {
  const brainVariants = {
    default: { scale: 1 },
    hover: { scale: 1.05 }
  };

  const connectionVariants = {
    default: { opacity: 0.6 },
    hover: { opacity: 1 }
  };

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        initial="default"
        animate={variant}
        variants={brainVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Brain shape */}
        <path
          d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4c0-2.2 1.8-4 4-4s4 1.8 4 4c0 4.4-3.6 8-8 8s-8-3.6-8-8Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        
        {/* Brain folds/segments */}
        <path
          d="M12 10c1-1 2-1 3-1s2 0 3 1"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M11 14c1.5-0.5 3-0.5 4.5 0s3 0.5 4.5 0"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.7"
        />

        {/* Neural connection points */}
        <motion.g
          initial="default"
          animate={variant}
          variants={connectionVariants}
          transition={{ duration: 0.3 }}
        >
          {/* Connection nodes */}
          <circle cx="10" cy="12" r="1.5" fill="currentColor" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
          <circle cx="22" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          <circle cx="20" cy="16" r="1.5" fill="currentColor" />
          
          {/* Connection lines */}
          <motion.path
            d="M10 12L16 10L22 12M16 10L12 16M16 10L20 16M10 12L12 16M22 12L20 16"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
            animate={animated ? { 
              pathLength: [0.7, 1, 0.7],
              opacity: [0.3, 0.8, 0.3]
            } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.g>

        {/* Thought bubbles */}
        {animated && (
          <motion.g
            animate={{
              y: [-2, 2, -2],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <circle cx="6" cy="8" r="1" fill="currentColor" opacity="0.4" />
            <circle cx="4" cy="6" r="0.5" fill="currentColor" opacity="0.3" />
            <circle cx="26" cy="8" r="1" fill="currentColor" opacity="0.4" />
            <circle cx="28" cy="6" r="0.5" fill="currentColor" opacity="0.3" />
          </motion.g>
        )}

        {/* Electric spark effect */}
        {variant === 'hover' && animated && (
          <motion.path
            d="M14 8L15 6L16 8L17 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.svg>

      {/* Personality trait indicators */}
      {variant === 'hover' && (
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {['·', '·', '·'].map((dot, i) => (
            <motion.span
              key={i}
              className="text-xs"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              {dot}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Export all icons
export const FeatureIcons = {
  BlindChatIcon,
  AuthenticHeartIcon,
  NoSwipeIcon,
  PersonalityIcon,
};

export default FeatureIcons;