'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface UseParallaxOptions {
  speed?: number;
  offset?: number;
  disabled?: boolean;
  element?: HTMLElement | null;
  reverse?: boolean;
  clamp?: [number, number]; // [min, max] transform values
}

interface ParallaxLayer {
  id: string;
  speed: number;
  offset?: number;
  element?: HTMLElement | null;
  reverse?: boolean;
  clamp?: [number, number];
}

interface UseMultiLayerParallaxOptions {
  layers: ParallaxLayer[];
  disabled?: boolean;
  throttle?: number;
}

interface MultiLayerParallaxResult {
  transforms: Record<string, number>;
  scrollY: number;
  windowHeight: number;
  isScrolling: boolean;
  scrollProgress: number; // 0 to 1
  scrollDirection: 'up' | 'down' | null;
}

// Enhanced single-layer parallax hook
export const useParallax = ({ 
  speed = 0.5, 
  offset = 0, 
  disabled = false,
  element = null,
  reverse = false,
  clamp,
}: UseParallaxOptions = {}) => {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [elementBounds, setElementBounds] = useState<DOMRect | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const rafRef = useRef<number>();

  const handleScroll = useCallback(() => {
    if (disabled || shouldReduceMotion) return;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.pageYOffset);
    });
  }, [disabled, shouldReduceMotion]);

  const handleResize = useCallback(() => {
    setWindowHeight(window.innerHeight);
    
    if (element) {
      setElementBounds(element.getBoundingClientRect());
    }
  }, [element]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setWindowHeight(window.innerHeight);
    
    if (element) {
      setElementBounds(element.getBoundingClientRect());
    }
    
    if (disabled || shouldReduceMotion) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, handleResize, disabled, shouldReduceMotion, element]);

  // Calculate transform based on element position or global scroll
  const calculateTransform = useCallback(() => {
    if (disabled || shouldReduceMotion) return 0;

    let baseTransform = scrollY * speed + offset;
    
    if (reverse) {
      baseTransform = -baseTransform;
    }

    // Element-specific parallax calculation
    if (element && elementBounds) {
      const elementTop = elementBounds.top + scrollY;
      const elementHeight = elementBounds.height;
      const viewportCenter = scrollY + windowHeight / 2;
      
      // Calculate relative position of viewport center to element
      const relativePosition = (viewportCenter - elementTop) / elementHeight;
      
      // Only apply transform when element is in or near viewport
      if (relativePosition >= -0.5 && relativePosition <= 1.5) {
        baseTransform = relativePosition * speed * 100;
      } else {
        baseTransform = 0;
      }
    }

    // Clamp values if specified
    if (clamp) {
      baseTransform = Math.max(clamp[0], Math.min(clamp[1], baseTransform));
    }

    return baseTransform;
  }, [scrollY, speed, offset, reverse, disabled, shouldReduceMotion, element, elementBounds, windowHeight, clamp]);

  const transform = calculateTransform();

  return {
    scrollY,
    transform,
    windowHeight,
    isScrolling: scrollY > 0,
    elementBounds,
  };
};

// Multi-layer parallax hook for complex scenes
export const useMultiLayerParallax = ({
  layers,
  disabled = false,
  throttle = 16,
}: UseMultiLayerParallaxOptions): MultiLayerParallaxResult => {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const rafRef = useRef<number>();
  const lastScrollYRef = useRef<number>(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    if (disabled || shouldReduceMotion) return;
    
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }
    
    throttleTimeoutRef.current = setTimeout(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset;
        const direction = currentScrollY > lastScrollYRef.current ? 'down' : 'up';
        
        setScrollY(currentScrollY);
        setScrollDirection(direction);
        lastScrollYRef.current = currentScrollY;
      });
    }, throttle);
  }, [disabled, shouldReduceMotion, throttle]);

  const handleResize = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setWindowHeight(window.innerHeight);
    lastScrollYRef.current = window.pageYOffset;
    
    if (disabled || shouldReduceMotion) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [handleScroll, handleResize, disabled, shouldReduceMotion]);

  // Calculate transforms for all layers
  const transforms = layers.reduce<Record<string, number>>((acc, layer) => {
    if (disabled || shouldReduceMotion) {
      acc[layer.id] = 0;
      return acc;
    }

    let transform = scrollY * layer.speed + (layer.offset || 0);
    
    if (layer.reverse) {
      transform = -transform;
    }

    // Clamp values if specified
    if (layer.clamp) {
      transform = Math.max(layer.clamp[0], Math.min(layer.clamp[1], transform));
    }

    acc[layer.id] = transform;
    return acc;
  }, {});

  // Calculate scroll progress (0 to 1)
  const scrollProgress = windowHeight > 0 
    ? Math.min(scrollY / (document.documentElement.scrollHeight - windowHeight), 1)
    : 0;

  return {
    transforms,
    scrollY,
    windowHeight,
    isScrolling: scrollY > 0,
    scrollProgress,
    scrollDirection,
  };
};

interface UseMousePositionOptions {
  includeTouch?: boolean;
  throttle?: number;
  element?: HTMLElement | null;
}

interface UseMouseParallaxOptions {
  strength?: number; // Parallax intensity multiplier
  inverted?: boolean;
  element?: HTMLElement | null;
  throttle?: number;
  includeTouch?: boolean;
  disabled?: boolean;
}

interface MouseParallaxResult {
  mousePosition: { x: number; y: number };
  relativePosition: { x: number; y: number }; // -1 to 1 relative to element center
  transform: { x: number; y: number };
  isHovering: boolean;
}

export const useMousePosition = ({ 
  includeTouch = false, 
  throttle = 16,
  element = null,
}: UseMousePositionOptions = {}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>();

  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const clientX = 'clientX' in event ? event.clientX : event.touches[0]?.clientX || 0;
      const clientY = 'clientY' in event ? event.clientY : event.touches[0]?.clientY || 0;
      
      setMousePosition({ x: clientX, y: clientY });
      setIsHovering(true);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const target = element || window;
    let timeoutId: NodeJS.Timeout;
    
    const throttledMouseMove = (event: MouseEvent | TouchEvent) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleMouseMove(event), throttle);
    };

    target.addEventListener('mousemove', throttledMouseMove as EventListener);
    target.addEventListener('mouseleave', handleMouseLeave as EventListener);

    if (includeTouch) {
      target.addEventListener('touchmove', throttledMouseMove as EventListener, { passive: true });
      target.addEventListener('touchend', handleMouseLeave as EventListener);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      target.removeEventListener('mousemove', throttledMouseMove as EventListener);
      target.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      
      if (includeTouch) {
        target.removeEventListener('touchmove', throttledMouseMove as EventListener);
        target.removeEventListener('touchend', handleMouseLeave as EventListener);
      }
    };
  }, [handleMouseMove, handleMouseLeave, includeTouch, throttle, element]);

  return {
    mousePosition,
    isHovering,
  };
};

// Mouse-based parallax effect
export const useMouseParallax = ({
  strength = 20,
  inverted = false,
  element = null,
  throttle = 16,
  includeTouch = false,
  disabled = false,
}: UseMouseParallaxOptions = {}): MouseParallaxResult => {
  const [elementBounds, setElementBounds] = useState<DOMRect | null>(null);
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();
  
  const { mousePosition, isHovering } = useMousePosition({ 
    includeTouch, 
    throttle,
    element,
  });

  // Update element bounds on resize or element change
  useEffect(() => {
    if (!element) return;
    
    const updateBounds = () => {
      setElementBounds(element.getBoundingClientRect());
    };
    
    updateBounds();
    
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(element);
    
    window.addEventListener('resize', updateBounds);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, [element]);

  // Calculate relative position and transform
  useEffect(() => {
    if (disabled || shouldReduceMotion || !elementBounds || !isHovering) {
      setRelativePosition({ x: 0, y: 0 });
      setTransform({ x: 0, y: 0 });
      return;
    }

    const elementCenterX = elementBounds.left + elementBounds.width / 2;
    const elementCenterY = elementBounds.top + elementBounds.height / 2;
    
    // Calculate relative position (-1 to 1)
    const relativeX = (mousePosition.x - elementCenterX) / (elementBounds.width / 2);
    const relativeY = (mousePosition.y - elementCenterY) / (elementBounds.height / 2);
    
    // Clamp values to [-1, 1]
    const clampedX = Math.max(-1, Math.min(1, relativeX));
    const clampedY = Math.max(-1, Math.min(1, relativeY));
    
    setRelativePosition({ x: clampedX, y: clampedY });
    
    // Calculate transform values
    const multiplier = inverted ? -1 : 1;
    const transformX = clampedX * strength * multiplier;
    const transformY = clampedY * strength * multiplier;
    
    setTransform({ x: transformX, y: transformY });
  }, [mousePosition, elementBounds, strength, inverted, disabled, shouldReduceMotion, isHovering]);

  return {
    mousePosition,
    relativePosition,
    transform,
    isHovering,
  };
};