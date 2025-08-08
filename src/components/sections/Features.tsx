'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn, GradientText } from '@/components/animations';
import { MessageCircle, Heart, Shield, Sparkles } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { cn } from '@/utils/cn';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
}

const Features: React.FC = () => {
  const { isMobile } = useMobileDetection();

  const features: FeatureCard[] = [
    {
      id: '01',
      title: 'Conversation First',
      description: 'Build genuine connections through meaningful dialogue before photos are revealed. No more surface-level judgments.',
      icon: <MessageCircle className="w-8 h-8 text-pink-400" />,
      badge: 'Core',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    },
    {
      id: '02',
      title: 'Authentic Matching',
      description: 'Our algorithm prioritizes personality compatibility and shared values over superficial metrics.',
      icon: <Heart className="w-8 h-8 text-purple-400" />,
      badge: 'AI-Powered',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: '03',
      title: 'Safe & Trusted',
      description: 'Advanced verification and moderation ensure a premium, harassment-free dating experience.',
      icon: <Shield className="w-8 h-8 text-teal-400" />,
      badge: 'Verified',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    },
    {
      id: '04',
      title: 'Premium Experience',
      description: 'Quality over quantity. Curated matches for meaningful relationships, not endless swiping.',
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      badge: 'Exclusive',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
  ];

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants: any = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
       transition: {
         type: "spring" as const,
        stiffness: 300,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  return (
    <section className={cn(
      "relative py-20 overflow-visible",
      isMobile ? "px-4 py-16" : "px-8"
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <FadeIn delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why <GradientText>Unmask</GradientText> is Different
            </h2>
            <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              We&apos;re revolutionizing online dating by prioritizing what truly matters: genuine personality and authentic connections.
            </p>
          </div>
        </FadeIn>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={cn(
            "grid gap-6",
            isMobile 
              ? "grid-cols-1" 
              : "grid-cols-2 lg:gap-8"
          )}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={cn(
                "group relative z-10",
                "bg-white/5 backdrop-blur-md rounded-2xl p-8",
                "border border-white/10 hover:border-white/20",
                "transition-all duration-300",
                "hover:bg-white/8 hover:shadow-xl hover:shadow-black/20",
                isMobile ? "p-6" : ""
              )}
            >
              {/* Card Number */}
              <div className="absolute top-6 left-6 text-white/30 text-sm font-mono">
                {feature.id}
              </div>

              {/* Badge */}
              <div className="absolute top-6 right-6">
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                  feature.badgeColor
                )}>
                  {feature.badge}
                </span>
              </div>

              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 mb-6 mt-8">
                <div className="relative">
                  {feature.icon}
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <FadeIn delay={0.8}>
          <div className="text-center mt-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors duration-200 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-medium">Ready to experience dating differently?</span>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Features;