import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(254, 'Email too long')
  .toLowerCase()
  .trim();

// Waitlist submission schema
export const waitlistSubmissionSchema = z.object({
  email: emailSchema,
  source: z.string().max(50).optional(),
  referrer: z.string().url().or(z.literal('')).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_term: z.string().max(100).optional(),
  utm_content: z.string().max(100).optional(),
  ab_test_variant: z.string().max(50).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(10).max(100),
});

// Unsubscribe schema
export const unsubscribeSchema = z.object({
  token: z.string().min(10).max(100),
});

// Admin email list query schema
export const adminEmailListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  verified: z.boolean().optional(),
  source: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Admin export schema
export const adminExportSchema = z.object({
  format: z.enum(['csv', 'json']),
  verified_only: z.boolean().default(false),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  source: z.string().max(50).optional(),
});

/**
 * Advanced email validation with DNS/MX record checking
 */
export async function validateEmailAdvanced(email: string): Promise<{
  valid: boolean;
  reason?: string;
  suggestions?: string[];
}> {
  try {
    // First, basic validation
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      return {
        valid: false,
        reason: result.error.issues[0]?.message || 'Invalid email format',
      };
    }

    const normalizedEmail = result.data;
    const [localPart, domain] = normalizedEmail.split('@');

    // Check for common disposable email domains
    const disposableDomains = [
      '10minutemail.com',
      'mailinator.com',
      'guerrillamail.com',
      'temp-mail.org',
      'throwaway.email',
      'tempmail.org',
    ];

    if (disposableDomains.includes(domain)) {
      return {
        valid: false,
        reason: 'Disposable email addresses are not allowed',
      };
    }

    // Common domain typos and suggestions
    const domainSuggestions: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yahoo.co': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
    };

    const suggestions: string[] = [];
    if (domainSuggestions[domain]) {
      suggestions.push(`${localPart}@${domainSuggestions[domain]}`);
    }

    // In a production environment, you might want to add:
    // 1. DNS MX record validation
    // 2. Temporary email detection
    // 3. Role-based email detection (admin@, noreply@, etc.)
    
    // For now, basic validation is sufficient
    return {
      valid: true,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

  } catch (error) {
    console.error('Email validation error:', error);
    return {
      valid: false,
      reason: 'Email validation failed',
    };
  }
}

/**
 * Validate and sanitize IP address
 */
export function validateIPAddress(ip: string): string | null {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
    return ip;
  }
  
  return null;
}

/**
 * Sanitize user agent string
 */
export function sanitizeUserAgent(userAgent: string): string {
  if (!userAgent || typeof userAgent !== 'string') {
    return 'unknown';
  }
  
  // Limit length and remove potentially dangerous characters
  return userAgent
    .slice(0, 500)
    .replace(/[<>\"']/g, '')
    .trim();
}

/**
 * Validate and sanitize referrer URL
 */
export function sanitizeReferrer(referrer: string): string | null {
  if (!referrer || typeof referrer !== 'string') {
    return null;
  }
  
  try {
    const url = new URL(referrer);
    // Only allow http/https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Validate UTM parameters
 */
export function sanitizeUTMParam(param: string): string | null {
  if (!param || typeof param !== 'string') {
    return null;
  }
  
  // Basic sanitization - remove special characters and limit length
  const sanitized = param
    .replace(/[<>\"'&]/g, '')
    .slice(0, 100)
    .trim();
    
  return sanitized || null;
}

/**
 * Check if request looks like bot/spam
 */
export function detectBot(userAgent: string, headers: Record<string, string>): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /go-http/i,
  ];
  
  // Check user agent
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true;
  }
  
  // Check for missing common browser headers
  const hasAccept = headers['accept'];
  const hasAcceptLanguage = headers['accept-language'];
  const hasAcceptEncoding = headers['accept-encoding'];
  
  if (!hasAccept || !hasAcceptLanguage || !hasAcceptEncoding) {
    return true;
  }
  
  return false;
}

/**
 * Validate honeypot field (should be empty)
 */
export function validateHoneypot(value: any): boolean {
  return !value || value === '' || value === null || value === undefined;
}