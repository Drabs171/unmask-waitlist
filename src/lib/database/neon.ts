'use server';

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

// Avoid throwing at import time in dev; provide a helpful runtime error instead
export const sql: any = connectionString
  ? neon(connectionString)
  : (async () => {
      throw new Error(
        'Database not configured. Set NEON_DATABASE_URL (or DATABASE_URL) in .env.local.'
      );
    });

// Helper row types
export interface WaitlistEmailRow {
  id: string;
  email: string;
  email_hash: string;
  verified: boolean;
  verification_token: string | null;
  verification_sent_at: string | null;
  verified_at: string | null;
  source: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  ab_test_variant: string | null;
  metadata: any;
  unsubscribed: boolean;
  unsubscribed_at: string | null;
  unsubscribe_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function getEmailByHash(emailHash: string) {
  const rows = await sql<Pick<WaitlistEmailRow, 'id' | 'email' | 'verified' | 'unsubscribed'>[]>`
    SELECT id, email, verified, unsubscribed
    FROM waitlist_emails
    WHERE email_hash = ${emailHash}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateVerificationToken(id: string, token: string) {
  await sql`UPDATE waitlist_emails SET verification_token = ${token}, verification_sent_at = NOW() WHERE id = ${id}`;
}

export interface InsertEmailInput {
  email: string;
  email_hash: string;
  verification_token: string;
  unsubscribe_token: string;
  source?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  ab_test_variant?: string | null;
  metadata?: any;
}

export async function insertEmail(input: InsertEmailInput) {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO waitlist_emails (
      email, email_hash, verification_token, verification_sent_at, unsubscribe_token,
      source, referrer, user_agent, ip_address,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      ab_test_variant, metadata
    ) VALUES (
      ${input.email}, ${input.email_hash}, ${input.verification_token}, NOW(), ${input.unsubscribe_token},
      ${input.source ?? null}, ${input.referrer ?? null}, ${input.user_agent ?? null}, ${input.ip_address ?? null},
      ${input.utm_source ?? null}, ${input.utm_medium ?? null}, ${input.utm_campaign ?? null}, ${input.utm_term ?? null}, ${input.utm_content ?? null},
      ${input.ab_test_variant ?? null}, ${input.metadata ?? {}}
    ) RETURNING id
  `;
  return rows[0];
}

export async function getVerifiedCount() {
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM waitlist_emails WHERE verified = true AND unsubscribed = false
  `;
  return rows[0]?.count ?? 0;
}

export async function getEmailByVerificationToken(token: string) {
  const rows = await sql<Pick<WaitlistEmailRow, 'id' | 'email' | 'verified' | 'unsubscribed' | 'unsubscribe_token'>[]>`
    SELECT id, email, verified, unsubscribed, unsubscribe_token
    FROM waitlist_emails
    WHERE verification_token = ${token}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function verifyEmailById(id: string) {
  await sql`UPDATE waitlist_emails SET verified = true, verified_at = NOW(), verification_token = NULL WHERE id = ${id}`;
}

export async function getEmailByUnsubscribeToken(token: string) {
  const rows = await sql<Pick<WaitlistEmailRow, 'id' | 'email' | 'unsubscribed'>[]>`
    SELECT id, email, unsubscribed FROM waitlist_emails WHERE unsubscribe_token = ${token} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function markUnsubscribed(id: string) {
  await sql`UPDATE waitlist_emails SET unsubscribed = true, unsubscribed_at = NOW() WHERE id = ${id}`;
}

export async function selectEmailStatsBase() {
  const rows = await sql<Pick<WaitlistEmailRow, 'verified' | 'created_at' | 'source' | 'unsubscribed'>[]>`
    SELECT verified, created_at, source, unsubscribed FROM waitlist_emails WHERE unsubscribed = false
  `;
  return rows;
}

