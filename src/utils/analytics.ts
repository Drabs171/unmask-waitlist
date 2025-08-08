interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

interface AnalyticsConfig {
  isEnabled: boolean;
  providers: {
    ga4: boolean;
    facebookPixel: boolean;
    customApi: boolean;
  };
  consentGiven: boolean;
  sessionId: string;
  userId?: string;
}

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
}

class Analytics {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;
  private sessionStartTime: number;
  private lastActivityTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    
    this.config = {
      isEnabled: process.env.NODE_ENV === 'production',
      providers: {
        ga4: false,
        facebookPixel: false,
        customApi: true,
      },
      consentGiven: false,
      sessionId: this.generateSessionId(),
      userId: this.getUserId(),
    };

    this.initializeFromStorage();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    let userId = localStorage.getItem('unmask_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('unmask_user_id', userId);
    }
    return userId;
  }

  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    const consent = this.getStoredConsent();
    if (consent) {
      this.updateConsentState(consent);
    }

    // Initialize providers based on consent
    this.initializeProviders();
  }

  private getStoredConsent(): ConsentState | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('unmask_analytics_consent');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  updateConsentState(consent: ConsentState): void {
    this.config.consentGiven = consent.analytics;
    this.config.providers.ga4 = consent.analytics;
    this.config.providers.facebookPixel = consent.marketing;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('unmask_analytics_consent', JSON.stringify(consent));
    }

    this.initializeProviders();
    
    // Process queued events if consent is given
    if (this.config.consentGiven && this.eventQueue.length > 0) {
      this.processEventQueue();
    }
  }

  private initializeProviders(): void {
    if (!this.config.consentGiven) return;

    // Initialize Google Analytics 4
    if (this.config.providers.ga4 && typeof window !== 'undefined') {
      this.initializeGA4();
    }

    // Initialize Facebook Pixel
    if (this.config.providers.facebookPixel && typeof window !== 'undefined') {
      this.initializeFacebookPixel();
    }

    this.isInitialized = true;
  }

  private initializeGA4(): void {
    const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
    if (!GA4_ID) return;

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
    };
    
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', GA4_ID, {
      user_id: this.config.userId,
      session_id: this.config.sessionId,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }

  private initializeFacebookPixel(): void {
    const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    if (!PIXEL_ID) return;

    // Load Facebook Pixel
    !(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', PIXEL_ID);
    (window as any).fbq('track', 'PageView');
  }

  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  track(event: AnalyticsEvent): void {
    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Dev]', event.name, event.properties);
    }

    // Add session and user context
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      userId: event.userId || this.config.userId,
      sessionId: event.sessionId || this.config.sessionId,
      timestamp: event.timestamp || new Date().toISOString(),
      properties: {
        ...event.properties,
        session_start_time: this.sessionStartTime,
        time_since_session_start: Date.now() - this.sessionStartTime,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
        screen_resolution: typeof window !== 'undefined' ? 
          `${window.screen.width}x${window.screen.height}` : '',
        viewport_size: typeof window !== 'undefined' ? 
          `${window.innerWidth}x${window.innerHeight}` : '',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
        language: typeof window !== 'undefined' ? navigator.language : '',
      },
    };

    // Update activity time
    this.lastActivityTime = Date.now();

    if (!this.config.consentGiven) {
      // Queue event if no consent
      this.eventQueue.push(enrichedEvent);
      return;
    }

    this.sendEvent(enrichedEvent);
  }

  private sendEvent(event: AnalyticsEvent): void {
    try {
      // Send to Google Analytics 4
      if (this.config.providers.ga4 && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.name, {
          ...event.properties,
          user_id: event.userId,
          session_id: event.sessionId,
        });
      }

      // Send to Facebook Pixel
      if (this.config.providers.facebookPixel && typeof window !== 'undefined' && (window as any).fbq) {
        const pixelEventName = this.mapToPixelEvent(event.name);
        if (pixelEventName) {
          (window as any).fbq('track', pixelEventName, event.properties);
        }
      }

      // Send to custom analytics
      if (this.config.providers.customApi) {
        this.sendToCustomAnalytics(event);
      }
    } catch (error) {
      console.error('[Analytics Error]', error);
    }
  }

  private mapToPixelEvent(eventName: string): string | null {
    const eventMap: Record<string, string> = {
      'page_view': 'PageView',
      'waitlist_signup': 'Lead',
      'form_start': 'InitiateCheckout',
      'button_click': 'Click',
      'social_share': 'Share',
      'feature_view': 'ViewContent',
    };
    
    return eventMap[eventName] || null;
  }

  private sendToCustomAnalytics(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return;

    // Use navigator.sendBeacon for better reliability
    const data = JSON.stringify({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', data);
    } else {
      // Fallback to fetch
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
        keepalive: true,
      }).catch((error) => {
        console.error('[Analytics API Error]', error);
      });
    }
  }

  // Enhanced convenience methods
  pageView(page: string, additionalProps?: Record<string, unknown>): void {
    this.track({
      name: 'page_view',
      properties: {
        page,
        ...additionalProps,
      }
    });
  }

  waitlistSignup(email: string, source?: string, additionalProps?: Record<string, unknown>): void {
    this.track({
      name: 'waitlist_signup',
      properties: {
        email_domain: email.split('@')[1],
        source: source || 'hero_cta',
        conversion_point: 'waitlist_form',
        ...additionalProps,
      }
    });
  }

  buttonClick(buttonName: string, location: string, additionalProps?: Record<string, unknown>): void {
    this.track({
      name: 'button_click',
      properties: {
        button_name: buttonName,
        location,
        ...additionalProps,
      }
    });
  }

  formInteraction(formName: string, action: string, field?: string, additionalProps?: Record<string, unknown>): void {
    this.track({
      name: 'form_interaction',
      properties: {
        form_name: formName,
        action, // start, field_focus, field_blur, validation_error, submit
        field,
        ...additionalProps,
      }
    });
  }

  socialShare(platform: string, content: string, location: string): void {
    this.track({
      name: 'social_share',
      properties: {
        platform,
        content_type: content,
        location,
      }
    });
  }

  featureInteraction(featureName: string, action: string, additionalProps?: Record<string, unknown>): void {
    this.track({
      name: 'feature_interaction',
      properties: {
        feature_name: featureName,
        action, // view, click, swipe_left, swipe_right, hover
        ...additionalProps,
      }
    });
  }

  performanceMetric(metricName: string, value: number, additionalProps?: Record<string, unknown>): void {
    this.track({
      name: 'performance_metric',
      properties: {
        metric_name: metricName,
        value,
        ...additionalProps,
      }
    });
  }

  error(errorType: string, errorMessage: string, location: string): void {
    this.track({
      name: 'error',
      properties: {
        error_type: errorType,
        error_message: errorMessage,
        location,
      }
    });
  }

  // Session management
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime;
  }

  // Get analytics state for debugging
  getState(): AnalyticsConfig {
    return { ...this.config };
  }
}

export const analytics = new Analytics();

// Helper functions for tracking waitlist conversion funnel
export const trackConversionFunnel = {
  landingPageView: () => analytics.pageView('landing'),
  heroCtaClick: () => analytics.buttonClick('join_revolution', 'hero'),
  formView: () => analytics.formInteraction('waitlist', 'view'),
  formStart: () => analytics.formInteraction('waitlist', 'start'),
  formFieldFocus: (field: string) => analytics.formInteraction('waitlist', 'field_focus', field),
  formFieldBlur: (field: string) => analytics.formInteraction('waitlist', 'field_blur', field),
  formValidationError: (field: string, error: string) => analytics.formInteraction('waitlist', 'validation_error', field, { error }),
  formComplete: (email: string) => analytics.waitlistSignup(email, 'hero_cta'),
  formError: (error: string) => analytics.error('form_submission', error, 'waitlist_form'),
};

// Feature interaction helpers
export const trackFeatureInteractions = {
  cardView: (featureName: string, index: number) => 
    analytics.featureInteraction(featureName, 'view', { card_index: index }),
  cardClick: (featureName: string, index: number) => 
    analytics.featureInteraction(featureName, 'click', { card_index: index }),
  cardSwipeLeft: (featureName: string, index: number) => 
    analytics.featureInteraction(featureName, 'swipe_left', { card_index: index }),
  cardSwipeRight: (featureName: string, index: number) => 
    analytics.featureInteraction(featureName, 'swipe_right', { card_index: index }),
  cardHover: (featureName: string, index: number, duration: number) => 
    analytics.featureInteraction(featureName, 'hover', { card_index: index, hover_duration: duration }),
};

// Social sharing helpers
export const trackSocialSharing = {
  shareButtonClick: (location: string) => 
    analytics.buttonClick('share_button', location),
  shareSuccess: (platform: string, location: string) => 
    analytics.socialShare(platform, 'waitlist_page', location),
  shareFallback: (location: string) => 
    analytics.track({ name: 'share_fallback_shown', properties: { location } }),
  copyLinkSuccess: (location: string) => 
    analytics.track({ name: 'copy_link_success', properties: { location } }),
};

// Performance tracking helpers  
export const trackPerformance = {
  pageLoad: (loadTime: number) => 
    analytics.performanceMetric('page_load_time', loadTime),
  firstContentfulPaint: (time: number) => 
    analytics.performanceMetric('first_contentful_paint', time),
  largestContentfulPaint: (time: number) => 
    analytics.performanceMetric('largest_contentful_paint', time),
  firstInputDelay: (time: number) => 
    analytics.performanceMetric('first_input_delay', time),
  cumulativeLayoutShift: (score: number) => 
    analytics.performanceMetric('cumulative_layout_shift', score),
  timeToInteractive: (time: number) => 
    analytics.performanceMetric('time_to_interactive', time),
};

// Mobile-specific tracking helpers
export const trackMobileInteractions = {
  touchStart: (element: string) => 
    analytics.track({ name: 'mobile_touch_start', properties: { element } }),
  swipeGesture: (direction: string, element: string) => 
    analytics.track({ name: 'mobile_swipe_gesture', properties: { direction, element } }),
  pinchGesture: (scale: number, element: string) => 
    analytics.track({ name: 'mobile_pinch_gesture', properties: { scale, element } }),
  orientationChange: (orientation: string) => 
    analytics.track({ name: 'mobile_orientation_change', properties: { orientation } }),
  hapticFeedback: (type: string, element: string) => 
    analytics.track({ name: 'mobile_haptic_feedback', properties: { type, element } }),
  pullToRefresh: (success: boolean) => 
    analytics.track({ name: 'mobile_pull_to_refresh', properties: { success } }),
};

// A/B testing helpers
export const trackABTest = {
  variantShown: (testName: string, variant: string) => 
    analytics.track({ 
      name: 'ab_test_variant_shown', 
      properties: { test_name: testName, variant } 
    }),
  variantInteraction: (testName: string, variant: string, interaction: string) => 
    analytics.track({ 
      name: 'ab_test_interaction', 
      properties: { test_name: testName, variant, interaction } 
    }),
  conversionGoal: (testName: string, variant: string, goal: string) => 
    analytics.track({ 
      name: 'ab_test_conversion', 
      properties: { test_name: testName, variant, goal } 
    }),
};

// Export types for external use
export type { AnalyticsEvent, ConsentState };