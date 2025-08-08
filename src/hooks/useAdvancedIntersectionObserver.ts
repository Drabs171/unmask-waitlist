'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface AdvancedIntersectionOptions extends IntersectionObserverInit {
  triggerPoints?: number[]; // [0, 0.25, 0.5, 0.75, 1]
  freezeOnceVisible?: boolean;
  trackViewportProgress?: boolean;
  debounceDelay?: number;
}

interface AdvancedIntersectionResult {
  isIntersecting: boolean;
  intersectionRatio: number;
  entry: IntersectionObserverEntry | null;
  viewportProgress: number; // 0 to 1 representing element progress through viewport
  triggerPoint: number | null; // Which threshold was crossed
  hasBeenVisible: boolean;
  isFullyVisible: boolean;
  direction: 'entering' | 'leaving' | null;
}

interface UseAdvancedIntersectionObserverReturn extends AdvancedIntersectionResult {
  ref: React.RefObject<HTMLElement>;
  observe: (element: HTMLElement) => void;
  unobserve: (element: HTMLElement) => void;
  disconnect: () => void;
}

const useAdvancedIntersectionObserver = (
  options: AdvancedIntersectionOptions = {}
): UseAdvancedIntersectionObserverReturn => {
  const {
    threshold = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
    root = null,
    rootMargin = '0px',
    triggerPoints = [0, 0.25, 0.5, 0.75, 1],
    freezeOnceVisible = false,
    trackViewportProgress = true,
    debounceDelay = 0,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousRatioRef = useRef<number>(0);
  const hasBeenVisibleRef = useRef<boolean>(false);

  const [state, setState] = useState<AdvancedIntersectionResult>({
    isIntersecting: false,
    intersectionRatio: 0,
    entry: null,
    viewportProgress: 0,
    triggerPoint: null,
    hasBeenVisible: false,
    isFullyVisible: false,
    direction: null,
  });

  // Calculate viewport progress
  const calculateViewportProgress = useCallback((entry: IntersectionObserverEntry): number => {
    if (!trackViewportProgress) return 0;

    const { boundingClientRect, rootBounds } = entry;
    if (!rootBounds) return 0;

    const elementHeight = boundingClientRect.height;
    const viewportHeight = rootBounds.height;
    const elementTop = boundingClientRect.top;
    const elementBottom = boundingClientRect.bottom;

    // Element is above viewport
    if (elementBottom < 0) return 0;
    // Element is below viewport
    if (elementTop > viewportHeight) return 0;

    // Element is in viewport - calculate progress
    const visibleTop = Math.max(0, -elementTop);
    const visibleBottom = Math.min(elementHeight, viewportHeight - elementTop);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    
    // Progress through viewport (0 when entering, 1 when fully passed)
    const progress = Math.min(1, Math.max(0, visibleHeight / elementHeight));
    
    return progress;
  }, [trackViewportProgress]);

  // Determine which trigger point was crossed
  const getTriggerPoint = useCallback((ratio: number, previousRatio: number): number | null => {
    for (const point of triggerPoints) {
      if (previousRatio < point && ratio >= point) {
        return point; // Crossing upward
      }
      if (previousRatio >= point && ratio < point) {
        return point; // Crossing downward
      }
    }
    return null;
  }, [triggerPoints]);

  // Debounced update function
  const updateState = useCallback((entry: IntersectionObserverEntry) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const updateFn = () => {
      const currentRatio = entry.intersectionRatio;
      const previousRatio = previousRatioRef.current;
      const viewportProgress = calculateViewportProgress(entry);
      const triggerPoint = getTriggerPoint(currentRatio, previousRatio);
      const isIntersecting = entry.isIntersecting;
      const isFullyVisible = currentRatio >= 0.99; // Account for floating point precision
      
      // Determine direction
      let direction: 'entering' | 'leaving' | null = null;
      if (currentRatio > previousRatio) {
        direction = 'entering';
      } else if (currentRatio < previousRatio) {
        direction = 'leaving';
      }

      // Track if element has ever been visible
      if (isIntersecting && !hasBeenVisibleRef.current) {
        hasBeenVisibleRef.current = true;
      }

      // Don't update if frozen once visible
      if (freezeOnceVisible && hasBeenVisibleRef.current && !isIntersecting) {
        return;
      }

      setState({
        isIntersecting,
        intersectionRatio: currentRatio,
        entry,
        viewportProgress,
        triggerPoint,
        hasBeenVisible: hasBeenVisibleRef.current,
        isFullyVisible,
        direction,
      });

      previousRatioRef.current = currentRatio;
    };

    if (debounceDelay > 0) {
      timeoutRef.current = setTimeout(updateFn, debounceDelay);
    } else {
      updateFn();
    }
  }, [calculateViewportProgress, getTriggerPoint, freezeOnceVisible, debounceDelay]);

  // Observer callback
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      updateState(entry);
    }
  }, [updateState]);

  // Initialize observer
  const initializeObserver = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold,
      root,
      rootMargin,
    });

    // Observe the ref element if it exists
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }
  }, [observerCallback, threshold, root, rootMargin]);

  // Manual observe function
  const observe = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  // Manual unobserve function
  const unobserve = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Initialize observer on mount and when options change
  useEffect(() => {
    initializeObserver();
    return disconnect;
  }, [initializeObserver, disconnect]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    ref: elementRef,
    observe,
    unobserve,
    disconnect,
  };
};

export default useAdvancedIntersectionObserver;