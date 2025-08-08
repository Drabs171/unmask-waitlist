'use client';

import React from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';

interface MotionProviderProps {
  children: React.ReactNode;
}

const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  // Optimized transition settings for Chrome performance
  const optimizedTransition: any = {
    type: "spring" as const,
    stiffness: 400,
    damping: 40,
    mass: 1,
    // Use shorter durations for better performance
    duration: shouldReduceMotion ? 0 : 0.4,
    // Optimize easing for GPU acceleration
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  };

  // Features to enable for better performance
  const features = {
    // Enable layout animations
    layout: true,
    // Reduce motion if user prefers it
    animate: !shouldReduceMotion,
    // Enable exit animations
    exit: !shouldReduceMotion,
    // Optimize hover states
    hover: !shouldReduceMotion,
    // Optimize tap states for mobile
    tap: true,
    // Enable drag if needed (disabled for performance)
    drag: false,
  };

  return (
    <MotionConfig
      transition={optimizedTransition}
      // Reduce animation complexity on lower-end devices
      reducedMotion={shouldReduceMotion ? "always" : "never"}
    >
      {children}
    </MotionConfig>
  );
};

export default MotionProvider;