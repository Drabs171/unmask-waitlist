'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { validateEmail } from '@/utils/emailValidator';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

interface UseRealTimeValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
  minLength?: number;
}

interface ValidationResult {
  state: ValidationState;
  error: string | null;
  isValid: boolean;
  isValidating: boolean;
  suggestions?: string[];
}

export const useRealTimeValidation = (
  value: string,
  options: UseRealTimeValidationOptions = {}
) => {
  const {
    debounceMs = 500,
    validateOnMount = false,
    minLength = 3,
  } = options;

  const [state, setState] = useState<ValidationState>(validateOnMount ? 'validating' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const validateValue = useCallback(async (inputValue: string) => {
    if (!inputValue || inputValue.length < minLength) {
      setState('idle');
      setError(null);
      setSuggestions([]);
      return;
    }

    setState('validating');

    // Simulate async validation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200));

    const validationError = validateEmail(inputValue);
    
    if (validationError) {
      setState('invalid');
      setError(validationError);
      
      // Generate domain suggestions for common typos
      const domainSuggestions = generateDomainSuggestions(inputValue);
      setSuggestions(domainSuggestions);
    } else {
      setState('valid');
      setError(null);
      setSuggestions([]);
    }
  }, [minLength]);

  useEffect(() => {
    // Clear existing debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't validate empty values unless configured to do so
    if (!value && !validateOnMount) {
      setState('idle');
      setError(null);
      setSuggestions([]);
      return;
    }

    // Debounce the validation
    debounceRef.current = setTimeout(() => {
      validateValue(value);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, debounceMs, validateOnMount, validateValue]);

  // Force immediate validation (useful for form submission)
  const validateNow = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    validateValue(value);
  }, [value, validateValue]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setState('idle');
    setError(null);
    setSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const result: ValidationResult = {
    state,
    error,
    isValid: state === 'valid',
    isValidating: state === 'validating',
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };

  return {
    ...result,
    validateNow,
    resetValidation,
  };
};

// Helper function to generate domain suggestions for common typos
const generateDomainSuggestions = (email: string): string[] => {
  const [localPart, domain] = email.split('@');
  if (!domain) return [];

  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'protonmail.com',
  ];

  const suggestions: string[] = [];
  const domainLower = domain.toLowerCase();

  // Check for common typos and suggest corrections
  const typoMap: Record<string, string[]> = {
    'gmial.com': ['gmail.com'],
    'gmai.com': ['gmail.com'],
    'gmail.co': ['gmail.com'],
    'yahooo.com': ['yahoo.com'],
    'yaho.com': ['yahoo.com'],
    'hotmial.com': ['hotmail.com'],
    'hotmai.com': ['hotmail.com'],
    'outlok.com': ['outlook.com'],
    'outloo.com': ['outlook.com'],
  };

  // Direct typo matches
  if (typoMap[domainLower]) {
    typoMap[domainLower].forEach(suggestion => {
      suggestions.push(`${localPart}@${suggestion}`);
    });
  }

  // Fuzzy matching for similar domains
  if (suggestions.length === 0) {
    commonDomains.forEach(commonDomain => {
      if (levenshteinDistance(domainLower, commonDomain) <= 2 && domainLower !== commonDomain) {
        suggestions.push(`${localPart}@${commonDomain}`);
      }
    });
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
};

// Simple Levenshtein distance calculation
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
};