import { NextRequest, NextResponse } from 'next/server';
import { getEmailByVerificationToken, verifyEmailById, getVerifiedCount } from '@/lib/database/neon';
import { emailVerificationSchema } from '@/lib/security/validation';
import { validateVerificationToken, decryptData } from '@/lib/security/encryption';
import { checkEmailVerificationRateLimit, createRateLimitHeaders } from '@/lib/security/rate-limiting';
import { sanitizeForLogs } from '@/lib/security/encryption';
import { getEmailService } from '@/lib/email/service';
import type { EmailVerificationResponse } from '@/lib/database/types';

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = await checkEmailVerificationRateLimit(request);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many verification attempts. Please try again later.',
        },
        { 
          status: 429,
          headers: rateLimitHeaders
        }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = emailVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification token',
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }

    const { token } = validationResult.data;

    // Validate token format and expiration
    if (!validateVerificationToken(token, 24)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification token has expired. Please request a new one.',
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }

    // Find email by verification token
    const emailRecord = await getEmailByVerificationToken(token);
    if (!emailRecord) {
      console.log('Verification token not found:', sanitizeForLogs(token));
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired verification token',
        },
        { 
          status: 404,
          headers: rateLimitHeaders
        }
      );
    }

    // Check if already verified
    if (emailRecord.verified) {
      const decryptedEmail = decryptData(emailRecord.email);
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified. Welcome to the waitlist!',
          email: decryptedEmail,
        },
        { headers: rateLimitHeaders }
      );
    }

    // Check if unsubscribed
    if (emailRecord.unsubscribed) {
      return NextResponse.json(
        {
          success: false,
          message: 'This email has been unsubscribed and cannot be verified.',
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }

    // Verify the email
    await verifyEmailById(emailRecord.id);

    const decryptedEmail = decryptData(emailRecord.email);

    // Get waitlist position (rough estimate)
    const waitlistPosition = await getVerifiedCount();

    // Send welcome email
    const emailService = getEmailService();
    const welcomeEmailResult = await emailService.sendWelcomeEmail(
      decryptedEmail, 
      emailRecord.unsubscribe_token,
      (waitlistPosition || 0) + 1
    );
    
    if (!welcomeEmailResult.success) {
      console.error('Failed to send welcome email:', welcomeEmailResult.error);
      // Don't fail the request, just log the error
    }

    // Log successful verification
    console.log('Email verification successful:', sanitizeForLogs({
      id: emailRecord.id,
      email: decryptedEmail,
      waitlistPosition: (waitlistPosition || 0) + 1,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully! Welcome to the Unmask waitlist.',
        email: decryptedEmail,
      },
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for email verification links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return htmlPage('Invalid Verification Link', 'This verification link is invalid or malformed.', 400);
    }

    // Optional debug bypass for rate limit
    const bypass = request.headers.get('x-debug-bypass') === 'true';
    if (!bypass) {
      const rateLimitResult = await checkEmailVerificationRateLimit(request);
      if (!rateLimitResult.success) {
        return htmlPage('Too Many Attempts', 'Please try again later.', 429);
      }
    }

    // Validate token format/age
    if (!validateVerificationToken(token, 24)) {
      return htmlPage('Verification Failed', 'Verification token has expired. Please request a new one.', 400);
    }

    const emailRecord = await getEmailByVerificationToken(token);
    if (!emailRecord) {
      return htmlPage('Verification Failed', 'Invalid or expired verification token', 404);
    }

    if (!emailRecord.verified) {
      await verifyEmailById(emailRecord.id);
      const emailService = getEmailService();
      const decryptedEmail = decryptData(emailRecord.email);
      const welcome = await emailService.sendWelcomeEmail(
        decryptedEmail,
        emailRecord.unsubscribe_token,
        undefined
      );
      if (!welcome.success) {
        console.error('Welcome email failed:', welcome.error);
      }
    }

    return htmlPage('Email Verified Successfully!', "Welcome to the Unmask waitlist! You're all set to be notified when we launch.", 200, true);

  } catch (error) {
    console.error('GET verification error:', error);
    return htmlPage('Verification Error', "We couldn't verify your email at this time. Please try again later.", 500);
  }
}

function htmlPage(title: string, message: string, status = 200, success = false): NextResponse {
  return new NextResponse(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Unmask</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; }
        .container { max-width: 700px; margin: 0 auto; text-align: center; padding: 60px 24px; }
        .title { color: ${success ? '#4ecdc4' : '#ff6b9d'}; font-size: 36px; font-weight: 800; margin-bottom: 16px; }
        .msg { color: #ccc; font-size: 18px; margin-bottom: 28px; }
        .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%); color: white; text-decoration: none; border-radius: 9999px; margin-top: 8px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">${title}</h1>
        <p class="msg">${message}</p>
        <a href="/" class="button">Return to Homepage</a>
      </div>
    </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' }, status });
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