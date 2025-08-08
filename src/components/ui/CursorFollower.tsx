'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useMousePosition } from '@/hooks/useParallax';
import { cn } from '@/utils/cn';

interface CursorFollowerProps {
  children?: React.ReactNode;
  className?: string;
  
  // Cursor customization
  size?: number;
  color?: string;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'difference' | 'exclusion';
  
  // Animation options
  followSpeed?: number;
  scaleOnHover?: number;
  scaleOnClick?: number;
  magneticStrength?: number;
  
  // Visual effects
  showTrail?: boolean;
  trailLength?: number;
  showRipple?: boolean;
  showGlow?: boolean;
  glowColor?: string;
  
  // Interaction modes
  mode?: 'follow' | 'magnetic' | 'spotlight' | 'ripple' | 'particle';
  
  // Responsiveness
  hideOnMobile?: boolean;
  hideOnTouch?: boolean;
  disabled?: boolean;
}

interface CursorState {
  x: number;
  y: number;
  isClicking: boolean;
  isHovering: boolean;
  targetElement: HTMLElement | null;
  cursorText: string;
  cursorIcon: React.ReactNode | null;
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  id: number;
}

const CursorFollower: React.FC<CursorFollowerProps> = ({
  children,
  className,
  size = 20,
  color = '#FF6B9D',
  blendMode = 'difference',
  followSpeed = 0.15,
  scaleOnHover = 1.5,
  scaleOnClick = 0.8,
  magneticStrength = 0.3,
  showTrail = true,
  trailLength = 8,
  showRipple = true,
  showGlow = false,
  glowColor,
  mode = 'follow',
  hideOnMobile = true,
  hideOnTouch = true,
  disabled = false,
}) => {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    isClicking: false,
    isHovering: false,
    targetElement: null,
    cursorText: '',
    cursorIcon: null,
  });
  
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trailCounterRef = useRef(0);
  const rippleCounterRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();
  
  const { mousePosition, isHovering: isMouseInWindow } = useMousePosition({
    throttle: 16,
  });

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Show/hide cursor based on conditions
  useEffect(() => {
    const shouldShow = !disabled && 
                      !shouldReduceMotion && 
                      isMouseInWindow &&
                      !(hideOnMobile && window.innerWidth < 768) &&
                      !(hideOnTouch && isTouchDevice);
    
    setIsVisible(shouldShow);
  }, [disabled, shouldReduceMotion, isMouseInWindow, hideOnMobile, hideOnTouch, isTouchDevice]);

  // Update cursor position with smooth following
  const updateCursorPosition = useCallback(() => {
    if (!isVisible) return;

    setCursorState(prev => {
      const deltaX = mousePosition.x - prev.x;
      const deltaY = mousePosition.y - prev.y;
      
      // Apply magnetic effect if hovering over interactive elements
      let targetX = mousePosition.x;
      let targetY = mousePosition.y;
      
      if (mode === 'magnetic' && prev.targetElement) {
        const rect = prev.targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        targetX += (centerX - mousePosition.x) * magneticStrength;
        targetY += (centerY - mousePosition.y) * magneticStrength;
      }
      
      return {
        ...prev,
        x: prev.x + (targetX - prev.x) * followSpeed,
        y: prev.y + (targetY - prev.y) * followSpeed,
      };
    });

    // Update trail
    if (showTrail) {
      setTrail(prev => {
        const newTrail = [
          {
            x: cursorState.x,
            y: cursorState.y,
            timestamp: Date.now(),
            id: trailCounterRef.current++,
          },
          ...prev.slice(0, trailLength - 1),
        ];
        return newTrail;
      });
    }

    animationFrameRef.current = requestAnimationFrame(updateCursorPosition);
  }, [
    isVisible, 
    mousePosition, 
    followSpeed, 
    mode, 
    magneticStrength, 
    showTrail, 
    trailLength, 
    cursorState.x, 
    cursorState.y
  ]);

  useEffect(() => {
    if (isVisible) {
      animationFrameRef.current = requestAnimationFrame(updateCursorPosition);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, updateCursorPosition]);

  // Handle mouse events
  useEffect(() => {
    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, isClicking: true }));
      
      // Create ripple effect
      if (showRipple) {
        setRipples(prev => [...prev, {
          id: rippleCounterRef.current++,
          x: mousePosition.x,
          y: mousePosition.y,
        }]);
        
        // Clean up ripples
        setTimeout(() => {
          setRipples(prev => prev.slice(1));
        }, 1000);
      }
    };

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, isClicking: false }));
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveElement = target.closest('[data-cursor]') || 
                                 target.closest('button') || 
                                 target.closest('a') ||
                                 target.closest('[role="button"]');

      if (interactiveElement) {
        const cursorData = interactiveElement.getAttribute('data-cursor');
        const cursorText = interactiveElement.getAttribute('data-cursor-text') || '';
        
        setCursorState(prev => ({
          ...prev,
          isHovering: true,
          targetElement: interactiveElement as HTMLElement,
          cursorText,
          cursorIcon: null, // Could be extended to support icons
        }));
      } else {
        setCursorState(prev => ({
          ...prev,
          isHovering: false,
          targetElement: null,
          cursorText: '',
          cursorIcon: null,
        }));
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
    };
  }, [mousePosition, showRipple]);

  // Animation variants
  const cursorVariants: any = {
    default: {
      scale: 1,
      opacity: 0.8,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    hover: {
      scale: scaleOnHover,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    click: {
      scale: scaleOnClick,
      opacity: 1,
      transition: { duration: 0.1, ease: 'easeOut' as const },
    },
  };

  const getAnimationState = () => {
    if (cursorState.isClicking) return 'click';
    if (cursorState.isHovering) return 'hover';
    return 'default';
  };

  if (!isVisible) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50', className)}>
      {children}
      
      {/* Main Cursor */}
      <motion.div
        ref={cursorRef}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          mixBlendMode: blendMode,
          transform: 'translate(-50%, -50%)',
          left: cursorState.x,
          top: cursorState.y,
        }}
        variants={cursorVariants}
        animate={getAnimationState()}
      >
        {/* Glow Effect */}
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full blur-md"
            style={{
              backgroundColor: glowColor || color,
              opacity: 0.6,
              transform: 'scale(2)',
            }}
          />
        )}

        {/* Cursor Text */}
        <AnimatePresence>
          {cursorState.cursorText && (
            <motion.div
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2"
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {cursorState.cursorText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trail Effect */}
      {showTrail && (
        <div className="absolute inset-0">
          {trail.map((point, index) => {
            const opacity = (trail.length - index) / trail.length;
            const scale = opacity * 0.5;
            
            return (
              <motion.div
                key={point.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: size * scale,
                  height: size * scale,
                  backgroundColor: color,
                  mixBlendMode: blendMode,
                  transform: 'translate(-50%, -50%)',
                  left: point.x,
                  top: point.y,
                  opacity: opacity * 0.3,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              />
            );
          })}
        </div>
      )}

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border pointer-events-none"
            style={{
              borderColor: color,
              transform: 'translate(-50%, -50%)',
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Spotlight Mode */}
      {mode === 'spotlight' && (
        <div
          className="absolute inset-0 bg-black/50 pointer-events-none"
          style={{
            background: `radial-gradient(circle 100px at ${cursorState.x}px ${cursorState.y}px, transparent 0%, black 100%)`,
          }}
        />
      )}

      {/* Particle Mode */}
      {mode === 'particle' && cursorState.isHovering && (
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full pointer-events-none"
              style={{
                backgroundColor: color,
                left: cursorState.x + Math.cos(i * 60) * 20,
                top: cursorState.y + Math.sin(i * 60) * 20,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, Math.cos(i * 60) * 40],
                y: [0, Math.sin(i * 60) * 40],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Preset configurations
export const CursorPresets = {
  default: {
    mode: 'follow' as const,
    size: 20,
    showTrail: true,
  },
  
  magnetic: {
    mode: 'magnetic' as const,
    magneticStrength: 0.3,
    scaleOnHover: 2,
    showGlow: true,
  },
  
  spotlight: {
    mode: 'spotlight' as const,
    size: 0,
    showTrail: false,
    showRipple: false,
  },
  
  minimal: {
    size: 8,
    showTrail: false,
    showRipple: false,
    blendMode: 'difference' as const,
  },
  
  particle: {
    mode: 'particle' as const,
    size: 12,
    showTrail: false,
    color: '#4ECDC4',
  },
  
  premium: {
    mode: 'magnetic' as const,
    size: 24,
    showTrail: true,
    showRipple: true,
    showGlow: true,
    magneticStrength: 0.4,
    scaleOnHover: 1.8,
  },
} as const;

export default CursorFollower;
export type { CursorFollowerProps };