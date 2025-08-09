'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSimpleTypewriter } from '@/hooks/useTypewriter';
import { cn } from '@/utils/cn';

interface TypewriterTextProps {
  text: string;
  className?: string;
  typeSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorClassName?: string;
  onComplete?: () => void;
  glowOnComplete?: boolean;
  neonOutline?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className,
  typeSpeed = 50,
  startDelay = 0,
  showCursor = true,
  cursorClassName,
  onComplete,
  glowOnComplete = false,
  neonOutline = false,
}) => {
  const { displayText, isComplete, showCursor: cursorVisible, isTyping } = useSimpleTypewriter(text, {
    typeSpeed,
    startDelay,
    onComplete,
  });

  return (
    <motion.div
      className={cn('relative inline-block', className)}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        textShadow: glowOnComplete && isComplete ? '0 0 20px rgba(255, 107, 157, 0.5)' : 'none',
      }}
      transition={{ duration: 0.3 }}
      layout
    >
      <span
        className="relative z-10"
        style={neonOutline ? ({
          WebkitTextStroke: '1px rgba(255, 107, 157, 0.55)',
          textShadow: '0 0 6px rgba(255, 107, 157, 0.6), 0 0 14px rgba(255, 107, 157, 0.35)'
        } as any) : undefined}
      >
        {displayText}
        {showCursor && cursorVisible && (
          <motion.span
            className={cn(
              'inline-block w-1 h-[1.2em] bg-accent ml-1 align-text-bottom shadow-lg shadow-accent/50 rounded-sm',
              cursorClassName
            )}
            initial={{ opacity: 1 }}
            animate={{ opacity: isTyping ? [0.3, 1, 0.3] : 1 }}
            transition={{
              duration: 0.8,
              repeat: isTyping ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        )}
      </span>
      
      {/* Glow effect background */}
      {glowOnComplete && isComplete && (
        <motion.div
          className="absolute inset-0 text-accent/20 blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {text}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TypewriterText;