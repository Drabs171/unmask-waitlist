-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Waitlist emails table
CREATE TABLE IF NOT EXISTS public.waitlist_emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    email_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash for duplicate prevention
    verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    verification_sent_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    source TEXT, -- 'organic', 'social', 'ads', etc.
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    ab_test_variant TEXT,
    metadata JSONB DEFAULT '{}',
    unsubscribed BOOLEAN DEFAULT FALSE,
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist statistics table (daily aggregates)
CREATE TABLE IF NOT EXISTS public.waitlist_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_signups INTEGER DEFAULT 0,
    verified_signups INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
    top_sources JSONB DEFAULT '{}',
    top_referrers JSONB DEFAULT '{}',
    ab_test_results JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_email_hash ON public.waitlist_emails(email_hash);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_verified ON public.waitlist_emails(verified);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_created_at ON public.waitlist_emails(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_source ON public.waitlist_emails(source);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_ab_test_variant ON public.waitlist_emails(ab_test_variant);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_unsubscribed ON public.waitlist_emails(unsubscribed);
CREATE INDEX IF NOT EXISTS idx_waitlist_stats_date ON public.waitlist_stats(date);

-- Unique index for verification tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_emails_verification_token 
ON public.waitlist_emails(verification_token) 
WHERE verification_token IS NOT NULL;

-- Unique index for unsubscribe tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_emails_unsubscribe_token 
ON public.waitlist_emails(unsubscribe_token) 
WHERE unsubscribe_token IS NOT NULL;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_waitlist_emails_updated_at 
    BEFORE UPDATE ON public.waitlist_emails 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_waitlist_stats_updated_at 
    BEFORE UPDATE ON public.waitlist_stats 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow anonymous inserts for waitlist signups
CREATE POLICY "Allow anonymous email inserts" 
ON public.waitlist_emails FOR INSERT 
TO anon WITH CHECK (true);

-- Allow anonymous email verification updates
CREATE POLICY "Allow anonymous verification updates" 
ON public.waitlist_emails FOR UPDATE 
TO anon 
USING (verification_token IS NOT NULL) 
WITH CHECK (verification_token IS NOT NULL);

-- Allow anonymous unsubscribe updates
CREATE POLICY "Allow anonymous unsubscribe updates" 
ON public.waitlist_emails FOR UPDATE 
TO anon 
USING (unsubscribe_token IS NOT NULL) 
WITH CHECK (unsubscribe_token IS NOT NULL);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access on waitlist_emails" 
ON public.waitlist_emails FOR ALL 
TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on waitlist_stats" 
ON public.waitlist_stats FOR ALL 
TO service_role USING (true) WITH CHECK (true);

-- Function to safely get email count (for public display)
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.waitlist_emails 
        WHERE verified = true AND unsubscribed = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily stats
CREATE OR REPLACE FUNCTION get_daily_stats(start_date DATE, end_date DATE)
RETURNS TABLE(
    date DATE,
    signups BIGINT,
    verified BIGINT,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(we.created_at) as date,
        COUNT(*) as signups,
        COUNT(*) FILTER (WHERE we.verified = true) as verified,
        CASE 
            WHEN COUNT(*) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE we.verified = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM public.waitlist_emails we
    WHERE DATE(we.created_at) BETWEEN start_date AND end_date
    AND we.unsubscribed = false
    GROUP BY DATE(we.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS void AS $$
DECLARE
    stat_date DATE := CURRENT_DATE - INTERVAL '1 day';
    total_count INTEGER;
    verified_count INTEGER;
    conv_rate DECIMAL(5,4);
    sources_data JSONB;
    referrers_data JSONB;
BEGIN
    -- Get counts for the day
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE verified = true)
    INTO total_count, verified_count
    FROM public.waitlist_emails
    WHERE DATE(created_at) = stat_date
    AND unsubscribed = false;

    -- Calculate conversion rate
    IF total_count > 0 THEN
        conv_rate := verified_count::DECIMAL / total_count::DECIMAL;
    ELSE
        conv_rate := 0.0000;
    END IF;

    -- Get top sources
    SELECT json_object_agg(source, count)::JSONB
    INTO sources_data
    FROM (
        SELECT 
            COALESCE(source, 'direct') as source,
            COUNT(*) as count
        FROM public.waitlist_emails
        WHERE DATE(created_at) = stat_date
        AND unsubscribed = false
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
    ) s;

    -- Get top referrers
    SELECT json_object_agg(referrer, count)::JSONB
    INTO referrers_data
    FROM (
        SELECT 
            COALESCE(referrer, 'direct') as referrer,
            COUNT(*) as count
        FROM public.waitlist_emails
        WHERE DATE(created_at) = stat_date
        AND unsubscribed = false
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
    ) r;

    -- Insert or update daily stats
    INSERT INTO public.waitlist_stats (
        date,
        total_signups,
        verified_signups,
        conversion_rate,
        top_sources,
        top_referrers
    )
    VALUES (
        stat_date,
        total_count,
        verified_count,
        conv_rate,
        COALESCE(sources_data, '{}'::JSONB),
        COALESCE(referrers_data, '{}'::JSONB)
    )
    ON CONFLICT (date) 
    DO UPDATE SET
        total_signups = EXCLUDED.total_signups,
        verified_signups = EXCLUDED.verified_signups,
        conversion_rate = EXCLUDED.conversion_rate,
        top_sources = EXCLUDED.top_sources,
        top_referrers = EXCLUDED.top_referrers,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to update daily stats (requires pg_cron extension)
-- This would typically be set up separately or via a scheduled function
-- SELECT cron.schedule('update-daily-stats', '5 0 * * *', 'SELECT update_daily_stats();');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.waitlist_emails TO anon;
GRANT SELECT ON public.waitlist_stats TO anon;
GRANT ALL ON public.waitlist_emails TO service_role;
GRANT ALL ON public.waitlist_stats TO service_role;

GRANT EXECUTE ON FUNCTION get_waitlist_count() TO anon;
GRANT EXECUTE ON FUNCTION get_daily_stats(DATE, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION update_daily_stats() TO service_role;

-- Initial setup completed
-- To apply this schema:
-- 1. Copy and paste this SQL into your Supabase SQL Editor
-- 2. Run the script
-- 3. Verify tables are created with proper indexes and RLS policies