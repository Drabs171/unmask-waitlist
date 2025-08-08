'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart as HeartIcon } from 'lucide-react';
import { useMousePosition } from '@/hooks/useParallax';

interface HeartProps {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

interface FloatingHeartsProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
  colors?: string[];
  mouseInteraction?: boolean;
  spawnRate?: number;
  className?: string;
}

const Heart: React.FC<HeartProps & { mouseX: number; mouseY: number; mouseInteraction: boolean }> = ({
  initialX,
  initialY,
  size,
  duration,
  delay,
  color,
  opacity,
  mouseX,
  mouseY,
  mouseInteraction,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Calculate distance from mouse for interaction effect
  const mouseDistance = useMemo(() => {
    if (!mouseInteraction) return 0;
    const dx = mouseX - initialX;
    const dy = mouseY - initialY;
    return Math.sqrt(dx * dx + dy * dy);
  }, [mouseX, mouseY, initialX, initialY, mouseInteraction]);

  const mouseInfluence = useMemo(() => {
    if (!mouseInteraction || mouseDistance > 150) return { x: 0, y: 0 };
    const influence = Math.max(0, 1 - mouseDistance / 150);
    const angle = Math.atan2(mouseY - initialY, mouseX - initialX);
    return {
      x: Math.cos(angle) * influence * 20,
      y: Math.sin(angle) * influence * 20,
    };
  }, [mouseDistance, mouseX, mouseY, initialX, initialY, mouseInteraction]);

  if (shouldReduceMotion) {
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          color,
          opacity: opacity * 0.3,
        }}
      >
        <HeartIcon size={size} fill="currentColor" />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute pointer-events-none will-change-transform"
      initial={{
        x: initialX,
        y: initialY,
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 360,
      }}
      animate={{
        y: [initialY, initialY - window.innerHeight - 100],
        opacity: [0, opacity, opacity, 0],
        scale: [0, 1, 1, 0.8],
        rotate: [0, 360],
        x: initialX + Math.sin(Date.now() / 1000) * 50,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
      }}
      style={{
        width: size,
        height: size,
        color,
      }}
    >
      <motion.div
        animate={mouseInteraction ? {
          x: mouseInfluence.x,
          y: mouseInfluence.y,
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
      >
        <HeartIcon 
          size={size} 
          fill="currentColor"
          className="filter drop-shadow-sm"
        />
      </motion.div>
    </motion.div>
  );
};

const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  count = 12,
  minSize = 12,
  maxSize = 32,
  minDuration = 8,
  maxDuration = 15,
  colors = ['#FF6B9D', '#4ECDC4', '#FF8A80', '#81C784'],
  mouseInteraction = true,
  spawnRate = 3000,
  className = '',
}) => {
  const [hearts, setHearts] = useState<HeartProps[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const { mousePosition } = useMousePosition({ throttle: 50 });
  const shouldReduceMotion = useReducedMotion();

  // Initialize hearts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);

    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Generate initial hearts
  useEffect(() => {
    if (windowSize.width === 0) return;

    const generateHeart = (id: number, delay = 0): HeartProps => ({
      id,
      initialX: Math.random() * windowSize.width,
      initialY: windowSize.height + Math.random() * 200,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.2,
    });

    const initialHearts = Array.from({ length: count }, (_, i) => 
      generateHeart(i, Math.random() * 5)
    );

    setHearts(initialHearts);
  }, [count, minSize, maxSize, minDuration, maxDuration, colors, windowSize]);

  // Continuous spawning of new hearts
  useEffect(() => {
    if (shouldReduceMotion || windowSize.width === 0) return;

    let heartId = count;
    
    const spawnHeart = () => {
      setHearts(prev => {
        const newHeart: HeartProps = {
          id: heartId++,
          initialX: Math.random() * windowSize.width,
          initialY: windowSize.height + Math.random() * 100,
          size: Math.random() * (maxSize - minSize) + minSize,
          duration: Math.random() * (maxDuration - minDuration) + minDuration,
          delay: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.3 + 0.1,
        };

        // Keep only recent hearts to prevent memory leaks
        const recentHearts = prev.slice(-count * 2);
        return [...recentHearts, newHeart];
      });
    };

    const interval = setInterval(spawnHeart, spawnRate);
    return () => clearInterval(interval);
  }, [
    count,
    minSize,
    maxSize,
    minDuration,
    maxDuration,
    colors,
    spawnRate,
    windowSize,
    shouldReduceMotion,
  ]);

  if (windowSize.width === 0) return null;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{ willChange: 'transform' }}
    >
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          {...heart}
          mouseX={mousePosition.x}
          mouseY={mousePosition.y}
          mouseInteraction={mouseInteraction}
        />
      ))}
    </div>
  );
};

export default FloatingHearts;