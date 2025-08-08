'use client';

import React, { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import CookieConsent from '@/components/ui/CookieConsent';
import { usePageTracking, useErrorTracking, useSessionTracking } from '@/hooks/useAnalytics';
import { initializeWaitlistTests } from '@/utils/abTesting';
import { analytics } from '@/utils/analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const pathname = usePathname();

  // Initialize analytics hooks
  usePageTracking();
  useErrorTracking();
  useSessionTracking();

  useEffect(() => {
    // Initialize A/B tests
    initializeWaitlistTests();

    // Track app initialization
    analytics.track({
      name: 'app_initialized',
      properties: {
        pathname,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    });

    // Set up performance monitoring
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Monitor Core Web Vitals
      const observeWebVitals = () => {
        try {
          // Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as PerformanceEntry[] as any) {
              const anyEntry: any = entry;
              analytics.performanceMetric('largest_contentful_paint', entry.startTime, {
                element: anyEntry.element?.tagName?.toLowerCase?.(),
              });
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay (FID) via First Input
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as PerformanceEntry[] as any) {
              const anyEntry: any = entry;
              const fid = (anyEntry.processingStart ?? 0) - entry.startTime;
              analytics.performanceMetric('first_input_delay', fid, {
                input_type: entry.name,
              });
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift (CLS)
          let clsScore = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as PerformanceEntry[] as any) {
              const anyEntry: any = entry;
              if (!anyEntry.hadRecentInput) {
                clsScore += (anyEntry.value ?? 0);
              }
            }
            analytics.performanceMetric('cumulative_layout_shift', clsScore);
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          // Long Tasks (for performance monitoring)
          const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              analytics.track({
                name: 'long_task_detected',
                properties: {
                  duration: entry.duration,
                  start_time: entry.startTime,
                }
              });
            }
          });
          longTaskObserver.observe({ entryTypes: ['longtask'] });

        } catch (error) {
          console.error('Error setting up performance monitoring:', error);
        }
      };

      // Initialize performance monitoring after a short delay
      setTimeout(observeWebVitals, 1000);
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      analytics.track({
        name: 'page_visibility_change',
        properties: {
          visibility_state: document.visibilityState,
          hidden: document.hidden,
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth && scrollPercent % 25 === 0) {
        maxScrollDepth = scrollPercent;
        analytics.track({
          name: 'scroll_depth',
          properties: {
            scroll_percent: scrollPercent,
            page_height: document.documentElement.scrollHeight,
            viewport_height: window.innerHeight,
          }
        });
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const timeSpent = Date.now() - startTime;
      
      // Track significant time milestones
      if ([30000, 60000, 120000, 300000].includes(timeSpent)) { // 30s, 1m, 2m, 5m
        analytics.track({
          name: 'time_on_page_milestone',
          properties: {
            time_spent: timeSpent,
            milestone: `${timeSpent / 1000}s`,
          }
        });
      }
    };

    const timeInterval = setInterval(trackTimeOnPage, 30000); // Check every 30 seconds

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
      clearTimeout(scrollTimeout);
    };
  }, [pathname]);

  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
};

export default AnalyticsProvider;