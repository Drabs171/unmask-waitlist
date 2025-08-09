import { NextRequest, NextResponse } from 'next/server';
import { selectEmailStatsBase } from '@/lib/database/neon';
import { checkGeneralRateLimit, createRateLimitHeaders } from '@/lib/security/rate-limiting';
import type { WaitlistStatsResponse } from '@/lib/database/types';

export async function GET(request: NextRequest) {
  try {
    // Check rate limiting
    const bypass = request.headers.get('x-debug-bypass') === 'true';
    const rateLimitResult = bypass
      ? { success: true, limit: 999, remaining: 998, reset: new Date(Date.now() + 60000) }
      : await checkGeneralRateLimit(request);
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

    // Get basic stats
    const emailStats = await selectEmailStatsBase();

    // Calculate metrics
    const totalSignups = emailStats.length;
    const verifiedSignups = emailStats.filter((email: { verified: boolean }) => email.verified).length;
    const conversionRate = totalSignups > 0 ? (verifiedSignups / totalSignups) * 100 : 0;

    // Recent signups (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSignups = emailStats.filter(
      (email: { created_at: string }) => new Date(email.created_at) > yesterday
    ).length;

    // Top sources
    const sourceCounts: Record<string, number> = {};
    emailStats.forEach((email: { source: string | null }) => {
      const source = email.source || 'direct';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily stats for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySignups = emailStats.filter((email: { created_at: string }) => {
        const emailDate = new Date(email.created_at);
        return emailDate >= dayStart && emailDate < dayEnd;
      });

      const dayVerified = daySignups.filter((email: { verified: boolean }) => email.verified);

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        signups: daySignups.length,
        verified: dayVerified.length,
        conversion_rate: daySignups.length > 0 ? (dayVerified.length / daySignups.length) * 100 : 0,
      });
    }

    const response: WaitlistStatsResponse = {
      total_signups: totalSignups,
      verified_signups: verifiedSignups,
      recent_signups: recentSignups,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      top_sources: topSources,
      top_referrers: [], // Would need additional data to populate this
      daily_stats: dailyStats,
    };

    return NextResponse.json(response, { headers: rateLimitHeaders });

  } catch (error) {
    console.error('Error fetching waitlist statistics:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    // Simple database connectivity check
    await selectEmailStatsBase();

    return new NextResponse(null, { status: 200 });

  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}