'use client';

import { analytics } from './analytics';

export interface ABTestConfig {
  testName: string;
  variants: ABVariant[];
  weights?: number[];
  startDate?: Date;
  endDate?: Date;
  targetingRules?: TargetingRule[];
  sampleRate?: number; // 0-1, percentage of users to include
}

export interface ABVariant {
  name: string;
  weight: number;
  config: Record<string, unknown>;
}

export interface TargetingRule {
  type: 'device' | 'referrer' | 'utm_source' | 'location' | 'user_agent';
  operator: 'equals' | 'contains' | 'not_equals' | 'regex';
  value: string;
}

export interface ABTestResult {
  testName: string;
  variant: string;
  config: Record<string, unknown>;
  isActive: boolean;
  isEligible: boolean;
}

class ABTestManager {
  private activeTests: Map<string, ABTestResult> = new Map();
  private userId: string;
  private sessionId: string;

  constructor() {
    this.userId = this.getUserId();
    this.sessionId = this.getSessionId();
    this.loadStoredTests();
  }

  private getUserId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let userId = localStorage.getItem('unmask_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('unmask_user_id', userId);
    }
    return userId;
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('unmask_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('unmask_session_id', sessionId);
    }
    return sessionId;
  }

  private loadStoredTests(): void {
    if (typeof window === 'undefined') return;

    const storedTests = localStorage.getItem('unmask_ab_tests');
    if (storedTests) {
      try {
        const tests = JSON.parse(storedTests);
        Object.entries(tests).forEach(([testName, result]) => {
          this.activeTests.set(testName, result as ABTestResult);
        });
      } catch (error) {
        console.error('Error loading stored A/B tests:', error);
      }
    }
  }

  private saveStoredTests(): void {
    if (typeof window === 'undefined') return;

    const testsObject = Object.fromEntries(this.activeTests.entries());
    localStorage.setItem('unmask_ab_tests', JSON.stringify(testsObject));
  }

  // Hash function for consistent variant assignment
  private hashUserId(testName: string): number {
    const str = `${this.userId}_${testName}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Check if user meets targeting criteria
  private checkTargeting(rules?: TargetingRule[]): boolean {
    if (!rules || rules.length === 0) return true;
    if (typeof window === 'undefined') return true;

    return rules.every(rule => {
      let testValue = '';
      
      switch (rule.type) {
        case 'device':
          testValue = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
          break;
        case 'referrer':
          testValue = document.referrer;
          break;
        case 'utm_source':
          testValue = new URLSearchParams(window.location.search).get('utm_source') || '';
          break;
        case 'user_agent':
          testValue = navigator.userAgent;
          break;
        case 'location':
          testValue = window.location.href;
          break;
        default:
          return true;
      }

      switch (rule.operator) {
        case 'equals':
          return testValue === rule.value;
        case 'contains':
          return testValue.includes(rule.value);
        case 'not_equals':
          return testValue !== rule.value;
        case 'regex':
          try {
            return new RegExp(rule.value).test(testValue);
          } catch {
            return false;
          }
        default:
          return true;
      }
    });
  }

  // Check if test is within date range
  private checkDateRange(startDate?: Date, endDate?: Date): boolean {
    const now = new Date();
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  }

  // Initialize or get existing test
  initializeTest(config: ABTestConfig): ABTestResult {
    const { testName, variants, weights, startDate, endDate, targetingRules, sampleRate = 1 } = config;

    // Check if test already exists
    const existingTest = this.activeTests.get(testName);
    if (existingTest) {
      return existingTest;
    }

    // Check date range
    const isInDateRange = this.checkDateRange(startDate, endDate);
    
    // Check targeting
    const meetsTargeting = this.checkTargeting(targetingRules);
    
    // Check sample rate
    const hashValue = this.hashUserId(testName);
    const isInSample = (hashValue % 10000) / 10000 < sampleRate;
    
    const isEligible = isInDateRange && meetsTargeting && isInSample;
    
    let selectedVariant = variants[0]; // Default to first variant
    
    if (isEligible && variants.length > 1) {
      // Calculate variant selection based on weights
      const totalWeight = weights ? weights.reduce((sum, weight) => sum + weight, 0) : variants.length;
      const selection = (hashValue % 10000) / 10000 * totalWeight;
      
      let cumulativeWeight = 0;
      for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights ? weights[i] : 1;
        if (selection <= cumulativeWeight) {
          selectedVariant = variants[i];
          break;
        }
      }
    }

    const result: ABTestResult = {
      testName,
      variant: selectedVariant.name,
      config: selectedVariant.config,
      isActive: isInDateRange,
      isEligible,
    };

    this.activeTests.set(testName, result);
    this.saveStoredTests();

    // Track variant assignment
    if (isEligible) {
      analytics.track({
        name: 'ab_test_variant_assigned',
        properties: {
          test_name: testName,
          variant: selectedVariant.name,
          is_eligible: isEligible,
          user_id: this.userId,
          session_id: this.sessionId,
        }
      });
    }

    return result;
  }

  // Get test result
  getTest(testName: string): ABTestResult | null {
    return this.activeTests.get(testName) || null;
  }

  // Track test interaction
  trackInteraction(testName: string, interaction: string, properties?: Record<string, unknown>): void {
    const test = this.activeTests.get(testName);
    if (!test || !test.isEligible) return;

    analytics.track({
      name: 'ab_test_interaction',
      properties: {
        test_name: testName,
        variant: test.variant,
        interaction,
        ...properties,
      }
    });
  }

  // Track conversion goal
  trackConversion(testName: string, goal: string, value?: number, properties?: Record<string, unknown>): void {
    const test = this.activeTests.get(testName);
    if (!test || !test.isEligible) return;

    analytics.track({
      name: 'ab_test_conversion',
      properties: {
        test_name: testName,
        variant: test.variant,
        goal,
        value,
        ...properties,
      }
    });
  }

  // Get all active tests
  getActiveTests(): Record<string, ABTestResult> {
    return Object.fromEntries(this.activeTests.entries());
  }

  // Force variant for testing (development only)
  forceVariant(testName: string, variantName: string, config: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('forceVariant should only be used in development');
      return;
    }

    const result: ABTestResult = {
      testName,
      variant: variantName,
      config,
      isActive: true,
      isEligible: true,
    };

    this.activeTests.set(testName, result);
    this.saveStoredTests();
  }

  // Clear all tests (for testing)
  clearTests(): void {
    this.activeTests.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unmask_ab_tests');
    }
  }
}

// Singleton instance
export const abTestManager = new ABTestManager();

// Pre-configured tests for the waitlist page
export const WAITLIST_AB_TESTS = {
  // Hero CTA button text test
  HERO_CTA_TEXT: {
    testName: 'hero_cta_text',
    variants: [
      {
        name: 'control',
        weight: 1,
        config: {
          text: 'Join the Revolution',
          description: 'Original CTA text'
        }
      },
      {
        name: 'variant_a',
        weight: 1,
        config: {
          text: 'Get Early Access',
          description: 'More direct, benefit-focused'
        }
      },
      {
        name: 'variant_b',
        weight: 1,
        config: {
          text: 'Start Dating Differently',
          description: 'Action-oriented, unique value prop'
        }
      }
    ],
    sampleRate: 0.8, // 80% of users
  },

  // Hero headline test
  HERO_HEADLINE: {
    testName: 'hero_headline',
    variants: [
      {
        name: 'control',
        weight: 1,
        config: {
          headline: 'Dating with Personality, Not Just Photos',
          subheadline: 'Discover who they really are. No filters. No facades. Just real connections.'
        }
      },
      {
        name: 'benefit_focused',
        weight: 1,
        config: {
          headline: 'Find Love Through Real Conversations',
          subheadline: 'Connect through personality first. Photos come later. Authentic dating starts here.'
        }
      }
    ],
    targetingRules: [
      {
        type: 'device' as const,
        operator: 'equals' as const,
        value: 'mobile'
      }
    ],
    sampleRate: 0.5, // 50% of mobile users
  },

  // Form layout test
  FORM_LAYOUT: {
    testName: 'form_layout',
    variants: [
      {
        name: 'single_step',
        weight: 1,
        config: {
          layout: 'single_step',
          showProgress: false,
          buttonSize: 'lg'
        }
      },
      {
        name: 'progressive',
        weight: 1,
        config: {
          layout: 'progressive',
          showProgress: true,
          buttonSize: 'xl'
        }
      }
    ],
    sampleRate: 0.6, // 60% of users
  },

  // Social proof position test
  SOCIAL_PROOF_POSITION: {
    testName: 'social_proof_position',
    variants: [
      {
        name: 'hero_bottom',
        weight: 1,
        config: {
          position: 'hero_bottom',
          format: 'compact'
        }
      },
      {
        name: 'form_top',
        weight: 1,
        config: {
          position: 'form_top',
          format: 'detailed'
        }
      }
    ],
  }
} as const;

// Helper hooks for React components
export const useABTest = (testName: string) => {
  const test = abTestManager.getTest(testName);
  
  return {
    variant: test?.variant || 'control',
    config: test?.config || {},
    isActive: test?.isActive || false,
    isEligible: test?.isEligible || false,
    trackInteraction: (interaction: string, properties?: Record<string, unknown>) => 
      abTestManager.trackInteraction(testName, interaction, properties),
    trackConversion: (goal: string, value?: number, properties?: Record<string, unknown>) => 
      abTestManager.trackConversion(testName, goal, value, properties),
  };
};

// Initialize common tests
export const initializeWaitlistTests = () => {
  Object.values(WAITLIST_AB_TESTS).forEach(testConfig => {
    abTestManager.initializeTest(testConfig);
  });
};

export default abTestManager;