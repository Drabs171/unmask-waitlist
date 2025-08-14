'use client';

import { useState } from 'react';
import { WaitlistFormDataInterface, ApiResponseInterface } from '@/types';
import { validateEmail, sanitizeEmail } from '@/utils/emailValidator';

export const useWaitlist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitToWaitlist = async (formData: WaitlistFormDataInterface): Promise<ApiResponseInterface> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate email
      const emailError = validateEmail(formData.email);
      if (emailError) {
        throw new Error(emailError);
      }

      // Sanitize data
      const cleanData = {
        email: sanitizeEmail(formData.email),
        name: formData.name?.trim() || undefined,
        timestamp: new Date(),
      };

      // Make actual API call to waitlist endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanData.email,
          name: cleanData.name,
          source: 'waitlist_form',
          referrer: typeof window !== 'undefined' ? document.referrer : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        
        // Store locally for analytics
        if (typeof window !== 'undefined') {
          // Store the actual waitlist position if provided
          const waitlistPosition = result.data?.waitlist_position || 2847;
          localStorage.setItem('unmask_waitlist_count', waitlistPosition.toString());
          
          // Store user data (optional, for analytics)
          localStorage.setItem('unmask_user_joined', 'true');
        }

        return result;
      } else {
        throw new Error(result.error || result.message || 'Failed to join waitlist');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    isSubmitting,
    error,
    success,
    submitToWaitlist,
    resetForm,
  };
};

