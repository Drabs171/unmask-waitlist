'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Calendar, 
  Mail,
  BarChart3,
  Shield,
  Download
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { WaitlistStatsResponse } from '@/lib/database/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<WaitlistStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/waitlist/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    trend?: string;
    trendUp?: boolean;
    color?: string;
  }> = ({ title, value, icon: Icon, trend, trendUp, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          color === 'green' && "bg-green-500/20 text-green-400",
          color === 'blue' && "bg-blue-500/20 text-blue-400",
          color === 'purple' && "bg-purple-500/20 text-purple-400",
          color === 'orange' && "bg-orange-500/20 text-orange-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
            trendUp 
              ? "bg-green-500/20 text-green-400" 
              : "bg-red-500/20 text-red-400"
          )}>
            <TrendingUp className={cn("w-3 h-3", !trendUp && "rotate-180")} />
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-text-secondary text-sm">{title}</p>
      </div>
    </motion.div>
  );

  const ChartContainer: React.FC<{ 
    title: string; 
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                🎭 Unmask Admin Dashboard
              </h1>
              <p className="text-text-secondary">
                Waitlist management and analytics
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Refresh
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Signups"
            value={stats.total_signups}
            icon={Users}
            color="blue"
          />
          
          <StatCard
            title="Verified Users"
            value={stats.verified_signups}
            icon={UserCheck}
            color="green"
            trend={`${stats.conversion_rate}%`}
            trendUp={stats.conversion_rate > 50}
          />
          
          <StatCard
            title="Recent Signups"
            value={stats.recent_signups}
            icon={Calendar}
            color="purple"
            trend="Last 24h"
          />
          
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversion_rate}%`}
            icon={TrendingUp}
            color="orange"
            trendUp={stats.conversion_rate > 70}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Signups Chart */}
          <ChartContainer title="Daily Signups (Last 7 Days)">
            <div className="space-y-3">
              {stats.daily_stats.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {day.signups}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent to-primary-blue h-2 rounded-full"
                        style={{
                          width: `${Math.max(day.signups / Math.max(...stats.daily_stats.map(d => d.signups)) * 100, 5)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>

          {/* Top Sources */}
          <ChartContainer title="Top Signup Sources">
            <div className="space-y-4">
              {stats.top_sources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      index === 0 && "bg-accent",
                      index === 1 && "bg-primary-blue",
                      index === 2 && "bg-green-400",
                      index === 3 && "bg-yellow-400",
                      index >= 4 && "bg-gray-400"
                    )} />
                    <span className="text-white capitalize">
                      {source.source === 'direct' ? 'Direct' : source.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary text-sm">
                      {((source.count / stats.total_signups) * 100).toFixed(1)}%
                    </span>
                    <span className="text-white font-medium">
                      {source.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
              <Mail className="w-5 h-5 text-accent" />
              <div>
                <div className="font-medium text-white">Send Broadcast</div>
                <div className="text-sm text-text-secondary">Email all users</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
              <Download className="w-5 h-5 text-primary-blue" />
              <div>
                <div className="font-medium text-white">Export Data</div>
                <div className="text-sm text-text-secondary">Download CSV</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-medium text-white">View Analytics</div>
                <div className="text-sm text-text-secondary">Detailed reports</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}