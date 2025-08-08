'use client';

import { useState, useEffect, useCallback } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
    ratio: number;
  };
  supportsTouch: boolean;
  supportsHover: boolean;
  hasNotch: boolean;
  isStandalone: boolean; // PWA mode
  viewportHeight: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Mobile-first breakpoints matching our Tailwind config
const BREAKPOINTS = {
  mobile: 320,
  mobileLg: 414,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const;

export const useMobileDetection = (): MobileDetectionResult => {
  const [mounted, setMounted] = useState(false);
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    deviceType: 'desktop',
    orientation: 'landscape',
    screenSize: {
      width: 1920,
      height: 1080,
      ratio: 16/9,
    },
    supportsTouch: false,
    supportsHover: true,
    hasNotch: false,
    isStandalone: false,
    viewportHeight: 1080,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  // Get safe area insets for notched devices
  const getSafeAreaInsets = useCallback(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    };
  }, []);

  // Detect device capabilities and type
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined' || !mounted) return detection;

    const { innerWidth, innerHeight, screen } = window;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Basic device detection
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobileUA = /mobi|android/i.test(userAgent);
    
    // Touch detection
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    
    // Screen size detection
    const width = innerWidth;
    const height = innerHeight;
    const ratio = width / height;
    
    // Device type detection based on screen size and touch capability
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    let isMobile = false;
    let isTablet = false;
    let isDesktop = true;
    
    if (width <= BREAKPOINTS.mobileLg) {
      deviceType = 'mobile';
      isMobile = true;
      isTablet = false;
      isDesktop = false;
    } else if (width <= BREAKPOINTS.tablet || (supportsTouch && !supportsHover)) {
      deviceType = 'tablet';
      isMobile = false;
      isTablet = true;
      isDesktop = false;
    } else {
      deviceType = 'desktop';
      isMobile = false;
      isTablet = false;
      isDesktop = true;
    }
    
    // Override with user agent if mobile detected
    if (isMobileUA && width <= BREAKPOINTS.tablet) {
      deviceType = 'mobile';
      isMobile = true;
      isTablet = false;
      isDesktop = false;
    }
    
    // Orientation detection
    const orientation = height > width ? 'portrait' : 'landscape';
    
    // PWA detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    // Notch detection (simplified)
    const hasNotch = isIOS && (
      screen.width === 375 && screen.height === 812 || // iPhone X, XS, 11 Pro
      screen.width === 414 && screen.height === 896 || // iPhone XR, 11, XS Max, 11 Pro Max
      screen.width === 390 && screen.height === 844 || // iPhone 12, 12 Pro
      screen.width === 428 && screen.height === 926 || // iPhone 12 Pro Max
      screen.width === 393 && screen.height === 852 || // iPhone 14 Pro
      screen.width === 430 && screen.height === 932    // iPhone 14 Pro Max
    );
    
    // Viewport height (useful for mobile browser address bar)
    const viewportHeight = window.visualViewport?.height || innerHeight;
    
    // Safe area insets
    const safeAreaInsets = getSafeAreaInsets();
    
    const newDetection: MobileDetectionResult = {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice: supportsTouch,
      isIOS,
      isAndroid,
      deviceType,
      orientation,
      screenSize: {
        width,
        height,
        ratio,
      },
      supportsTouch,
      supportsHover,
      hasNotch,
      isStandalone,
      viewportHeight,
      safeAreaInsets,
    };
    
    setDetection(newDetection);
    return newDetection;
  }, [getSafeAreaInsets, mounted]);

  // Handle resize and orientation change
  const handleResize = useCallback(() => {
    if (!mounted) return;
    detectDevice();
  }, [detectDevice]);

  const handleOrientationChange = useCallback(() => {
    if (!mounted) return;
    // Delay to get accurate measurements after orientation change
    setTimeout(() => detectDevice(), 100);
  }, [detectDevice]);

  // Handle visual viewport changes (mobile browser address bar)
  const handleVisualViewportChange = useCallback(() => {
    if (window.visualViewport) {
      setDetection(prev => ({
        ...prev,
        viewportHeight: window.visualViewport!.height,
      }));
    }
  }, []);

  useEffect(() => {
    // Mark as mounted to avoid hydration mismatches
    setMounted(true);
    
    // Initial detection only on client
    detectDevice();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Visual viewport support for mobile browsers
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }
    
    // Media query listeners for hover/touch changes
    const hoverMediaQuery = window.matchMedia('(hover: hover)');
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleMediaQueryChange = () => {
      detectDevice();
    };
    
    if (hoverMediaQuery.addEventListener) {
      hoverMediaQuery.addEventListener('change', handleMediaQueryChange);
      standaloneMediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
      // Fallback for older browsers
      hoverMediaQuery.addListener(handleMediaQueryChange);
      standaloneMediaQuery.addListener(handleMediaQueryChange);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
      
      if (hoverMediaQuery.removeEventListener) {
        hoverMediaQuery.removeEventListener('change', handleMediaQueryChange);
        standaloneMediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
        hoverMediaQuery.removeListener(handleMediaQueryChange);
        standaloneMediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, [detectDevice, handleResize, handleOrientationChange, handleVisualViewportChange]);

  return detection;
};

// Hook for detecting specific mobile gestures
export const useMobileGestures = () => {
  const [gestureState, setGestureState] = useState({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    isPinching: false,
    pinchScale: 1,
    lastSwipeDirection: null as 'left' | 'right' | 'up' | 'down' | null,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    // Store initial touch position
    (e.currentTarget as any)._touchStartX = touch.clientX;
    (e.currentTarget as any)._touchStartY = touch.clientY;
    (e.currentTarget as any)._touchStartTime = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    // Handle pinch gesture
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (!(e.currentTarget as any)._initialPinchDistance) {
        (e.currentTarget as any)._initialPinchDistance = distance;
      }
      
      const scale = distance / (e.currentTarget as any)._initialPinchDistance;
      setGestureState(prev => ({
        ...prev,
        isPinching: true,
        pinchScale: scale,
      }));
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const target = e.currentTarget as any;
    const touch = e.changedTouches[0];
    if (!touch || !target._touchStartX) return;

    const deltaX = touch.clientX - target._touchStartX;
    const deltaY = touch.clientY - target._touchStartY;
    const deltaTime = Date.now() - target._touchStartTime;
    
    // Reset pinch state
    if (gestureState.isPinching) {
      setGestureState(prev => ({
        ...prev,
        isPinching: false,
        pinchScale: 1,
      }));
      target._initialPinchDistance = null;
      return;
    }

    // Swipe detection (minimum distance: 50px, maximum time: 300ms)
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      if (deltaTime < maxSwipeTime) {
        let direction: 'left' | 'right' | 'up' | 'down';
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        setGestureState(prev => ({
          ...prev,
          [`isSwipe${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: true,
          lastSwipeDirection: direction,
        }));
        
        // Reset swipe state after animation time
        setTimeout(() => {
          setGestureState(prev => ({
            ...prev,
            isSwipeLeft: false,
            isSwipeRight: false,
            isSwipeUp: false,
            isSwipeDown: false,
          }));
        }, 150);
      }
    }

    // Clean up touch data
    target._touchStartX = null;
    target._touchStartY = null;
    target._touchStartTime = null;
  }, [gestureState.isPinching]);

  // Return gesture handlers and state
  return {
    gestureState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};

export default useMobileDetection;