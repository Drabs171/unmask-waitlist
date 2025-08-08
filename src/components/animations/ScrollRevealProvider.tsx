'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValue, useReducedMotion } from 'framer-motion';
import useAdvancedIntersectionObserver from '@/hooks/useAdvancedIntersectionObserver';
import { cn } from '@/utils/cn';

interface ScrollRevealConfig {
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade' | 'rotateX' | 'rotateY';
  distance?: number;
  scale?: number;
  rotationDegrees?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: number[] | string;
  threshold?: number;
  once?: boolean;
  cascade?: boolean;
}

interface ScrollRevealContextType {
  registerElement: (element: HTMLElement, config: ScrollRevealConfig) => void;
  unregisterElement: (element: HTMLElement) => void;
  globalProgress: MotionValue<number>;
}

const ScrollRevealContext = createContext<ScrollRevealContextType | null>(null);

export const useScrollReveal = () => {
  const context = useContext(ScrollRevealContext);
  if (!context) {
    throw new Error('useScrollReveal must be used within a ScrollRevealProvider');
  }
  return context;
};

interface ScrollRevealProviderProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollRevealProvider: React.FC<ScrollRevealProviderProps> = ({
  children,
  className,
}) => {
  const globalProgress = useMotionValue(0);
  const elementsRef = useRef<Map<HTMLElement, ScrollRevealConfig>>(new Map());
  const shouldReduceMotion = useReducedMotion();

  // Track global scroll progress
  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const progress = Math.min(scrollY / documentHeight, 1);
      globalProgress.set(progress);
    };

    const throttledUpdate = () => {
      requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', throttledUpdate, { passive: true });
    updateProgress(); // Initial call

    return () => {
      window.removeEventListener('scroll', throttledUpdate);
    };
  }, [globalProgress]);

  const registerElement = (element: HTMLElement, config: ScrollRevealConfig) => {
    elementsRef.current.set(element, config);
  };

  const unregisterElement = (element: HTMLElement) => {
    elementsRef.current.delete(element);
  };

  const contextValue: ScrollRevealContextType = {
    registerElement,
    unregisterElement,
    globalProgress,
  };

  return (
    <ScrollRevealContext.Provider value={contextValue}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </ScrollRevealContext.Provider>
  );
};

type Intrinsic = keyof React.JSX.IntrinsicElements;

interface ScrollRevealProps {
  children: React.ReactNode;
  config?: ScrollRevealConfig;
  className?: string;
  as?: Intrinsic;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  config = {},
  className,
  as: Component = 'div',
}) => {
  const {
    direction = 'up',
    distance = 60,
    scale = 0.8,
    rotationDegrees = 15,
    duration = 0.8,
    delay = 0,
    stagger = 0.1,
    easing = [0.25, 0.1, 0.25, 1],
    threshold = 0.1,
    once = true,
    cascade = false,
  } = config;

  const shouldReduceMotion = useReducedMotion();
  const childrenArray = React.Children.toArray(children);
  
  const { isIntersecting, hasBeenVisible, intersectionRatio, ref } = useAdvancedIntersectionObserver({
    threshold: [threshold],
    freezeOnceVisible: once,
    rootMargin: '-10% 0px -10% 0px', // Trigger slightly before element enters viewport
  });

  // Determine if element should animate
  const shouldAnimate = once ? hasBeenVisible : isIntersecting;
  const animationProgress = shouldReduceMotion ? 1 : (shouldAnimate ? 1 : 0);

  // Define animation variants based on direction
  const getVariants = () => {
    const baseTransition = {
      duration: shouldReduceMotion ? 0 : duration,
      delay: shouldReduceMotion ? 0 : delay,
      ease: easing,
    };

    const variants: any = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: baseTransition,
      },
    };

    switch (direction) {
      case 'up':
        variants.hidden = { ...variants.hidden, y: distance };
        variants.visible = { ...variants.visible, y: 0 };
        break;
      case 'down':
        variants.hidden = { ...variants.hidden, y: -distance };
        variants.visible = { ...variants.visible, y: 0 };
        break;
      case 'left':
        variants.hidden = { ...variants.hidden, x: distance };
        variants.visible = { ...variants.visible, x: 0 };
        break;
      case 'right':
        variants.hidden = { ...variants.hidden, x: -distance };
        variants.visible = { ...variants.visible, x: 0 };
        break;
      case 'scale':
        variants.hidden = { ...variants.hidden, scale };
        variants.visible = { ...variants.visible, scale: 1 };
        break;
      case 'rotateX':
        variants.hidden = { ...variants.hidden, rotateX: rotationDegrees };
        variants.visible = { ...variants.visible, rotateX: 0 };
        break;
      case 'rotateY':
        variants.hidden = { ...variants.hidden, rotateY: rotationDegrees };
        variants.visible = { ...variants.visible, rotateY: 0 };
        break;
      case 'fade':
      default:
        // Only opacity animation
        break;
    }

    return variants;
  };

  const variants = getVariants();

  // Container variants for stagger animation
  const containerVariants = cascade ? {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  } : variants;

  // Single child - simple animation
  if (!cascade || childrenArray.length <= 1) {
    return (
      <motion.div
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        className={className}
        initial="hidden"
        animate={shouldAnimate ? "visible" : "hidden"}
        variants={variants}
        style={{
          willChange: shouldAnimate ? 'transform, opacity' : 'auto',
        }}
      >
        {children}
      </motion.div>
    );
  }

  // Multiple children - cascade animation
  return (
    <motion.div
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={containerVariants}
      style={{
        willChange: shouldAnimate ? 'transform, opacity' : 'auto',
      }}
    >
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          variants={variants}
          style={{
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Preset configurations for common animation patterns
export const RevealPresets = {
  slideUp: {
    direction: 'up' as const,
    distance: 60,
    duration: 0.8,
    easing: [0.25, 0.1, 0.25, 1] as number[],
  },
  
  slideDown: {
    direction: 'down' as const,
    distance: 60,
    duration: 0.8,
    easing: [0.25, 0.1, 0.25, 1] as number[],
  },
  
  slideLeft: {
    direction: 'left' as const,
    distance: 80,
    duration: 0.8,
    easing: [0.25, 0.1, 0.25, 1] as number[],
  },
  
  slideRight: {
    direction: 'right' as const,
    distance: 80,
    duration: 0.8,
    easing: [0.25, 0.1, 0.25, 1] as number[],
  },
  
  scaleUp: {
    direction: 'scale' as const,
    scale: 0.8,
    duration: 0.6,
    easing: [0.34, 1.56, 0.64, 1] as number[],
  },
  
  fadeIn: {
    direction: 'fade' as const,
    duration: 1.0,
    easing: 'easeOut',
  },
  
  rotateIn: {
    direction: 'rotateX' as const,
    rotationDegrees: 20,
    duration: 1.0,
    easing: [0.25, 0.46, 0.45, 0.94] as number[],
  },
  
  staggerUp: {
    direction: 'up' as const,
    distance: 40,
    duration: 0.6,
    stagger: 0.15,
    cascade: true,
    easing: [0.25, 0.1, 0.25, 1] as number[],
  },
  
  staggerScale: {
    direction: 'scale' as const,
    scale: 0.9,
    duration: 0.5,
    stagger: 0.1,
    cascade: true,
    easing: [0.34, 1.56, 0.64, 1] as number[],
  },
} as const;

// Convenience components for common patterns
export const SlideUp: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.slideUp} />
);

export const SlideDown: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.slideDown} />
);

export const SlideLeft: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.slideLeft} />
);

export const SlideRight: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.slideRight} />
);

export const ScaleUp: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.scaleUp} />
);

export const FadeIn: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.fadeIn} />
);

export const StaggerUp: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.staggerUp} />
);

export const StaggerScale: React.FC<Omit<ScrollRevealProps, 'config'>> = (props) => (
  <ScrollReveal {...props} config={RevealPresets.staggerScale} />
);

export default ScrollRevealProvider;