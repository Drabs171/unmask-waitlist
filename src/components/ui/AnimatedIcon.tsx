'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Heart, 
  Star, 
  Play, 
  Pause, 
  Download, 
  Upload,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Eye,
  EyeOff,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface AnimatedIconProps {
  icon: LucideIcon | string;
  size?: number;
  className?: string;
  
  // Animation Options
  hoverEffect?: 'scale' | 'rotate' | 'bounce' | 'glow' | 'shake' | 'pulse' | 'morph' | 'none';
  morphTo?: LucideIcon;
  morphTrigger?: 'hover' | 'click' | 'auto';
  morphDuration?: number;
  
  // State-based morphing
  state?: 'default' | 'active' | 'loading' | 'success' | 'error';
  
  // Interactive options
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  
  // Styling
  color?: string;
  hoverColor?: string;
  glowColor?: string;
  strokeWidth?: number;
  
  // Advanced animations
  continuousAnimation?: boolean;
  animationDelay?: number;
  floatingEffect?: boolean;
  particleEffect?: boolean;
}

// Predefined icon morphing pairs
const morphingPairs = {
  'play-pause': { from: Play, to: Pause },
  'heart-filled': { from: Heart, to: Heart }, // Filled vs outline handled by CSS
  'star-filled': { from: Star, to: Star },
  'menu-close': { from: Menu, to: X },
  'chevron-toggle': { from: ChevronDown, to: ChevronUp },
  'plus-minus': { from: Plus, to: Minus },
  'eye-toggle': { from: Eye, to: EyeOff },
  'download-upload': { from: Download, to: Upload },
  'arrow-check': { from: ArrowRight, to: Check },
} as const;

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  size = 24,
  className,
  hoverEffect = 'scale',
  morphTo,
  morphTrigger = 'hover',
  morphDuration = 0.3,
  state = 'default',
  onClick,
  onHoverStart,
  onHoverEnd,
  color = 'currentColor',
  hoverColor,
  glowColor,
  strokeWidth = 2,
  continuousAnimation = false,
  animationDelay = 0,
  floatingEffect = false,
  particleEffect = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMorphed, setIsMorphed] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const iconRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const particleCounter = useRef(0);

  // Resolve icon component
  const getCurrentIcon = () => {
    if (typeof icon === 'string') {
      // Handle predefined morphing pairs
      const pair = morphingPairs[icon as keyof typeof morphingPairs];
      if (pair) {
        return isMorphed ? pair.to : pair.from;
      }
      // Fallback to a default icon if string doesn't match
      return ArrowRight;
    }
    
    // Handle explicit morphTo prop
    if (morphTo && isMorphed) {
      return morphTo;
    }
    
    return icon;
  };

  const IconComponent = getCurrentIcon();

  // Handle morphing triggers
  useEffect(() => {
    if (morphTrigger === 'auto' && !shouldReduceMotion) {
      const interval = setInterval(() => {
        setIsMorphed(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [morphTrigger, shouldReduceMotion]);

  // Handle particle cleanup
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const createParticles = (event: React.MouseEvent) => {
    if (!particleEffect || shouldReduceMotion) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: particleCounter.current++,
      x: centerX + (Math.random() - 0.5) * 20,
      y: centerY + (Math.random() - 0.5) * 20,
    }));
    
    setParticles(newParticles);
  };

  const handleHoverStart = () => {
    setIsHovered(true);
    
    if (morphTrigger === 'hover') {
      setIsMorphed(true);
    }
    
    if (onHoverStart) {
      onHoverStart();
    }
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    
    if (morphTrigger === 'hover') {
      setIsMorphed(false);
    }
    
    if (onHoverEnd) {
      onHoverEnd();
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (morphTrigger === 'click') {
      setIsMorphed(prev => !prev);
    }
    
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    
    createParticles(event);
    
    if (onClick) {
      onClick();
    }
  };

  // Animation variants based on hover effect
  const getAnimationVariants = () => {
    const baseVariants = {
      initial: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: `drop-shadow(0 0 0px ${glowColor || color})`,
      },
      hover: {},
      clicked: { scale: 0.9, transition: { duration: 0.1 } },
    };

    switch (hoverEffect) {
      case 'scale':
        baseVariants.hover = { 
          scale: 1.1,
          transition: { duration: 0.2, ease: 'easeOut' }
        };
        break;
        
      case 'rotate':
        baseVariants.hover = { 
          rotate: 15,
          transition: { duration: 0.2, ease: 'easeOut' }
        };
        break;
        
      case 'bounce':
        baseVariants.hover = { 
          y: [-2, 2, 0],
          transition: { duration: 0.4, ease: 'easeInOut' }
        };
        break;
        
      case 'glow':
        baseVariants.hover = { 
          filter: `drop-shadow(0 0 10px ${glowColor || color})`,
          transition: { duration: 0.3 }
        };
        break;
        
      case 'shake':
        baseVariants.hover = { 
          x: [-1, 1, -1, 1, 0],
          transition: { duration: 0.4 }
        };
        break;
        
      case 'pulse':
        baseVariants.hover = { 
          scale: [1, 1.1, 1],
          transition: { duration: 0.6, repeat: Infinity }
        };
        break;
        
      case 'morph':
        // Handled by icon switching
        baseVariants.hover = {
          scale: 1.05,
          transition: { duration: 0.2 }
        };
        break;
        
      default:
        break;
    }

    return baseVariants;
  };

  const variants = getAnimationVariants();

  // Continuous animation variants
  const continuousVariants: any = {
    animate: {
      rotate: continuousAnimation && !shouldReduceMotion ? 360 : 0,
      transition: {
        duration: 2,
        repeat: continuousAnimation ? Infinity : 0,
        ease: 'linear' as const,
        delay: animationDelay,
      }
    }
  };

  // Floating effect variants
  const floatingVariants: any = {
    animate: {
      y: floatingEffect && !shouldReduceMotion ? [-2, 2] : 0,
      transition: {
        duration: 2,
        repeat: floatingEffect ? Infinity : 0,
        repeatType: 'reverse' as const,
        ease: 'easeInOut' as const,
        delay: animationDelay,
      }
    }
  };

  // State-based colors
  const getStateColor = () => {
    switch (state) {
      case 'active': return '#FF6B9D';
      case 'loading': return '#6B7280';
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      default: return color;
    }
  };

  const currentColor = isHovered && hoverColor ? hoverColor : getStateColor();

  return (
    <motion.div
      ref={iconRef}
      className={cn(
        'inline-flex items-center justify-center relative',
        onClick && 'cursor-pointer',
        className
      )}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      variants={variants}
      initial="initial"
      animate={
        shouldReduceMotion 
          ? "initial"
          : isClicked 
            ? "clicked" 
            : isHovered 
              ? "hover" 
              : "initial"
      }
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Continuous Animation Wrapper */}
      <motion.div
        variants={continuousVariants}
        animate="animate"
      >
        {/* Floating Effect Wrapper */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
        >
          {/* Icon with Morphing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${IconComponent.name}-${isMorphed}`}
              initial={{ 
                scale: shouldReduceMotion ? 1 : 0, 
                opacity: shouldReduceMotion ? 1 : 0,
                rotate: shouldReduceMotion ? 0 : 180 
              }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: 0 
              }}
              exit={{ 
                scale: shouldReduceMotion ? 1 : 0, 
                opacity: shouldReduceMotion ? 1 : 0,
                rotate: shouldReduceMotion ? 0 : -180 
              }}
              transition={{ 
                duration: shouldReduceMotion ? 0 : morphDuration,
                ease: 'easeInOut' 
              }}
            >
              <IconComponent
                size={size}
                color={currentColor}
                strokeWidth={strokeWidth}
                className={cn(
                  'transition-colors duration-200',
                  state === 'loading' && 'animate-pulse'
                )}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Particle Effects */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              backgroundColor: currentColor,
              left: particle.x,
              top: particle.y,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: [0, (Math.random() - 0.5) * 40],
              y: [0, (Math.random() - 0.5) * 40],
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Loading State Spinner */}
      {state === 'loading' && (
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-current rounded-full"
          animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ color: currentColor }}
        />
      )}
    </motion.div>
  );
};

// Preset configurations
export const IconPresets = {
  default: {
    hoverEffect: 'scale' as const,
    size: 24,
  },
  
  button: {
    hoverEffect: 'glow' as const,
    size: 20,
    particleEffect: true,
  },
  
  navigation: {
    hoverEffect: 'scale' as const,
    size: 24,
    morphTrigger: 'hover' as const,
  },
  
  playButton: {
    icon: 'play-pause',
    hoverEffect: 'scale' as const,
    morphTrigger: 'click' as const,
    size: 32,
    glowColor: '#FF6B9D',
  },
  
  loading: {
    hoverEffect: 'none' as const,
    continuousAnimation: true,
    state: 'loading' as const,
  },
  
  floating: {
    hoverEffect: 'glow' as const,
    floatingEffect: true,
    glowColor: '#4ECDC4',
  },
  
  interactive: {
    hoverEffect: 'bounce' as const,
    particleEffect: true,
    morphTrigger: 'click' as const,
  },
} as const;

// Convenience components for common use cases
export const PlayPauseIcon: React.FC<Omit<AnimatedIconProps, 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="play-pause" />
);

export const MenuToggleIcon: React.FC<Omit<AnimatedIconProps, 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="menu-close" />
);

export const HeartIcon: React.FC<Omit<AnimatedIconProps, 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon={Heart} hoverEffect="pulse" />
);

export const StarIcon: React.FC<Omit<AnimatedIconProps, 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon={Star} hoverEffect="glow" />
);

export default AnimatedIcon;
export type { AnimatedIconProps };