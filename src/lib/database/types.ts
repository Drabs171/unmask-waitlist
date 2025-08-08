export interface Database {
  public: {
    Tables: {
      waitlist_emails: {
        Row: {
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
          metadata: Record<string, unknown> | null;
          unsubscribed: boolean;
          unsubscribed_at: string | null;
          unsubscribe_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          email_hash: string;
          verified?: boolean;
          verification_token?: string | null;
          verification_sent_at?: string | null;
          verified_at?: string | null;
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
          metadata?: Record<string, unknown> | null;
          unsubscribed?: boolean;
          unsubscribed_at?: string | null;
          unsubscribe_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          email_hash?: string;
          verified?: boolean;
          verification_token?: string | null;
          verification_sent_at?: string | null;
          verified_at?: string | null;
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
          metadata?: Record<string, unknown> | null;
          unsubscribed?: boolean;
          unsubscribed_at?: string | null;
          unsubscribe_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      waitlist_stats: {
        Row: {
          id: string;
          date: string;
          total_signups: number;
          verified_signups: number;
          unique_visitors: number;
          conversion_rate: number;
          top_sources: Record<string, number>;
          top_referrers: Record<string, number>;
          ab_test_results: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          total_signups?: number;
          verified_signups?: number;
          unique_visitors?: number;
          conversion_rate?: number;
          top_sources?: Record<string, number>;
          top_referrers?: Record<string, number>;
          ab_test_results?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_signups?: number;
          verified_signups?: number;
          unique_visitors?: number;
          conversion_rate?: number;
          top_sources?: Record<string, number>;
          top_referrers?: Record<string, number>;
          ab_test_results?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type WaitlistEmail = Database['public']['Tables']['waitlist_emails']['Row'];
export type WaitlistEmailInsert = Database['public']['Tables']['waitlist_emails']['Insert'];
export type WaitlistEmailUpdate = Database['public']['Tables']['waitlist_emails']['Update'];

export type WaitlistStats = Database['public']['Tables']['waitlist_stats']['Row'];
export type WaitlistStatsInsert = Database['public']['Tables']['waitlist_stats']['Insert'];
export type WaitlistStatsUpdate = Database['public']['Tables']['waitlist_stats']['Update'];

// Request/Response types for API
export interface WaitlistSubmission {
  email: string;
  source?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ab_test_variant?: string;
  metadata?: Record<string, unknown>;
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    verification_required: boolean;
  };
  error?: string;
}

export interface WaitlistStatsResponse {
  total_signups: number;
  verified_signups: number;
  recent_signups: number;
  conversion_rate: number;
  top_sources: Array<{ source: string; count: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
  daily_stats: Array<{
    date: string;
    signups: number;
    verified: number;
    conversion_rate: number;
  }>;
  ab_test_results?: Record<string, unknown>;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface UnsubscribeRequest {
  token: string;
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
  email?: string;
}

// Admin types
export interface AdminEmailListResponse {
  emails: Array<{
    id: string;
    email: string;
    verified: boolean;
    source: string | null;
    created_at: string;
    ab_test_variant: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface AdminEmailExportRequest {
  format: 'csv' | 'json';
  verified_only?: boolean;
  start_date?: string;
  end_date?: string;
  source?: string;
}