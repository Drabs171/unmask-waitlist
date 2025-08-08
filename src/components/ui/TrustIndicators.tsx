'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Shield, Lock, Users, Eye, CheckCircle, Heart, Zap, Award } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TrustBadge {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgGradient: string;
}

interface TrustIndicatorsProps {
  className?: string;
  showTooltips?: boolean;
  layout?: 'grid' | 'horizontal';
}

const trustBadges: TrustBadge[] = [
  {
    id: 'privacy-first',
    icon: Shield,
    title: 'Privacy First',
    description: 'Your personal data stays completely private and secure',
    features: [
      'No data selling to third parties',
      'Advanced encryption for all communications',
      'Anonymous browsing options',
      'Complete data deletion on request'
    ],
    color: 'text-green-400',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'safe-space',
    icon: Users,
    title: 'Safe Space',
    description: 'Verified community with zero tolerance for harassment',
    features: [
      'Real identity verification required',
      'Advanced moderation systems',
      'Immediate reporting and blocking',
      '24/7 community support team'
    ],
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'encrypted',
    icon: Lock,
    title: 'End-to-End Encrypted',
    description: 'All conversations are secured with military-grade encryption',
    features: [
      'Messages encrypted in transit and at rest',
      'Perfect forward secrecy',
      'No message scanning or monitoring',
      'Self-destructing message options'
    ],
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    id: 'verified-users',
    icon: CheckCircle,
    title: 'Verified Users Only',
    description: 'Every member is verified through multiple security checks',
    features: [
      'Multi-step identity verification',
      'Social media cross-validation',
      'Photo authenticity checks',
      'Regular account reviews'
    ],
    color: 'text-accent',
    bgGradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 'authentic-connections',
    icon: Heart,
    title: 'Authentic Connections',
    description: 'Genuine relationships built on real compatibility',
    features: [
      'Personality-based matching algorithms',
      'Anti-spam and bot detection',
      'Quality over quantity approach',
      'Relationship success tracking'
    ],
    color: 'text-red-400',
    bgGradient: 'from-red-500/20 to-pink-500/20',
  },
  {
    id: 'gdpr-compliant',
    icon: Eye,
    title: 'GDPR Compliant',
    description: 'Full compliance with international privacy regulations',
    features: [
      'Transparent data usage policies',
      'Right to data portability',
      'Consent management system',
      'Regular privacy audits'
    ],
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/20 to-orange-500/20',
  },
];

const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  className,
  showTooltips = true,
  layout = 'grid',
}) => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.5,
        ease: 'easeOut',
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: shouldReduceMotion ? 1 : 1.05,
      y: shouldReduceMotion ? 0 : -4,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: shouldReduceMotion ? 1 : 1.1,
      rotate: shouldReduceMotion ? 0 : [0, -5, 5, 0],
      transition: {
        duration: 0.5,
      },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main Grid */}
      <motion.div
        className={cn(
          layout === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6'
            : 'flex flex-wrap justify-center gap-4 md:gap-6'
        )}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        {trustBadges.map((badge, index) => {
          const IconComponent = badge.icon;
          const isHovered = hoveredBadge === badge.id;
          const isSelected = selectedBadge === badge.id;

          return (
            <motion.div
              key={badge.id}
              className="relative"
              variants={badgeVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setHoveredBadge(badge.id)}
              onHoverEnd={() => setHoveredBadge(null)}
            >
              <motion.div
                className={cn(
                  'relative overflow-hidden rounded-2xl p-4 md:p-6 cursor-pointer group',
                  'border border-white/10 backdrop-blur-md',
                  `bg-gradient-to-br ${badge.bgGradient}`,
                  'hover:border-white/20 transition-colors duration-300'
                )}
                variants={hoverVariants}
                onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
              >
                {/* Icon */}
                <motion.div
                  className="mb-3 md:mb-4"
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className={cn(
                    'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center',
                    'bg-white/10 group-hover:bg-white/15 transition-colors duration-300'
                  )}>
                    <IconComponent className={cn('w-5 h-5 md:w-6 md:h-6', badge.color)} />
                  </div>

                  {/* Verification Checkmark */}
                  {(isHovered || isSelected) && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-white"
                      >
                        <motion.path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                        />
                      </motion.svg>
                    </motion.div>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h3 
                  className="font-semibold text-white text-sm md:text-base mb-2 leading-tight"
                  animate={isHovered ? { color: badge.color.replace('text-', '') } : {}}
                >
                  {badge.title}
                </motion.h3>

                {/* Description */}
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                  {badge.description}
                </p>

                {/* Hover Glow Effect */}
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-2xl opacity-0 pointer-events-none',
                    `bg-gradient-to-br ${badge.bgGradient}`
                  )}
                  animate={{ opacity: isHovered ? 0.3 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Click indicator */}
                <motion.div
                  className="absolute bottom-2 right-2 text-text-secondary"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M3 6h6m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </motion.div>
              </motion.div>

              {/* Detailed Tooltip */}
              <AnimatePresence>
                {showTooltips && isSelected && (
                  <motion.div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50 w-72 md:w-80"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          `bg-gradient-to-br ${badge.bgGradient}`
                        )}>
                          <IconComponent className={cn('w-5 h-5', badge.color)} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{badge.title}</h4>
                          <p className="text-text-secondary text-sm">{badge.description}</p>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2">
                        {badge.features.map((feature, featureIndex) => (
                          <motion.div
                            key={feature}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.1 }}
                          >
                            <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-success" />
                            </div>
                            <span className="text-sm text-text-secondary">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Close Button */}
                      <button
                        onClick={() => setSelectedBadge(null)}
                        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-white">
                          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>

                      {/* Arrow */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-black/90" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Trust Score Summary */}
      <motion.div
        className="text-center mt-8 md:mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            <span className="text-white font-semibold">Trust Score</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-accent">
                  <path d="M8 1L9.5 5.5H14L10.5 8.5L12 13L8 10L4 13L5.5 8.5L2 5.5H6.5L8 1Z"/>
                </svg>
              </motion.div>
            ))}
            <span className="ml-2 text-text-secondary text-sm">5.0/5.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrustIndicators;