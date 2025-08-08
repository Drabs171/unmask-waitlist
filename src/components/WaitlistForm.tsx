'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mail, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation';
import MobileInput from '@/components/ui/MobileInput';
import MobileButton from '@/components/ui/MobileButton';
import MobileCelebration from '@/components/animations/MobileCelebration';
import ShareButton from '@/components/ui/ShareButton';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useFormTracking } from '@/hooks/useAnalytics';
import ValidationFeedback from '@/components/ui/ValidationFeedback';
import ProgressSteps, { defaultWaitlistSteps } from '@/components/ui/ProgressSteps';
import ConfettiCanvas from '@/components/animations/ConfettiCanvas';
import SignupCounter from '@/components/animations/SignupCounter';

interface WaitlistFormProps {
  onSubmit?: (email: string) => Promise<void>;
  className?: string;
  showCounter?: boolean;
  showProgress?: boolean;
  showValidation?: boolean;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({
  onSubmit,
  className,
  showCounter = true,
  showProgress = true,
  showValidation = true,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { isMobile, isTablet } = useMobileDetection();
  const [showMobileCelebration, setShowMobileCelebration] = useState(false);
  const { 
    trackFormStart, 
    trackFieldFocus, 
    trackFieldBlur, 
    trackValidationError, 
    trackFormSubmit 
  } = useFormTracking('waitlist');

  const confettiRef = useRef<{ fire: (originX?: number, originY?: number) => void; fireFromElement: (element: HTMLElement) => void; stop: () => void }>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    state: validationState,
    isValid: isValidEmail,
    suggestions,
    error: validationError,
  } = useRealTimeValidation(email, {
    debounceMs: 500,
  });

  // Handle email input changes
  const handleEmailChange = (value: string) => {
    // Track form start on first interaction
    if (value.length === 1) {
      trackFormStart();
    }
    
    setEmail(value);
    setShowFeedback(value.length > 0);
    
    // Update progress step based on validation
    if (value.length === 0) {
      setCurrentStep(0);
    } else if (!isValidEmail) {
      setCurrentStep(1);
    } else if (validationState === 'valid') {
      setCurrentStep(2);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setEmail(suggestion);
    setShowFeedback(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setCurrentStep(3);

    try {
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Submit to waitlist API
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            source: 'homepage',
            referrer: document.referrer || undefined,
            utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
            utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
            utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
            utm_term: new URLSearchParams(window.location.search).get('utm_term') || undefined,
            utm_content: new URLSearchParams(window.location.search).get('utm_content') || undefined,
            metadata: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to join waitlist');
        }

        // Check if email suggestions were provided
        if (data.suggestions && data.suggestions.length > 0) {
          console.log('Email suggestions provided:', data.suggestions);
          // You could show suggestions to the user here
        }
      }

      // Success!
      setIsSubmitted(true);
      setCurrentStep(4);
      
      // Track successful form submission
      trackFormSubmit(true, email);
      
      // Show mobile-specific celebration or confetti
      if (isMobile || isTablet) {
        setShowMobileCelebration(true);
      } else if (confettiRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        confettiRef.current.fire(centerX, centerY);
      }

    } catch (error) {
      console.error('Waitlist signup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackFormSubmit(false);
      setCurrentStep(2); // Go back to submit step
      setSubmitError(errorMessage.includes('Database') || errorMessage.includes('NEON')
        ? 'Server not configured yet. Please try again shortly.'
        : errorMessage);
      
      // You could show the error to the user here
      if (errorMessage.includes('rate limit') || errorMessage.includes('Too many')) {
        console.warn('Rate limited - user should try again later');
      } else if (errorMessage.includes('Invalid email')) {
        console.warn('Email validation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const successVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: 'easeOut' as const,
        delay: 0.2,
      },
    },
  };

  const heartVariants = {
    initial: { scale: 0, rotate: -45 },
    animate: shouldReduceMotion ? { scale: 1, rotate: 0 } : {
      scale: [0, 1.2, 1],
      rotate: [-45, 15, 0],
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  // Mobile success state
  if (isSubmitted && (isMobile || isTablet)) {
    return (
      <>
        <MobileCelebration
          isVisible={showMobileCelebration}
          onClose={() => {
            setShowMobileCelebration(false);
            // Reset form state for potential re-submission
            setTimeout(() => {
              setIsSubmitted(false);
              setEmail('');
              setCurrentStep(0);
            }, 300);
          }}
          userCount={1248}
        />
        <ConfettiCanvas ref={confettiRef} />
      </>
    );
  }

  // Desktop success state
  if (isSubmitted) {
    return (
      <motion.div
        ref={containerRef}
        className={cn(
          'w-full max-w-md mx-auto text-center space-y-6',
          className
        )}
        variants={successVariants}
        initial="initial"
        animate="animate"
      >
        {/* Success Animation */}
        <motion.div
          className="relative"
          variants={heartVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-accent to-primary-blue rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          
          {/* Pulsing ring */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.8, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut' as const,
              }}
            />
          )}
        </motion.div>

        {/* Success Message */}
        <div className="space-y-3">
          <motion.h3
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Welcome to the Revolution!
          </motion.h3>
          
          <motion.p
            className="text-text-secondary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            You&apos;re now on the waitlist for <span className="text-accent font-semibold">Unmask</span>. 
            We&apos;ll notify you when it&apos;s time to discover authentic connections.
          </motion.p>
        </div>

        {/* Success Counter */}
        {showCounter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <SignupCounter 
              targetCount={1248} 
              animateOnMount={true}
              size="md"
            />
          </motion.div>
        )}

        {/* Social Share */}
        <motion.div
          className="pt-4 border-t border-white/10 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <p className="text-sm text-text-secondary">
            Share to move up in the queue
          </p>
          <ShareButton variant="secondary" size="sm" showLabel={false} />
        </motion.div>

        <ConfettiCanvas ref={confettiRef} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('w-full max-w-md mx-auto space-y-6', className)}
      variants={formVariants}
      initial="initial"
      animate="animate"
    >
      {/* Progress Steps */}
      {showProgress && (
        <ProgressSteps
          steps={defaultWaitlistSteps}
          currentStep={currentStep}
          size="sm"
          showLabels={false}
          className="mb-8"
        />
      )}

      {/* Signup Counter */}
      {showCounter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <SignupCounter 
            targetCount={1247}
            size="lg"
            incrementInterval={45000} // 45 seconds
          />
        </motion.div>
      )}

      {/* Main Form */}
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Email Input */}
        <div className="space-y-2">
          <MobileInput
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onFocus={() => trackFieldFocus('email')}
            onBlur={() => trackFieldBlur('email')}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="Enter your email address"
            icon={Mail}
            size={isMobile ? "lg" : "md"}
            variant="floating"
            label="Email Address"
            required
            touchOptimized={isMobile || isTablet}
            smartKeyboard={true}
            hapticFeedback={true}
            clearable={true}
            error={validationError ?? undefined}
            success={validationState === 'valid'}
            className="w-full"
          />
          
          {/* Real-time Validation Feedback */}
          <AnimatePresence mode="wait">
            {showValidation && showFeedback && (
              <ValidationFeedback
                validationState={validationState}
                email={email}
                showProgress={email.length > 3}
                compact={false}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <MobileButton
          type="submit"
          variant="gradient"
          size={isMobile ? "xl" : "lg"}
          loading={isSubmitting}
          disabled={!isValidEmail || isSubmitting}
          fullWidth
          touchOptimized={isMobile || isTablet}
          hapticFeedback={true}
          rippleEffect={false}
          magneticStrength={0}
          glowIntensity="high"
          className="font-bold"
        >
          {isSubmitting ? (
            <span>Joining the Revolution...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Join the Revolution</span>
            </>
          )}
        </MobileButton>

        {/* Helper Text */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {submitError && (
            <p className="text-[13px] text-red-400">{submitError}</p>
          )}
          <p className={cn(
            "text-text-secondary",
            isMobile ? "text-mobile-caption" : "text-sm"
          )}>
            Be among the first to experience authentic dating
          </p>
          <div className="flex items-center justify-center gap-4">
            <p className={cn(
              "text-text-secondary",
              isMobile ? "text-xs" : "text-xs"
            )}>
              No spam, unsubscribe anytime
            </p>
            {isMobile && (
              <ShareButton 
                variant="ghost" 
                size="sm" 
                showLabel={false}
                className="opacity-60 hover:opacity-100"
              />
            )}
          </div>
        </motion.div>
      </motion.form>

      <ConfettiCanvas ref={confettiRef} />
    </motion.div>
  );
};

export default WaitlistForm;