'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Screen reader announcement hook
export function useScreenReader() {
  const announceText = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.getElementById('screen-reader-announcements');
    if (announcement) {
      announcement.setAttribute('aria-live', priority);
      announcement.textContent = message;
      
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        announcement.textContent = '';
      }, 1000);
    }
  }, []);

  return { announceText };
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return { isFocusVisible };
}

// Focus trap hook for modals and dialogs
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[data-close]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    // Focus first element when trap activates
    if (firstElement) {
      firstElement.focus();
    }

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}

// Reduced motion preference hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// High contrast mode detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Color scheme preference hook
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    setColorScheme(mediaQuery.matches ? 'light' : 'dark');

    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'light' : 'dark');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return colorScheme;
}

// ARIA attributes helper
export function useAriaAttributes(
  role?: string,
  label?: string,
  describedBy?: string,
  expanded?: boolean,
  pressed?: boolean,
  selected?: boolean,
  checked?: boolean | 'mixed'
) {
  return {
    ...(role && { role }),
    ...(label && { 'aria-label': label }),
    ...(describedBy && { 'aria-describedby': describedBy }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    ...(pressed !== undefined && { 'aria-pressed': pressed }),
    ...(selected !== undefined && { 'aria-selected': selected }),
    ...(checked !== undefined && { 'aria-checked': checked }),
  };
}

// Loading state announcements
export function useLoadingAnnouncement() {
  const { announceText } = useScreenReader();

  const announceLoading = useCallback((message: string = 'Loading') => {
    announceText(`${message}. Please wait.`, 'polite');
  }, [announceText]);

  const announceLoaded = useCallback((message: string = 'Content loaded') => {
    announceText(message, 'polite');
  }, [announceText]);

  const announceError = useCallback((message: string = 'An error occurred') => {
    announceText(message, 'assertive');
  }, [announceText]);

  return {
    announceLoading,
    announceLoaded,
    announceError,
  };
}

// Form validation announcements
export function useFormAnnouncements() {
  const { announceText } = useScreenReader();

  const announceValidationError = useCallback((fieldName: string, error: string) => {
    announceText(`${fieldName}: ${error}`, 'assertive');
  }, [announceText]);

  const announceFormSuccess = useCallback((message: string = 'Form submitted successfully') => {
    announceText(message, 'polite');
  }, [announceText]);

  const announceFieldChange = useCallback((fieldName: string, value: string) => {
    announceText(`${fieldName} changed to ${value}`, 'polite');
  }, [announceText]);

  return {
    announceValidationError,
    announceFormSuccess,
    announceFieldChange,
  };
}

// Live region helper for dynamic content
export function useLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const updateLiveRegion = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    atomic: boolean = true
  ) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.setAttribute('aria-atomic', atomic.toString());
      liveRegionRef.current.textContent = message;
    }
  }, []);

  const clearLiveRegion = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
  }, []);

  return {
    liveRegionRef,
    updateLiveRegion,
    clearLiveRegion,
  };
}