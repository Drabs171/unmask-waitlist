import { NextResponse } from 'next/server';
import { sql } from '@/lib/database/neon';

export async function GET() {
  try {
    // Create minimal schema needed for production
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

    await sql`CREATE TABLE IF NOT EXISTS public.waitlist_emails (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT NOT NULL,
      email_hash TEXT NOT NULL UNIQUE,
      verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      verification_sent_at TIMESTAMPTZ,
      verified_at TIMESTAMPTZ,
      source TEXT,
      referrer TEXT,
      user_agent TEXT,
      ip_address INET,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,
      ab_test_variant TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      unsubscribed BOOLEAN DEFAULT FALSE,
      unsubscribed_at TIMESTAMPTZ,
      unsubscribe_token TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`;

    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_emails_email_hash ON public.waitlist_emails(email_hash);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_emails_verified ON public.waitlist_emails(verified);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_emails_created_at ON public.waitlist_emails(created_at);`;

    return NextResponse.json({ migrated: true });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ migrated: false, error: (error as Error).message }, { status: 500 });
  }
}

