'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle, UserPlus, Heart, Zap, MapPin, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Activity {
  id: string;
  type: 'join' | 'conversation' | 'match' | 'milestone';
  user?: string;
  location?: string;
  message?: string;
  timestamp: Date;
  count?: number;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  className?: string;
  maxVisible?: number;
  updateInterval?: number;
  showTimestamps?: boolean;
  showLocations?: boolean;
  autoScroll?: boolean;
}

// Activity templates for realistic feed generation
const activityTemplates = [
  {
    type: 'join' as const,
    messages: [
      'joined the waitlist',
      'signed up for early access',
      'joined the community',
      'requested beta access',
    ],
    icon: <UserPlus className="w-3 h-3" />,
  },
  {
    type: 'conversation' as const,
    messages: [
      'started a blind conversation',
      'had a meaningful chat',
      'connected through personality',
      'broke the ice without photos',
    ],
    icon: <MessageCircle className="w-3 h-3" />,
  },
  {
    type: 'match' as const,
    messages: [
      'made an authentic connection',
      'found their conversation partner',
      'discovered a genuine match',
      'connected on a deeper level',
    ],
    icon: <Heart className="w-3 h-3" />,
  },
  {
    type: 'milestone' as const,
    messages: [
      'people reached milestone',
      'users joined this hour',
      'conversations started today',
      'matches made this week',
    ],
    icon: <Zap className="w-3 h-3" />,
  },
];

const locations = [
  'NYC', 'LA', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Denver',
  'Miami', 'Portland', 'Nashville', 'Atlanta', 'San Diego', 'Phoenix',
  'Dallas', 'San Jose', 'Detroit', 'Las Vegas', 'Memphis', 'Orlando',
  'SF Bay Area', 'Washington DC', 'Philadelphia', 'Minneapolis',
];

const userInitials = [
  'AS', 'BM', 'CL', 'DK', 'EJ', 'FR', 'GH', 'IW', 'JT', 'KN',
  'LM', 'NP', 'OC', 'PR', 'QS', 'RT', 'SV', 'TY', 'UV', 'WX',
  'YZ', 'AB', 'CD', 'EF', 'GI', 'HK', 'JL', 'MO', 'PQ', 'ST'
];

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  className,
  maxVisible = 4,
  updateInterval = 8000, // 8 seconds
  showTimestamps = true,
  showLocations = true,
  autoScroll = true,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Generate realistic activity
  const generateActivity = useCallback((): Activity => {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const message = template.messages[Math.floor(Math.random() * template.messages.length)];
    const user = userInitials[Math.floor(Math.random() * userInitials.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    const activity: Activity = {
      id: `activity-${Date.now()}-${Math.random()}`,
      type: template.type,
      user: template.type === 'milestone' ? undefined : `${user}.`,
      location: showLocations && template.type !== 'milestone' ? location : undefined,
      message: message,
      timestamp: new Date(),
      icon: template.icon,
    };

    // Add count for milestone activities
    if (template.type === 'milestone') {
      activity.count = Math.floor(Math.random() * 50) + 10;
    }

    return activity;
  }, [showLocations]);

  // Initialize with some activities
  useEffect(() => {
    const initialActivities = Array.from({ length: maxVisible }, () => {
      const activity = generateActivity();
      // Stagger initial timestamps
      activity.timestamp = new Date(Date.now() - Math.random() * 300000); // Within last 5 minutes
      return activity;
    });

    setActivities(initialActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, [generateActivity, maxVisible]);

  // Auto-generate new activities
  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      setIsGenerating(true);
      
      setTimeout(() => {
        const newActivity = generateActivity();
        
        setActivities(prev => {
          const updated = [newActivity, ...prev];
          return updated.slice(0, maxVisible);
        });
        
        setIsGenerating(false);
      }, 500);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoScroll, updateInterval, generateActivity, maxVisible]);

  // Format relative time
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get activity color
  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'join': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'conversation': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'match': return 'text-pink-400 bg-pink-500/20 border-pink-500/30';
      case 'milestone': return 'text-accent bg-accent/20 border-accent/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.4,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.9,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
      },
    },
  };

  const pulseVariants: any = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
          <motion.div
            className="w-2 h-2 bg-success rounded-full"
            animate={!shouldReduceMotion ? 'pulse' : {}}
            variants={pulseVariants}
          />
          <span className="text-sm text-text-secondary font-medium">
            Live Activity
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">
          Real-Time Community Updates
        </h3>
        <p className="text-text-secondary text-sm">
          See what&apos;s happening right now in the Unmask community
        </p>
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        className="space-y-3 max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="relative overflow-hidden rounded-xl p-4 backdrop-blur-md border group cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              variants={itemVariants}
              layout
              whileHover={!shouldReduceMotion ? {
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              } : {}}
              transition={{ duration: 0.2 }}
            >
              {/* Activity Content */}
              <div className="flex items-center gap-3 relative z-10">
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border',
                  getActivityColor(activity.type)
                )}>
                  {activity.icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* User */}
                    {activity.user && (
                      <span className="font-medium text-white text-sm">
                        {activity.user}
                      </span>
                    )}
                    
                    {/* Count for milestones */}
                    {activity.count && (
                      <span className="font-bold text-accent text-sm">
                        {activity.count}
                      </span>
                    )}
                    
                    {/* Location */}
                    {activity.location && (
                      <div className="flex items-center gap-1 text-text-secondary text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {activity.message}
                  </p>

                  {/* Timestamp */}
                  {showTimestamps && (
                    <div className="flex items-center gap-1 mt-2 text-text-secondary/70 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  )}
                </div>

                {/* Recent indicator */}
                {index === 0 && (
                  <motion.div
                    className="w-2 h-2 bg-success rounded-full flex-shrink-0"
                    animate={!shouldReduceMotion ? {
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.6, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.05), rgba(78, 205, 196, 0.05))',
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Generation indicator */}
        {isGenerating && !shouldReduceMotion && (
          <motion.div
            className="flex items-center justify-center gap-2 py-3 text-text-secondary text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.div
              className="w-2 h-2 bg-accent rounded-full"
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span>New activity incoming...</span>
          </motion.div>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="text-center">
            <div className="text-sm font-bold text-accent">
              {Math.floor(Math.random() * 20) + 40}
            </div>
            <div className="text-xs text-text-secondary">
              Active now
            </div>
          </div>
          
          <div className="w-px h-6 bg-white/20" />
          
          <div className="text-center">
            <div className="text-sm font-bold text-primary-blue">
              {Math.floor(Math.random() * 100) + 200}
            </div>
            <div className="text-xs text-text-secondary">
              This hour
            </div>
          </div>
          
          <div className="w-px h-6 bg-white/20" />
          
          <div className="text-center">
            <div className="text-sm font-bold text-success">
              {Math.floor(Math.random() * 500) + 1000}
            </div>
            <div className="text-xs text-text-secondary">
              Today
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityFeed;