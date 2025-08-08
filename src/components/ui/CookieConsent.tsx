'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  Cookie, 
  Settings, 
  Shield, 
  BarChart3, 
  Target, 
  X,
  Check,
  ExternalLink
} from 'lucide-react';
import { analytics, ConsentState } from '@/utils/analytics';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import MobileButton from './MobileButton';

interface CookieConsentProps {
  className?: string;
}

type ConsentView = 'banner' | 'preferences' | 'hidden';

const CookieConsent: React.FC<CookieConsentProps> = ({ className }) => {
  const [view, setView] = useState<ConsentView>('hidden');
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    functional: true, // Always required
    timestamp: new Date().toISOString(),
  });
  const [hasShown, setHasShown] = useState(false);
  
  const { isMobile, safeAreaInsets } = useMobileDetection();

  // Check for existing consent on mount
  useEffect(() => {
    const existingConsent = localStorage.getItem('unmask_analytics_consent');
    const consentShown = localStorage.getItem('unmask_consent_shown');
    
    if (existingConsent) {
      try {
        const parsed = JSON.parse(existingConsent);
        setConsent(parsed);
        setHasShown(true);
      } catch (error) {
        console.error('Error parsing stored consent:', error);
      }
    }
    
    // Show banner if no consent given and not shown before
    if (!existingConsent && !consentShown) {
      // Delay showing to avoid blocking initial page load
      const timer = setTimeout(() => {
        setView('banner');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle consent acceptance
  const handleAcceptAll = () => {
    const newConsent: ConsentState = {
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    
    setConsent(newConsent);
    analytics.updateConsentState(newConsent);
    localStorage.setItem('unmask_consent_shown', 'true');
    
    // Track consent acceptance
    analytics.track({
      name: 'cookie_consent_accepted',
      properties: {
        consent_type: 'accept_all',
        analytics_consent: true,
        marketing_consent: true,
      }
    });
    
    setView('hidden');
  };

  // Handle consent rejection
  const handleRejectAll = () => {
    const newConsent: ConsentState = {
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    
    setConsent(newConsent);
    analytics.updateConsentState(newConsent);
    localStorage.setItem('unmask_consent_shown', 'true');
    
    // Track consent rejection (using functional cookies only)
    analytics.track({
      name: 'cookie_consent_rejected',
      properties: {
        consent_type: 'reject_all',
        analytics_consent: false,
        marketing_consent: false,
      }
    });
    
    setView('hidden');
  };

  // Handle custom preferences
  const handleSavePreferences = () => {
    analytics.updateConsentState(consent);
    localStorage.setItem('unmask_consent_shown', 'true');
    
    // Track custom preferences
    analytics.track({
      name: 'cookie_consent_custom',
      properties: {
        consent_type: 'custom_preferences',
        analytics_consent: consent.analytics,
        marketing_consent: consent.marketing,
      }
    });
    
    setView('hidden');
  };

  // Handle preference toggle
  const togglePreference = (type: keyof ConsentState) => {
    if (type === 'functional' || type === 'timestamp') return; // Cannot disable functional
    
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type],
      timestamp: new Date().toISOString(),
    }));
  };

  // Show preferences
  const showPreferences = () => {
    setView('preferences');
    
    analytics.track({
      name: 'cookie_preferences_opened',
      properties: {
        source: view,
      }
    });
  };

  const cookieCategories = [
    {
      id: 'functional' as const,
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be disabled.',
      icon: Shield,
      required: true,
      examples: ['Session management', 'Security features', 'Basic functionality'],
    },
    {
      id: 'analytics' as const,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website to improve user experience.',
      icon: BarChart3,
      required: false,
      examples: ['Page views', 'User behavior', 'Performance metrics'],
    },
    {
      id: 'marketing' as const,
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements.',
      icon: Target,
      required: false,
      examples: ['Ad targeting', 'Social media integration', 'Conversion tracking'],
    },
  ];

  if (view === 'hidden') return null;

  return (
    <AnimatePresence>
      {(view as string) !== 'hidden' && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => view === 'preferences' ? setView('banner') : undefined}
          />

          {/* Banner View */}
          {view === 'banner' && (
            <motion.div
              className={cn(
                'fixed z-50 bg-background/95 backdrop-blur-xl border-t border-white/20 shadow-2xl',
                isMobile 
                  ? 'bottom-0 left-0 right-0 rounded-t-3xl' 
                  : 'bottom-6 left-6 right-6 rounded-2xl max-w-4xl mx-auto',
                className
              )}
              style={isMobile ? {
                paddingBottom: Math.max(safeAreaInsets.bottom, 16),
              } : undefined}
              initial={{ y: isMobile ? '100%' : 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isMobile ? '100%' : 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Handle Bar for Mobile */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1 bg-white/30 rounded-full" />
                </div>
              )}

              <div className="p-6">
                <div className={cn(
                  'flex gap-4',
                  isMobile ? 'flex-col' : 'items-start'
                )}>
                  {/* Icon and Title */}
                  <div className={cn(
                    'flex items-center gap-3',
                    isMobile ? 'self-center' : 'flex-shrink-0'
                  )}>
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-xl flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className={cn(
                        'font-bold text-white',
                        isMobile ? 'text-mobile-subtitle text-center' : 'text-lg'
                      )}>
                        Cookie Preferences
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <p className={cn(
                      'text-text-secondary leading-relaxed',
                      isMobile ? 'text-mobile-body text-center' : 'text-sm'
                    )}>
                      We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                      Your privacy matters to us - you can customize your preferences or accept our recommended settings.
                    </p>

                    {/* Quick Settings */}
                    <div className={cn(
                      'flex gap-3',
                      isMobile ? 'flex-col' : 'flex-wrap'
                    )}>
                      <MobileButton
                        variant="gradient"
                        size={isMobile ? 'lg' : 'md'}
                        onClick={handleAcceptAll}
                        className={cn(
                          'font-semibold',
                          isMobile ? 'w-full' : 'min-w-[120px]'
                        )}
                        touchOptimized={isMobile}
                        hapticFeedback={true}
                      >
                        <Check className="w-4 h-4" />
                        Accept All
                      </MobileButton>
                      
                      <MobileButton
                        variant="ghost"
                        size={isMobile ? 'lg' : 'md'}
                        onClick={handleRejectAll}
                        className={cn(
                          'border-white/20',
                          isMobile ? 'w-full' : 'min-w-[120px]'
                        )}
                        touchOptimized={isMobile}
                      >
                        Reject All
                      </MobileButton>
                      
                      <MobileButton
                        variant="secondary"
                        size={isMobile ? 'lg' : 'md'}
                        onClick={showPreferences}
                        className={cn(
                          isMobile ? 'w-full' : 'min-w-[120px]'
                        )}
                        touchOptimized={isMobile}
                      >
                        <Settings className="w-4 h-4" />
                        Customize
                      </MobileButton>
                    </div>

                    {/* Privacy Policy Link */}
                    <div className="text-center">
                      <a 
                        href="/privacy-policy" 
                        className={cn(
                          'inline-flex items-center gap-1 text-accent hover:text-accent/80 transition-colors',
                          isMobile ? 'text-mobile-caption' : 'text-xs'
                        )}
                        onClick={() => {
                          analytics.track({
                            name: 'privacy_policy_click',
                            properties: { source: 'cookie_banner' }
                          });
                        }}
                      >
                        View Privacy Policy
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences View */}
          {view === 'preferences' && (
            <motion.div
              className={cn(
                'fixed z-50 bg-background/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden',
                isMobile 
                  ? 'inset-4 rounded-3xl' 
                  : 'top-1/2 left-1/2 w-full max-w-2xl h-auto max-h-[90vh] rounded-2xl',
                className
              )}
              style={isMobile ? {
                top: Math.max(safeAreaInsets.top + 16, 16),
                bottom: Math.max(safeAreaInsets.bottom + 16, 16),
              } : {
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className={cn(
                      'font-bold text-white',
                      isMobile ? 'text-mobile-subtitle' : 'text-xl'
                    )}>
                      Cookie Preferences
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setView('banner')}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-text-secondary hover:text-white transition-colors touch-manipulation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <p className={cn(
                    'text-text-secondary leading-relaxed',
                    isMobile ? 'text-mobile-body' : 'text-sm'
                  )}>
                    Manage your cookie preferences below. You can enable or disable different types of cookies 
                    to control how we collect and use your data.
                  </p>

                  {/* Cookie Categories */}
                  <div className="space-y-4">
                    {cookieCategories.map((category) => {
                      const IconComponent = category.icon;
                      const isEnabled = consent[category.id];
                      
                      return (
                        <div
                          key={category.id}
                          className="bg-white/5 rounded-2xl p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-5 h-5 text-accent" />
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className={cn(
                                  'font-semibold text-white',
                                  isMobile ? 'text-mobile-body' : 'text-base'
                                )}>
                                  {category.title}
                                </h4>
                                
                                <p className={cn(
                                  'text-text-secondary leading-relaxed',
                                  isMobile ? 'text-mobile-caption' : 'text-sm'
                                )}>
                                  {category.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                  {category.examples.map((example, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-white/5 rounded-full text-xs text-text-secondary border border-white/10"
                                    >
                                      {example}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Toggle */}
                            <button
                              onClick={() => togglePreference(category.id)}
                              disabled={category.required}
                              className={cn(
                                'relative w-12 h-6 rounded-full border-2 transition-colors touch-manipulation',
                                isEnabled 
                                  ? 'bg-accent border-accent' 
                                  : 'bg-white/10 border-white/20',
                                category.required && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              <motion.div
                                className={cn(
                                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                                )}
                                animate={{
                                  x: isEnabled ? 20 : 2,
                                }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>

                          {category.required && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-xs text-yellow-400">
                                ⚠️ Required for basic website functionality
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                  <div className={cn(
                    'flex gap-3',
                    isMobile ? 'flex-col' : 'justify-end'
                  )}>
                    <MobileButton
                      variant="ghost"
                      size={isMobile ? 'lg' : 'md'}
                      onClick={() => setView('banner')}
                      className={cn(
                        'border-white/20',
                        isMobile ? 'w-full' : 'min-w-[100px]'
                      )}
                      touchOptimized={isMobile}
                    >
                      Cancel
                    </MobileButton>
                    
                    <MobileButton
                      variant="gradient"
                      size={isMobile ? 'lg' : 'md'}
                      onClick={handleSavePreferences}
                      className={cn(
                        'font-semibold',
                        isMobile ? 'w-full' : 'min-w-[140px]'
                      )}
                      touchOptimized={isMobile}
                      hapticFeedback={true}
                    >
                      <Check className="w-4 h-4" />
                      Save Preferences
                    </MobileButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;