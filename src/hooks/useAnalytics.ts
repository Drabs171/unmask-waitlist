'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  analytics, 
  trackConversionFunnel,
  trackFeatureInteractions,
  trackSocialSharing,
  trackPerformance,
  trackMobileInteractions,
  trackABTest
} from '@/utils/analytics';
import { useMobileDetection } from './useMobileDetection';

// Main analytics hook for page tracking
export const usePageTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, deviceType } = useMobileDetection();
  
  useEffect(() => {
    // Track page view with enhanced context
    const url = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    analytics.pageView('waitlist_page', {
      path: pathname,
      search: searchParams.toString(),
      device_type: deviceType,
      is_mobile: isMobile,
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      referrer: typeof window !== 'undefined' ? document.referrer : '',
    });

    // Track performance metrics
    if (typeof window !== 'undefined') {
      // Track page load performance
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        trackPerformance.pageLoad(navigationEntry.loadEventEnd - navigationEntry.loadEventStart);
      }

      // Track Core Web Vitals (guarded; webVitals may not exist)
      if (('web-vitals' in window) || (window as any).webVitals) {
        // This would be implemented with the web-vitals library
        // For now, we'll use basic performance API
        setTimeout(() => {
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            trackPerformance.firstContentfulPaint(fcpEntry.startTime);
          }
        }, 0);
      }
    }
  }, [pathname, searchParams, isMobile, deviceType]);
};

// Hook for tracking form interactions
export const useFormTracking = (formName: string) => {
  const formStarted = useRef(false);
  const fieldInteractions = useRef<Record<string, number>>({});
  
  const trackFormStart = useCallback(() => {
    if (!formStarted.current) {
      trackConversionFunnel.formStart();
      formStarted.current = true;
    }
  }, []);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackConversionFunnel.formFieldFocus(fieldName);
    fieldInteractions.current[fieldName] = (fieldInteractions.current[fieldName] || 0) + 1;
  }, []);

  const trackFieldBlur = useCallback((fieldName: string) => {
    trackConversionFunnel.formFieldBlur(fieldName);
  }, []);

  const trackValidationError = useCallback((fieldName: string, error: string) => {
    trackConversionFunnel.formValidationError(fieldName, error);
  }, []);

  const trackFormSubmit = useCallback((success: boolean, email?: string) => {
    if (success && email) {
      trackConversionFunnel.formComplete(email);
    } else {
      trackConversionFunnel.formError('Submission failed');
    }
  }, []);

  return {
    trackFormStart,
    trackFieldFocus,
    trackFieldBlur,
    trackValidationError,
    trackFormSubmit,
    getFieldInteractions: () => ({ ...fieldInteractions.current }),
  };
};

// Hook for tracking feature card interactions
export const useFeatureCardTracking = () => {
  const hoverTimes = useRef<Record<string, number>>({});
  
  const trackCardView = useCallback((featureName: string, index: number) => {
    trackFeatureInteractions.cardView(featureName, index);
  }, []);

  const trackCardClick = useCallback((featureName: string, index: number) => {
    trackFeatureInteractions.cardClick(featureName, index);
  }, []);

  const trackCardHoverStart = useCallback((featureName: string, index: number) => {
    hoverTimes.current[`${featureName}-${index}`] = Date.now();
  }, []);

  const trackCardHoverEnd = useCallback((featureName: string, index: number) => {
    const startTime = hoverTimes.current[`${featureName}-${index}`];
    if (startTime) {
      const duration = Date.now() - startTime;
      trackFeatureInteractions.cardHover(featureName, index, duration);
      delete hoverTimes.current[`${featureName}-${index}`];
    }
  }, []);

  const trackCardSwipe = useCallback((featureName: string, index: number, direction: 'left' | 'right') => {
    if (direction === 'left') {
      trackFeatureInteractions.cardSwipeLeft(featureName, index);
    } else {
      trackFeatureInteractions.cardSwipeRight(featureName, index);
    }
  }, []);

  return {
    trackCardView,
    trackCardClick,
    trackCardHoverStart,
    trackCardHoverEnd,
    trackCardSwipe,
  };
};

// Hook for tracking button interactions with enhanced context
export const useButtonTracking = () => {
  const trackButtonClick = useCallback((
    buttonName: string, 
    location: string, 
    additionalContext?: Record<string, unknown>
  ) => {
    analytics.buttonClick(buttonName, location, additionalContext);
  }, []);

  const trackCTAClick = useCallback((ctaType: string, location: string) => {
    analytics.buttonClick(`cta_${ctaType}`, location, {
      cta_type: ctaType,
      is_primary_cta: ctaType === 'join_waitlist',
    });
  }, []);

  return {
    trackButtonClick,
    trackCTAClick,
  };
};

// Hook for tracking social sharing
export const useSocialSharingTracking = () => {
  const trackShareAttempt = useCallback((location: string) => {
    trackSocialSharing.shareButtonClick(location);
  }, []);

  const trackShareSuccess = useCallback((platform: string, location: string) => {
    trackSocialSharing.shareSuccess(platform, location);
  }, []);

  const trackShareFallback = useCallback((location: string) => {
    trackSocialSharing.shareFallback(location);
  }, []);

  const trackCopyLink = useCallback((location: string) => {
    trackSocialSharing.copyLinkSuccess(location);
  }, []);

  return {
    trackShareAttempt,
    trackShareSuccess,
    trackShareFallback,
    trackCopyLink,
  };
};

// Hook for tracking mobile-specific interactions
export const useMobileTracking = () => {
  const { isMobile } = useMobileDetection();
  
  const trackTouchInteraction = useCallback((element: string, interactionType: string) => {
    if (!isMobile) return;
    
    trackMobileInteractions.touchStart(element);
    
    analytics.track({
      name: 'mobile_interaction',
      properties: {
        element,
        interaction_type: interactionType,
      }
    });
  }, [isMobile]);

  const trackSwipeGesture = useCallback((direction: string, element: string) => {
    if (!isMobile) return;
    trackMobileInteractions.swipeGesture(direction, element);
  }, [isMobile]);

  const trackHapticFeedback = useCallback((type: string, element: string) => {
    if (!isMobile) return;
    trackMobileInteractions.hapticFeedback(type, element);
  }, [isMobile]);

  const trackPullToRefresh = useCallback((success: boolean) => {
    if (!isMobile) return;
    trackMobileInteractions.pullToRefresh(success);
  }, [isMobile]);

  // Track orientation changes
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      const orientation = screen.orientation?.type || 
                         (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      trackMobileInteractions.orientationChange(orientation);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [isMobile]);

  return {
    trackTouchInteraction,
    trackSwipeGesture,
    trackHapticFeedback,
    trackPullToRefresh,
  };
};

// Hook for A/B testing
export const useABTesting = () => {
  const activeTests = useRef<Record<string, string>>({});
  
  const initializeTest = useCallback((testName: string, variants: string[], weights?: number[]) => {
    // Skip if already initialized
    if (activeTests.current[testName]) {
      return activeTests.current[testName];
    }

    // Get or assign variant based on user ID
    const storedVariant = localStorage.getItem(`ab_test_${testName}`);
    
    let selectedVariant: string;
    
    if (storedVariant && variants.includes(storedVariant)) {
      selectedVariant = storedVariant;
    } else {
      // Assign variant based on weights or equally
      const totalWeight = weights ? weights.reduce((sum, weight) => sum + weight, 0) : variants.length;
      const random = Math.random() * totalWeight;
      
      let cumulativeWeight = 0;
      selectedVariant = variants[0]; // fallback
      
      for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights ? weights[i] : 1;
        if (random <= cumulativeWeight) {
          selectedVariant = variants[i];
          break;
        }
      }
      
      localStorage.setItem(`ab_test_${testName}`, selectedVariant);
    }
    
    activeTests.current[testName] = selectedVariant;
    
    // Track variant assignment
    trackABTest.variantShown(testName, selectedVariant);
    
    return selectedVariant;
  }, []);

  const trackTestInteraction = useCallback((testName: string, interaction: string) => {
    const variant = activeTests.current[testName];
    if (variant) {
      trackABTest.variantInteraction(testName, variant, interaction);
    }
  }, []);

  const trackTestConversion = useCallback((testName: string, goal: string) => {
    const variant = activeTests.current[testName];
    if (variant) {
      trackABTest.conversionGoal(testName, variant, goal);
    }
  }, []);

  return {
    initializeTest,
    trackTestInteraction,
    trackTestConversion,
    getActiveTests: () => ({ ...activeTests.current }),
  };
};

// Hook for error tracking
export const useErrorTracking = () => {
  const trackError = useCallback((
    error: Error | string, 
    location: string, 
    context?: Record<string, unknown>
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    analytics.error('javascript_error', errorMessage, location);
    
    // Additional context for debugging
    analytics.track({
      name: 'error_detailed',
      properties: {
        error_message: errorMessage,
        error_stack: errorStack,
        location,
        ...context,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
      }
    });
  }, []);

  // Set up global error handlers
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(event.error || event.message, 'global_error_handler', {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        event.reason?.message || 'Unhandled promise rejection', 
        'unhandled_promise_rejection',
        {
          reason: event.reason,
        }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    trackError,
  };
};

// Hook for session tracking
export const useSessionTracking = () => {
  const sessionData = useRef({
    startTime: Date.now(),
    pageViews: 0,
    interactions: 0,
  });

  const trackSessionInteraction = useCallback(() => {
    sessionData.current.interactions += 1;
  }, []);

  const getSessionData = useCallback(() => {
    return {
      ...sessionData.current,
      duration: Date.now() - sessionData.current.startTime,
    };
  }, []);

  // Track session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const session = getSessionData();
      analytics.track({
        name: 'session_end',
        properties: {
          session_duration: session.duration,
          page_views: session.pageViews,
          interactions: session.interactions,
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [getSessionData]);

  return {
    trackSessionInteraction,
    getSessionData,
  };
};