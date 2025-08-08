'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export interface FeatureCardState {
  isFlipped: boolean;
  isHovered: boolean;
  hasEntered: boolean;
  entranceDelay: number;
}

export const useFeatureAnimations = (cardId: string, entranceDelay: number = 0) => {
  const [cardState, setCardState] = useState<FeatureCardState>({
    isFlipped: false,
    isHovered: false,
    hasEntered: false,
    entranceDelay,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle entrance animation when card comes into view
  useEffect(() => {
    if (isInView && !cardState.hasEntered) {
      const timer = setTimeout(() => {
        setCardState(prev => ({ ...prev, hasEntered: true }));
      }, entranceDelay);

      return () => clearTimeout(timer);
    }
  }, [isInView, cardState.hasEntered, entranceDelay]);

  // Handle card flip
  const handleFlip = useCallback(() => {
    if (shouldReduceMotion) return;
    
    setCardState(prev => ({
      ...prev,
      isFlipped: !prev.isFlipped
    }));
  }, [shouldReduceMotion]);

  // Handle hover state
  const handleHover = useCallback((isHovering: boolean) => {
    setCardState(prev => ({
      ...prev,
      isHovered: isHovering
    }));
  }, []);

  // Handle click/tap for mobile flip
  const handleClick = useCallback(() => {
    handleFlip();
  }, [handleFlip]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    handleHover(true);
    
    // Auto-flip on hover for desktop (with delay)
    if (!shouldReduceMotion && window.innerWidth > 768) {
      flipTimeoutRef.current = setTimeout(() => {
        setCardState(prev => ({ ...prev, isFlipped: true }));
      }, 500); // 500ms hover delay before flip
    }
  }, [handleHover, shouldReduceMotion]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    handleHover(false);
    
    // Clear flip timeout and flip back
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }
    
    if (!shouldReduceMotion) {
      setCardState(prev => ({ ...prev, isFlipped: false }));
    }
  }, [handleHover, shouldReduceMotion]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  // Animation variants for different states
  const getCardVariants = () => ({
    initial: {
      opacity: 0,
      y: 60,
      scale: 0.95,
      rotateY: 0,
    },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.8,
        ease: 'easeOut',
        delay: shouldReduceMotion ? 0 : entranceDelay / 1000,
      },
    },
    hover: {
      y: shouldReduceMotion ? 0 : -12,
      scale: shouldReduceMotion ? 1 : 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    flip: {
      rotateY: cardState.isFlipped ? 180 : 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.6,
        ease: 'easeInOut',
      },
    },
  });

  const getIconVariants = () => ({
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: shouldReduceMotion ? 1 : 1.1,
      rotate: shouldReduceMotion ? 0 : [0, -5, 5, 0],
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  });

  const getGlowVariants = (themeColor: string) => ({
    initial: { 
      opacity: 0, 
      scale: 0.8,
      boxShadow: `0 0 0 rgba(${themeColor}, 0)`,
    },
    hover: {
      opacity: shouldReduceMotion ? 0 : 1,
      scale: shouldReduceMotion ? 0.8 : 1.1,
      boxShadow: shouldReduceMotion ? 
        `0 0 0 rgba(${themeColor}, 0)` : 
        `0 20px 40px rgba(${themeColor}, 0.3), 0 0 60px rgba(${themeColor}, 0.1)`,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  });

  const getContentVariants = () => ({
    front: {
      opacity: cardState.isFlipped ? 0 : 1,
      rotateY: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        delay: cardState.isFlipped ? 0 : 0.15,
      },
    },
    back: {
      opacity: cardState.isFlipped ? 1 : 0,
      rotateY: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        delay: cardState.isFlipped ? 0.15 : 0,
      },
    },
  });

  return {
    cardRef,
    cardState,
    isInView,
    shouldReduceMotion,
    handlers: {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    variants: {
      card: getCardVariants(),
      icon: getIconVariants(),
      glow: getGlowVariants,
      content: getContentVariants(),
    },
  };
};

// Hook for coordinating multiple card animations
export const useFeatureCardsAnimation = (cardCount: number) => {
  const [globalAnimationState, setGlobalAnimationState] = useState({
    allEntered: false,
    entranceSequenceComplete: false,
  });

  const shouldReduceMotion = useReducedMotion();
  const baseDelay = shouldReduceMotion ? 0 : 300; // 300ms between cards

  // Calculate entrance delays for staggered animation
  const getEntranceDelay = useCallback((index: number) => {
    return index * baseDelay;
  }, [baseDelay]);

  // Track when all cards have completed entrance
  useEffect(() => {
    const totalDelay = (cardCount - 1) * baseDelay + 800; // Last card delay + animation duration
    const timer = setTimeout(() => {
      setGlobalAnimationState(prev => ({
        ...prev,
        entranceSequenceComplete: true,
      }));
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [cardCount, baseDelay]);

  return {
    getEntranceDelay,
    globalAnimationState,
    shouldReduceMotion,
  };
};

export default useFeatureAnimations;