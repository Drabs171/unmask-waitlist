'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { cn } from '@/utils/cn';
import { MapPin, Clock, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  initial: string;
  location: string;
  rating: number;
  quote: string;
  avatar: string;
}

interface ActivityItem {
  id: string;
  type: 'signup' | 'match' | 'success';
  user: string;
  location: string;
  time: string;
  count?: number;
  icon: React.ReactNode;
}

const CommunityUpdates: React.FC = () => {
  const { isMobile } = useMobileDetection();
  const [, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const testimonials: Testimonial[] = [];

  const activityItems: ActivityItem[] = [];

  const stats = {
    activeNow: 0,
    thisHour: 0,
    today: 0
  };

  return (
    <section className={cn(
      "relative py-20",
      isMobile ? "px-4 py-16" : "px-8"
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className={cn(
          "grid gap-12",
          isMobile ? "grid-cols-1" : "lg:grid-cols-2 lg:gap-16"
        )}>
          
          {/* Left Side - Activity Feed */}
          <FadeIn delay={0.2}>
            <div className="space-y-8">
              {/* Section Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 font-medium text-sm">Live Activity</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Real-Time Community Updates
                </h2>
                <p className="text-text-secondary text-lg">
                  See what&apos;s happening right now in the Unmask community
                </p>
              </div>

              {/* Activity Feed */}
              <div className="space-y-4">
                {activityItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "bg-white/5 backdrop-blur-md rounded-xl p-4",
                      "border border-white/10 hover:border-white/20",
                      "transition-all duration-300 hover:bg-white/8"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-accent/20 rounded-full">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {item.count && (
                            <span className="text-accent font-bold text-lg">{item.count}</span>
                          )}
                          <span className="text-white font-medium">
                            {item.count ? item.user : `${item.user} signed up for early access`}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1 text-text-secondary text-sm mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-text-secondary text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className={cn(
                "bg-white/5 backdrop-blur-md rounded-xl p-6",
                "border border-white/10"
              )}>
                <div className={cn(
                  "grid gap-6 text-center",
                  isMobile ? "grid-cols-1" : "grid-cols-3"
                )}>
                  <div>
                    <div className="text-2xl font-bold text-red-400 mb-1">{stats.activeNow}</div>
                    <div className="text-text-secondary text-sm">Active now</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-400 mb-1">{stats.thisHour}</div>
                    <div className="text-text-secondary text-sm">This hour</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400 mb-1">{stats.today}</div>
                    <div className="text-text-secondary text-sm">Today</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Side - Testimonials */}
          <FadeIn delay={0.4}>
            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                  className={cn(
                    "bg-white/5 backdrop-blur-md rounded-xl p-6",
                    "border border-white/10 hover:border-white/20",
                    "transition-all duration-300 hover:bg-white/8",
                    "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10"
                  )}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: testimonial.avatar }}
                    >
                      {testimonial.initial}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{testimonial.name}</span>
                        <div className="w-1 h-1 bg-text-secondary rounded-full" />
                        <span className="text-text-secondary text-sm">{testimonial.location}</span>
                      </div>
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>

                  {/* Quote */}
                  <blockquote className="text-text-secondary italic leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default CommunityUpdates;