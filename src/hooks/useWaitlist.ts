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

      // Simulate API call for now - replace with actual API endpoint
      const response = await mockApiCall(cleanData);

      if (response.success) {
        setSuccess(true);
        
        // Store locally for analytics
        if (typeof window !== 'undefined') {
          const existingCount = localStorage.getItem('unmask_waitlist_count');
          const currentCount = existingCount ? parseInt(existingCount) : 2847;
          localStorage.setItem('unmask_waitlist_count', (currentCount + 1).toString());
          
          // Store user data (optional, for analytics)
          localStorage.setItem('unmask_user_joined', 'true');
        }

        return response;
      } else {
        throw new Error(response.error || 'Failed to join waitlist');
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

// Mock API call - replace with actual API integration
const mockApiCall = async (data: unknown): Promise<ApiResponseInterface> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        resolve({
          success: true,
          data: { id: Math.random().toString(36), ...(data as Record<string, unknown>) },
          message: 'Successfully joined the waitlist!',
        });
      } else {
        resolve({
          success: false,
          error: 'Server error. Please try again.',
        });
      }
    }, 1500); // Simulate network delay
  });
};