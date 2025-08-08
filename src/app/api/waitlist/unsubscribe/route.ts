import { NextRequest, NextResponse } from 'next/server';
import { getEmailByUnsubscribeToken, markUnsubscribed } from '@/lib/database/neon';
import { unsubscribeSchema } from '@/lib/security/validation';
import { decryptData } from '@/lib/security/encryption';
import { checkGeneralRateLimit, createRateLimitHeaders } from '@/lib/security/rate-limiting';
import { sanitizeForLogs } from '@/lib/security/encryption';
import type { UnsubscribeResponse } from '@/lib/database/types';

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = await checkGeneralRateLimit(request);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
        },
        { 
          status: 429,
          headers: rateLimitHeaders
        }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = unsubscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid unsubscribe token',
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }

    const { token } = validationResult.data;

    // Find email by unsubscribe token
    const emailRecord = await getEmailByUnsubscribeToken(token);
    if (!emailRecord) {
      console.log('Unsubscribe token not found:', sanitizeForLogs(token));
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid unsubscribe token',
        },
        { 
          status: 404,
          headers: rateLimitHeaders
        }
      );
    }

    // Check if already unsubscribed
    if (emailRecord.unsubscribed) {
      const decryptedEmail = decryptData(emailRecord.email);
      return NextResponse.json(
        {
          success: true,
          message: 'You have already been unsubscribed from our mailing list.',
          email: decryptedEmail,
        },
        { headers: rateLimitHeaders }
      );
    }

    // Unsubscribe the email
    await markUnsubscribed(emailRecord.id);

    const decryptedEmail = decryptData(emailRecord.email);

    // Log successful unsubscribe
    console.log('Email unsubscribed successfully:', sanitizeForLogs({
      id: emailRecord.id,
      email: decryptedEmail,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'You have been successfully unsubscribed from our mailing list.',
        email: decryptedEmail,
      },
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    console.error('Unsubscribe error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for unsubscribe links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid Unsubscribe Link - Unmask</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px; }
            .error { color: #ff6b9d; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Invalid Unsubscribe Link</h1>
            <p>This unsubscribe link is invalid or malformed.</p>
            <a href="/" class="button">Return to Homepage</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }

    // Create a request body for the POST method
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries()),
      },
    });

    // Process unsubscribe with POST method
    const unsubscribeResponse = await POST(postRequest);
    const unsubscribeData = await unsubscribeResponse.json();

    if (unsubscribeData.success) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Successfully Unsubscribed - Unmask</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px; }
            .success { color: #4ecdc4; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .secondary { background: transparent; border: 1px solid #333; margin-left: 12px; }
            .note { font-size: 14px; color: #888; margin-top: 30px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">Successfully Unsubscribed</h1>
            <p>You have been removed from the Unmask waitlist mailing list.</p>
            <p>We're sorry to see you go, but we respect your choice.</p>
            
            <div style="margin: 30px 0;">
              <a href="/" class="button">Return to Homepage</a>
              <a href="mailto:support@unmask.life" class="button secondary">Contact Support</a>
            </div>

            <div class="note">
              <p><strong>Changed your mind?</strong></p>
              <p>You can always join the waitlist again by visiting our homepage and entering your email address.</p>
              <p>If you believe this was a mistake or need assistance, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribe Failed - Unmask</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px; }
            .error { color: #ff6b9d; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Unsubscribe Failed</h1>
            <p>${unsubscribeData.message}</p>
            <a href="/" class="button">Return to Homepage</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: unsubscribeResponse.status,
      });
    }

  } catch (error) {
    console.error('GET unsubscribe error:', error);
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribe Error - Unmask</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px; }
          .error { color: #ff6b9d; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">Something Went Wrong</h1>
          <p>We couldn't process your unsubscribe request at this time. Please try again later.</p>
          <a href="/" class="button">Return to Homepage</a>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    });
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