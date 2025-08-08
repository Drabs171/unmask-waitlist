# Unmask Waitlist Backend Setup Guide

This guide will walk you through setting up the complete backend services for the Unmask waitlist application.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account
- An email service provider account (Mailgun, SendGrid, or SMTP)
- An Upstash Redis account (for rate limiting)

## 🚀 Quick Start

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Fill in all the required environment variables in `.env.local`:

```bash
# Required - Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Required - Email Configuration (choose one)
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here
FROM_EMAIL=hello@unmask.life

# Required - Security
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Optional - Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

### 2. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `src/lib/database/schema.sql`
4. Run the SQL script to create all tables, indexes, and functions

### 3. Email Service Setup

Choose one of the following email providers:

#### Option A: Mailgun (Recommended)
1. Sign up at [mailgun.com](https://mailgun.com)
2. Verify your domain
3. Get your API key and domain from the dashboard
4. Add to `.env.local`:
```bash
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here
FROM_EMAIL=hello@yourdomain.com
```

#### Option B: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key with full access
3. Add to `.env.local`:
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=hello@yourdomain.com
```

#### Option C: SMTP (Any Provider)
1. Get SMTP credentials from your email provider
2. Add to `.env.local`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
FROM_EMAIL=your_email@gmail.com
```

### 4. Rate Limiting Setup (Optional but Recommended)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token
4. Add to `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

### 5. Generate Encryption Key

Generate a secure 32-character encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Add it to `.env.local`:
```bash
ENCRYPTION_KEY=your_generated_32_character_key_here
```

### 6. Install Dependencies and Run

```bash
npm install
npm run dev
```

## 🧪 Testing the Setup

### 1. Health Check
Visit `http://localhost:3000/api/waitlist/stats` - you should see basic statistics.

### 2. Test Email Submission
1. Go to your homepage
2. Enter an email address
3. Submit the form
4. Check your email for verification

### 3. Test Email Verification
1. Click the verification link in your email
2. You should see a success page and receive a welcome email

### 4. Admin Dashboard
Visit `http://localhost:3000/admin` to see the admin dashboard with statistics.

## 📊 API Endpoints

### Public Endpoints
- `GET /api/waitlist` - Get waitlist count
- `POST /api/waitlist` - Submit email to waitlist
- `GET|POST /api/waitlist/verify` - Verify email address
- `GET|POST /api/waitlist/unsubscribe` - Unsubscribe from waitlist

### Admin Endpoints
- `GET /api/waitlist/stats` - Get waitlist statistics

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Email Validation**: Advanced validation with suggestions
- **Data Encryption**: All emails are encrypted at rest
- **Bot Detection**: Automated spam filtering
- **GDPR Compliance**: Proper consent and data handling
- **Honeypot Fields**: Additional bot protection

## 📧 Email Templates

The system includes beautiful, responsive email templates for:
- **Verification Email**: Double opt-in confirmation
- **Welcome Email**: Sent after successful verification
- **Launch Notification**: When the app goes live (ready for future use)

## 🎯 Rate Limits

Default rate limits (configurable):
- Email submission: 3 attempts per 15 minutes
- Email verification: 10 attempts per hour
- General API: 30 requests per minute
- Admin API: 100 requests per minute

## 🛠️ Troubleshooting

### Email Not Sending
1. Check your email service configuration in `.env.local`
2. Verify your API keys and domain settings
3. Check the console logs for email service errors
4. Test your email service credentials separately

### Database Connection Issues
1. Verify your Supabase URL and keys
2. Check that the database schema was applied correctly
3. Ensure Row Level Security policies are set up

### Rate Limiting Not Working
1. If Redis is not configured, the system uses in-memory fallback
2. Check your Upstash Redis credentials
3. Rate limiting logs will appear in the console

### Verification Links Not Working
1. Check that `NEXT_PUBLIC_URL` is set correctly
2. Ensure the encryption key is the same across deployments
3. Verification tokens expire after 24 hours

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The application works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📈 Monitoring

### Built-in Features
- Error logging to console
- Request/response logging
- Rate limiting metrics
- Email delivery status tracking

### Optional Integrations
- Add Sentry for error monitoring
- Use Vercel Analytics for performance tracking
- Integrate with your preferred logging service

## 🔧 Customization

### Email Templates
Edit files in `src/lib/email/templates.ts` to customize:
- Email content and styling
- Subject lines
- Branding elements

### Rate Limits
Modify `src/lib/security/rate-limiting.ts` to adjust:
- Request limits
- Time windows
- Different limits per endpoint

### Validation Rules
Update `src/lib/security/validation.ts` to change:
- Email validation criteria
- Disposable email detection
- Bot detection rules

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure all external services (Supabase, email provider) are properly configured
4. Test each component individually (database, email, rate limiting)

The backend system is designed to be resilient - if optional services like Redis or email providers fail, the system will gracefully degrade while continuing to collect email addresses.

## 🎉 You're Ready!

Your Unmask waitlist backend is now fully configured with:
- ✅ Secure email collection and validation
- ✅ Double opt-in verification system
- ✅ Automated email sequences
- ✅ Admin dashboard with analytics
- ✅ Rate limiting and spam protection
- ✅ GDPR compliance features
- ✅ Mobile-optimized experience

Your users can now join the waitlist and you'll have all the tools needed to manage and analyze your growing community!