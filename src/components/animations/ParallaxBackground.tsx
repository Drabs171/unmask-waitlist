'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';

interface ParallaxOrb {
  id: number;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  speed: number;
  blur: number;
  opacity: number;
}

interface ParallaxBackgroundProps {
  className?: string;
  orbCount?: number;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  className = '',
  orbCount = 5,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { transform: slowParallax } = useParallax({ speed: 0.2 });
  const { transform: fastParallax } = useParallax({ speed: 0.5 });

  const orbs: ParallaxOrb[] = React.useMemo(() => {
    return Array.from({ length: orbCount }, (_, i) => ({
      id: i,
      size: Math.random() * 400 + 200,
      color: i % 2 === 0 ? '#FF6B9D' : '#4ECDC4',
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      speed: Math.random() * 0.3 + 0.1,
      blur: Math.random() * 20 + 40,
      opacity: Math.random() * 0.1 + 0.05,
    }));
  }, [orbCount]);

  if (shouldReduceMotion) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {orbs.map((orb) => (
          <div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              left: `${orb.initialX}%`,
              top: `${orb.initialY}%`,
              width: orb.size,
              height: orb.size,
              backgroundColor: orb.color,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity * 0.3,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />

      {/* Floating Orbs with Parallax */}
      {orbs.map((orb, index) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${orb.initialX}%`,
            top: `${orb.initialY}%`,
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            filter: `blur(${orb.blur}px)`,
            opacity: orb.opacity,
          }}
          animate={{
            y: index % 2 === 0 ? slowParallax * orb.speed : fastParallax * orb.speed,
            x: Math.sin(Date.now() / 10000 + index) * 20,
            scale: [1, 1.1, 1],
          }}
          transition={{
            y: { duration: 0 },
            x: { duration: 0 },
            scale: {
              duration: 6 + index,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}

      {/* Animated Gradient Mesh */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 107, 157, 0.05) 0%, transparent 50%)
          `,
        }}
        animate={{
          backgroundPosition: [
            '20% 80%, 80% 20%, 40% 40%',
            '25% 85%, 85% 15%, 35% 45%',
            '20% 80%, 80% 20%, 40% 40%',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default ParallaxBackground;