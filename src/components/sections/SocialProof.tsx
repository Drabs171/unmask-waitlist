'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GradientText } from '@/components/animations';
import TrustIndicators from '@/components/ui/TrustIndicators';
import { TrendingUp, Users, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SocialProofSectionProps {
  className?: string;
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const Section: React.FC<SectionProps> = ({ children, className, delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      className={cn('mb-16 md:mb-20', className)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: shouldReduceMotion ? 0.1 : 0.8,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

const SocialProof: React.FC<SocialProofSectionProps> = ({ className }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className={cn('py-16 md:py-24 px-4 relative overflow-hidden', className)}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={!shouldReduceMotion ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {}}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-blue/5 rounded-full blur-3xl"
          animate={!shouldReduceMotion ? {
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          } : {}}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"
          animate={!shouldReduceMotion ? {
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          } : {}}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <Section>
          <div className="text-center mb-8 md:mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-success text-sm font-medium">Growing Fast</span>
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Join the <GradientText>Movement</GradientText>
            </h2>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Choose authentic connections over superficial swipes.
            </p>
          </div>
        </Section>

        {/* Removed counters, avatar grids, activity feed, and testimonials to eliminate mock data */}

        {/* Media Mentions */}
        {/* 
        <Section delay={0.5}>
          <MediaMentions 
            className="mb-8 md:mb-12"
            autoScroll={true}
            scrollSpeed={30}
          />
        </Section>
        */}

        {/* Trust Indicators */}
        <Section delay={0.6}>
          <TrustIndicators 
            className="mb-8 md:mb-12"
            showTooltips={true}
            layout="grid"
          />
        </Section>

        {/* Final Community CTA */}
        <Section delay={0.7}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.6, delay: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-white font-semibold">Trusted Community</span>
              </div>
              
              <div className="w-px h-6 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-text-secondary text-sm">Privacy Protected</span>
              </div>
              
              <div className="w-px h-6 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <motion.div
                  animate={!shouldReduceMotion ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-accent" />
                </motion.div>
                <span className="text-text-secondary text-sm">Authentic Connections</span>
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </section>
  );
};

export default SocialProof;