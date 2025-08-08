'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface MagneticOptions {
  strength?: number;
  radius?: number;
  restoreSpeed?: number;
  disabled?: boolean;
}

interface MagneticState {
  x: number;
  y: number;
  isHovering: boolean;
  isActive: boolean;
}

export const useMagneticMouse = (options: MagneticOptions = {}) => {
  const {
    strength = 0.3,
    radius = 100,
    restoreSpeed = 0.15,
    disabled = false,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const shouldReduceMotion = useReducedMotion();
  
  const [state, setState] = useState<MagneticState>({
    x: 0,
    y: 0,
    isHovering: false,
    isActive: false,
  });

  const getCurrentTransform = useCallback(() => {
    if (!elementRef.current) return { x: 0, y: 0 };
    
    const element = elementRef.current;
    const style = window.getComputedStyle(element);
    const transform = style.transform;
    
    if (transform === 'none') return { x: 0, y: 0 };
    
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(', ').map(Number);
      return { x: values[4] || 0, y: values[5] || 0 };
    }
    
    return { x: 0, y: 0 };
  }, []);

  const animate = useCallback((targetX: number, targetY: number) => {
    if (!elementRef.current || shouldReduceMotion || disabled) return;

    const current = getCurrentTransform();
    const deltaX = targetX - current.x;
    const deltaY = targetY - current.y;
    
    // Smooth interpolation
    const newX = current.x + deltaX * restoreSpeed;
    const newY = current.y + deltaY * restoreSpeed;
    
    elementRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    
    // Continue animation if not close enough to target
    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
      animationRef.current = requestAnimationFrame(() => animate(targetX, targetY));
    }
  }, [getCurrentTransform, restoreSpeed, shouldReduceMotion, disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!elementRef.current || shouldReduceMotion || disabled) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < radius) {
      const force = (radius - distance) / radius;
      const translateX = deltaX * strength * force;
      const translateY = deltaY * strength * force;
      
      setState(prev => ({
        ...prev,
        x: translateX,
        y: translateY,
        isHovering: true,
        isActive: true,
      }));

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    } else if (state.isHovering) {
      setState(prev => ({
        ...prev,
        isHovering: false,
      }));
    }
  }, [radius, strength, state.isHovering, shouldReduceMotion, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (shouldReduceMotion || disabled) return;

    setState(prev => ({
      ...prev,
      isHovering: false,
      isActive: false,
    }));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Animate back to center
    animate(0, 0);
  }, [animate, shouldReduceMotion, disabled]);

  const handleMouseEnter = useCallback(() => {
    if (shouldReduceMotion || disabled) return;

    setState(prev => ({
      ...prev,
      isActive: true,
    }));
  }, [shouldReduceMotion, disabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || shouldReduceMotion || disabled) return;

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, shouldReduceMotion, disabled]);

  // Reset transform on disable
  useEffect(() => {
    if ((disabled || shouldReduceMotion) && elementRef.current) {
      elementRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
      setState({
        x: 0,
        y: 0,
        isHovering: false,
        isActive: false,
      });
    }
  }, [disabled, shouldReduceMotion]);

  return {
    ref: elementRef,
    ...state,
  };
};