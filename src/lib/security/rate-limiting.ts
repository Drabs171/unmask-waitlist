import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory store for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Different rate limits for different endpoints
export const rateLimiters = {
  // Email submission: 3 attempts per 15 minutes
  emailSubmission: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'),
    analytics: true,
    prefix: 'waitlist:email',
  }) : null,

  // Email verification: 10 attempts per hour
  emailVerification: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'waitlist:verify',
  }) : null,

  // Admin API: 100 requests per minute
  adminAPI: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'waitlist:admin',
  }) : null,

  // General API: 30 requests per minute
  generalAPI: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'waitlist:api',
  }) : null,
};

/**
 * Fallback in-memory rate limiter for development
 */
function inMemoryRateLimit(
  identifier: string, 
  limit: number, 
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: Date } {
  const now = Date.now();
  const key = identifier;
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: new Date(now + windowMs),
    };
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: new Date(entry.resetTime),
    };
  }

  // Increment counter
  entry.count++;
  memoryStore.set(key, entry);

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: new Date(entry.resetTime),
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || (request as any).ip || 'unknown';
  
  return ip;
}

/**
 * Check email submission rate limit
 */
export async function checkEmailSubmissionRateLimit(request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const identifier = getClientIdentifier(request);
  
  if (rateLimiters.emailSubmission) {
    const res = await rateLimiters.emailSubmission.limit(identifier);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: new Date(res.reset),
    };
  } else {
    // Fallback: 3 requests per 15 minutes (900000 ms)
    return inMemoryRateLimit(identifier, 3, 15 * 60 * 1000);
  }
}

/**
 * Check email verification rate limit
 */
export async function checkEmailVerificationRateLimit(request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const identifier = getClientIdentifier(request);
  
  if (rateLimiters.emailVerification) {
    const res = await rateLimiters.emailVerification.limit(identifier);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: new Date(res.reset),
    };
  } else {
    // Fallback: 10 requests per hour (3600000 ms)
    return inMemoryRateLimit(identifier, 10, 60 * 60 * 1000);
  }
}

/**
 * Check admin API rate limit
 */
export async function checkAdminRateLimit(request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const identifier = getClientIdentifier(request);
  
  if (rateLimiters.adminAPI) {
    const res = await rateLimiters.adminAPI.limit(identifier);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: new Date(res.reset),
    };
  } else {
    // Fallback: 100 requests per minute (60000 ms)
    return inMemoryRateLimit(identifier, 100, 60 * 1000);
  }
}

/**
 * Check general API rate limit
 */
export async function checkGeneralRateLimit(request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const identifier = getClientIdentifier(request);
  
  if (rateLimiters.generalAPI) {
    const res = await rateLimiters.generalAPI.limit(identifier);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: new Date(res.reset),
    };
  } else {
    // Fallback: 30 requests per minute (60000 ms)
    return inMemoryRateLimit(identifier, 30, 60 * 1000);
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset.getTime() / 1000).toString(),
  };
}

/**
 * Clean up expired entries from memory store (for development)
 */
export function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
}

// Cleanup memory store every 15 minutes in development
if (!redis && typeof window === 'undefined') {
  setInterval(cleanupMemoryStore, 15 * 60 * 1000);
}

/**
 * Check if rate limiting is properly configured
 */
export function isRateLimitingConfigured(): boolean {
  return !!redis;
}