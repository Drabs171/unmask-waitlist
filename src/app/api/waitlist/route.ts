import { NextRequest, NextResponse } from 'next/server';
import { 
  getEmailByHash,
  insertEmail,
  getVerifiedCount,
} from '@/lib/database/neon';
import { waitlistSubmissionSchema } from '@/lib/security/validation';
import { validateEmailAdvanced, detectBot, validateHoneypot } from '@/lib/security/validation';
import { encryptData, hashEmail, generateSecureToken } from '@/lib/security/encryption';
import { checkEmailSubmissionRateLimit, createRateLimitHeaders } from '@/lib/security/rate-limiting';
import { sanitizeForLogs } from '@/lib/security/encryption';
import { getEmailService } from '@/lib/email/service';
import type { WaitlistSubmission, WaitlistResponse } from '@/lib/database/types';

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting first
    const rateLimitResult = await checkEmailSubmissionRateLimit(request);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          message: 'Rate limit exceeded'
        },
        { 
          status: 429,
          headers: rateLimitHeaders
        }
      );
    }

    // Parse request body
    const body = await request.json();
    // Temporary debug bypass to avoid bot/honeypot during delivery verification
    const debugBypass = request.headers.get('x-debug-bypass') === 'true';
    
    // Check honeypot field if present
    if (!debugBypass && 'website' in body && !validateHoneypot(body.website)) {
      console.log('Honeypot triggered for submission:', sanitizeForLogs(body));
      return NextResponse.json(
        { success: true, message: 'Thank you for joining our waitlist!' },
        { headers: rateLimitHeaders }
      );
    }

    // Validate submission data
    const validationResult = waitlistSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid submission data',
          message: validationResult.error.issues[0]?.message || 'Validation failed',
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }

    const submission: WaitlistSubmission = validationResult.data;

    // Advanced email validation
    const emailValidation = await validateEmailAdvanced(submission.email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: emailValidation.reason,
          message: emailValidation.reason || 'Invalid email address',
          suggestions: emailValidation.suggestions,
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }

    // Extract request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || (request as any).ip || null;
    
    // Bot detection
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    if (!debugBypass && detectBot(userAgent, headers)) {
      console.log('Bot detected for submission:', sanitizeForLogs({ email: submission.email, userAgent }));
      // Return success to avoid revealing detection
      return NextResponse.json(
        { success: true, message: 'Thank you for joining our waitlist!' },
        { headers: rateLimitHeaders }
      );
    }

    // Hash email for duplicate detection
    const emailHash = hashEmail(submission.email);
    
    // Check for existing email
    const existingEmail = await getEmailByHash(emailHash);

    // Handle existing email
    if (existingEmail) {
      if (existingEmail.unsubscribed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email previously unsubscribed',
            message: 'This email has been unsubscribed. Please contact support to re-subscribe.',
          },
          { 
            status: 400,
            headers: rateLimitHeaders
          }
        );
      }

      // Email already exists on waitlist
      return NextResponse.json(
        {
          success: false,
          error: 'Email already on waitlist',
          message: 'This email is already on the waitlist.',
        },
        { status: 409, headers: rateLimitHeaders }
      );
    }

    // Create new waitlist entry
    const unsubscribeToken = generateSecureToken();
    const encryptedEmail = encryptData(submission.email);

    const newEmail = await insertEmail({
      email: encryptedEmail,
      email_hash: emailHash,
      verification_token: null,
      unsubscribe_token: unsubscribeToken,
      verified: true,
      verified_at: new Date(),
      source: submission.source || 'direct',
      referrer: submission.referrer || null,
      user_agent: userAgent,
      ip_address: ip,
      utm_source: submission.utm_source || null,
      utm_medium: submission.utm_medium || null,
      utm_campaign: submission.utm_campaign || null,
      utm_term: submission.utm_term || null,
      utm_content: submission.utm_content || null,
      ab_test_variant: submission.ab_test_variant || null,
      metadata: submission.metadata || {},
    });

    // Send welcome email directly
    const emailService = getEmailService();
    const waitlistPosition = await getVerifiedCount();
    const welcomeEmailResult = await emailService.sendWelcomeEmail(
      submission.email, 
      unsubscribeToken,
      (waitlistPosition || 0) + 1
    );
    
    if (!welcomeEmailResult.success) {
      console.error('Failed to send welcome email:', welcomeEmailResult.error);
      // Don't fail the request, just log the error
    }

    // Log successful submission (sanitized)
    console.log('Waitlist submission successful:', sanitizeForLogs({
      id: newEmail.id,
      source: submission.source,
      utm_campaign: submission.utm_campaign,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome to the Unmask waitlist! You\'re all set.',
        data: {
          id: newEmail.id,
          email: submission.email,
          verification_required: false,
          waitlist_position: (waitlistPosition || 0) + 1,
        },
      },
      { 
        status: 201,
        headers: rateLimitHeaders
      }
    );

  } catch (error) {
    console.error('Waitlist submission error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Get waitlist count for public display
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await checkEmailSubmissionRateLimit(request);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: rateLimitHeaders
        }
      );
    }

    // Get verified email count
    const count = await getVerifiedCount();
    return NextResponse.json(
      { count },
      { headers: { ...rateLimitHeaders, 'Cache-Control': 'no-store' } }
    );

  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return NextResponse.json({ count: 0 }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}