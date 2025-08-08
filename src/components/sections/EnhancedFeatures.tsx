'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn, GradientText } from '@/components/animations';
import FeatureCard, { FeatureCardData } from '@/components/ui/FeatureCard';
import { useFeatureCardsAnimation } from '@/hooks/useFeatureAnimations';
import {
  BlindChatIcon,
  AuthenticHeartIcon,
  NoSwipeIcon,
  PersonalityIcon,
} from '@/components/icons/FeatureIcons';

// Feature data with color-coded themes
const featuresData: FeatureCardData[] = [
  {
    id: 'blind-chat',
    title: 'Blind Conversations First',
    subtitle: 'Start with real conversations',
    description: 'Chat and connect before seeing photos. Build attraction through authentic dialogue.',
    detailedDescription: 'No photos until you connect. Build attraction through authentic dialogue and shared interests. Experience dating the way it was meant to be - personality first, appearance second.',
    icon: BlindChatIcon,
    themeColor: '255, 107, 157', // Pink RGB values for CSS
    gradient: '#FF6B9D, #FF8FA3',
    accentColor: '#FF6B9D',
  },
  {
    id: 'authentic-heart',
    title: 'Real Connections Only',
    subtitle: 'Verified authentic connections',
    description: 'Advanced verification ensures real people seeking genuine relationships.',
    detailedDescription: 'Advanced verification and moderation ensure every user is authentic. Our community focuses on real people seeking meaningful connections, not validation or hookups.',
    icon: AuthenticHeartIcon,
    themeColor: '78, 205, 196', // Teal RGB values for CSS
    gradient: '#4ECDC4, #26D0CE',
    accentColor: '#4ECDC4',
  },
  {
    id: 'no-swipe',
    title: 'No Superficial Swipes',
    subtitle: 'Quality over quantity matching',
    description: 'End mindless swiping. Every match is curated based on deep compatibility.',
    detailedDescription: 'Our curated matching system eliminates endless swiping. Instead of hundreds of superficial matches, receive a few high-quality suggestions based on genuine compatibility.',
    icon: NoSwipeIcon,
    themeColor: '255, 140, 66', // Orange RGB values for CSS
    gradient: '#FF8C42, #FF6B35',
    accentColor: '#FF8C42',
  },
  {
    id: 'personality',
    title: 'Personality Over Photos',
    subtitle: 'Your mind is your best feature',
    description: 'Showcase your thoughts, values, and humor before your appearance.',
    detailedDescription: 'Express your unique personality through prompts, stories, and conversations. Our algorithm matches based on intellectual compatibility, shared values, and communication styles.',
    icon: PersonalityIcon,
    themeColor: '157, 78, 221', // Purple RGB values for CSS
    gradient: '#9D4EDD, #7209B7',
    accentColor: '#9D4EDD',
  },
];

const EnhancedFeatures: React.FC = () => {
  const { getEntranceDelay, globalAnimationState, shouldReduceMotion } = useFeatureCardsAnimation(featuresData.length);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF8FA3)' }}
          animate={!shouldReduceMotion ? {
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          } : {}}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-72 h-72 rounded-full opacity-5 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #4ECDC4, #26D0CE)' }}
          animate={!shouldReduceMotion ? {
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          } : {}}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-3 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #9D4EDD, #7209B7)' }}
          animate={!shouldReduceMotion ? {
            scale: [1, 1.15, 1],
            opacity: [0.03, 0.06, 0.03],
          } : {}}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
        />

        {/* Floating particles */}
        {!shouldReduceMotion && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-accent/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <FadeIn delay={0.1}>
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              Why <GradientText>Unmask</GradientText> is Revolutionary
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
            >
              Experience dating reimagined for the authentic generation. 
              Where personality matters more than photos, and real connections 
              triumph over superficial swipes.
            </motion.p>
            
            {/* Subtitle badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary-blue/10 border border-accent/20"
            >
              <motion.div
                className="w-2 h-2 bg-accent rounded-full"
                animate={!shouldReduceMotion ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-text-secondary font-medium">
                Built for GenZ, designed for authenticity
              </span>
            </motion.div>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              entranceDelay={getEntranceDelay(index)}
              className="w-full"
            />
          ))}
        </div>

        {/* Bottom CTA Section */}
        <FadeIn delay={1.2}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-20"
          >
            {/* Statistics Row */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              {[
                { number: '89%', label: 'More meaningful conversations' },
                { number: '73%', label: 'Longer lasting relationships' },
                { number: '94%', label: 'Prefer personality-first dating' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Ready to experience message */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-brand/10 border border-accent/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={!shouldReduceMotion ? { 
                scale: 1.05,
                boxShadow: '0 10px 30px rgba(255, 107, 157, 0.2)',
              } : {}}
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-accent"
                animate={!shouldReduceMotion ? {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <path
                  d="M10 2L12.09 8.26L18 10L12.09 11.74L10 18L7.91 11.74L2 10L7.91 8.26L10 2Z"
                  fill="currentColor"
                />
              </motion.svg>
              <span className="text-white font-medium">
                Ready to unmask your perfect match?
              </span>
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-accent"
                animate={!shouldReduceMotion ? { x: [0, 3, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
};

export default EnhancedFeatures;