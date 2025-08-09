import { NextRequest, NextResponse } from 'next/server';
import { 
  getEmailByHash,
  updateVerificationToken,
  insertEmail,
  getVerifiedCount,
} from '@/lib/database/neon';
import { waitlistSubmissionSchema } from '@/lib/security/validation';
import { validateEmailAdvanced, detectBot, validateHoneypot } from '@/lib/security/validation';
import { encryptData, hashEmail, generateVerificationToken, generateSecureToken } from '@/lib/security/encryption';
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
    
    // Check honeypot field if present
    if ('website' in body && !validateHoneypot(body.website)) {
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
    
    if (detectBot(userAgent, headers)) {
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

      if (existingEmail.verified) {
        return NextResponse.json(
          {
            success: true,
            message: 'You are already on our waitlist!',
            data: {
              id: existingEmail.id,
              email: submission.email,
              verification_required: false,
            },
          },
          { headers: rateLimitHeaders }
        );
      }

      // Email exists but not verified - resend verification
      const verificationToken = generateVerificationToken();
      
      await updateVerificationToken(existingEmail.id, verificationToken);

      // Send verification email
      const emailService = getEmailService();
      const emailResult = await emailService.sendVerificationEmail(submission.email, verificationToken);
      const debugEmail = true;
      
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Don't fail the request, just log the error
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Verification email sent! Please check your inbox.',
          data: {
            id: existingEmail.id,
            email: submission.email,
            verification_required: true,
          },
          ...(debugEmail ? { email_debug: emailResult } : {}),
        },
        { headers: rateLimitHeaders }
      );
    }

    // Create new waitlist entry
    const verificationToken = generateVerificationToken();
    const unsubscribeToken = generateSecureToken();
    const encryptedEmail = encryptData(submission.email);

    const newEmail = await insertEmail({
      email: encryptedEmail,
      email_hash: emailHash,
      verification_token: verificationToken,
      unsubscribe_token: unsubscribeToken,
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

    // Send verification email
    const emailService = getEmailService();
    const emailResult = await emailService.sendVerificationEmail(submission.email, verificationToken);
    const debugEmail = true;
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
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
        message: 'Thanks for joining! Please check your email to verify your subscription.',
        data: {
          id: newEmail.id,
          email: submission.email,
          verification_required: true,
        },
        ...(debugEmail ? { email_debug: emailResult } : {}),
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
    return NextResponse.json({ count }, { headers: rateLimitHeaders });

  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return NextResponse.json(
      { count: 1247 }, // Fallback count
      { status: 200 }
    );
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