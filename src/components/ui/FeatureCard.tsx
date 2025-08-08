'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useFeatureAnimations } from '@/hooks/useFeatureAnimations';

export interface FeatureCardData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<any>;
  themeColor: string;
  gradient: string;
  accentColor: string;
}

interface FeatureCardProps {
  feature: FeatureCardData;
  index: number;
  entranceDelay: number;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index,
  entranceDelay,
  className,
}) => {
  const {
    cardRef,
    cardState,
    shouldReduceMotion,
    handlers,
    variants,
  } = useFeatureAnimations(feature.id, entranceDelay);

  const IconComponent = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'group relative w-full h-80 perspective-1000',
        'cursor-pointer select-none',
        className
      )}
      initial="initial"
      animate={cardState.hasEntered ? 'enter' : 'initial'}
      variants={variants.card as any}
      whileHover="hover"
      {...handlers}
    >
      {/* Card Container with 3D flip */}
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate="flip"
        variants={variants.card as any}
      >
        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl blur-xl"
          style={{
            background: feature.gradient,
            opacity: 0.1,
          }}
          initial="initial"
          animate={cardState.isHovered ? 'hover' : 'initial'}
           variants={variants.glow(feature.themeColor) as any}
        />

        {/* Front Face */}
        <motion.div
          className={cn(
            'absolute inset-0 w-full h-full backface-hidden',
            'rounded-2xl overflow-hidden',
            'bg-white/5 backdrop-blur-md',
            'border border-white/10',
            'flex flex-col items-center justify-center',
            'p-6 text-center'
          )}
          style={{
            background: `linear-gradient(135deg, ${feature.gradient}15, rgba(255, 255, 255, 0.05))`,
            borderImage: `linear-gradient(135deg, ${feature.gradient}40, rgba(255, 255, 255, 0.1)) 1`,
          }}
        >
          {/* Icon Container */}
          <motion.div
            className="mb-6 relative"
            initial="initial"
            animate={cardState.isHovered ? 'hover' : 'initial'}
            variants={variants.icon as any}
          >
            {/* Icon Background */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: feature.gradient,
                opacity: 0.8,
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/10" />
              
              {/* Icon */}
              <IconComponent
                size={32}
                className="text-white relative z-10"
                animated={true}
                variant={cardState.isHovered ? 'hover' : 'default'}
              />
              
              {/* Shine Effect */}
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={cardState.isHovered ? { x: '100%' } : { x: '-100%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              )}
            </div>

            {/* Decorative Elements */}
            <div 
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full opacity-60"
              style={{ backgroundColor: feature.accentColor }}
            />
            <div 
              className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full opacity-40"
              style={{ backgroundColor: feature.accentColor }}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-4"
            animate="front"
            variants={variants.content as any}
          >
            {/* Title */}
            <motion.h3
              className="text-2xl font-bold text-white leading-tight"
              style={{
                background: feature.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {feature.title}
            </motion.h3>

            {/* Subtitle */}
            <motion.p className="text-lg text-white/90 font-medium">
              {feature.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p className="text-white/70 text-sm leading-relaxed">
              {feature.description}
            </motion.p>

            {/* Interactive Hint */}
            <motion.div
              className="flex items-center justify-center gap-2 text-xs text-white/50 mt-4"
              animate={cardState.isHovered ? { opacity: 1 } : { opacity: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <span>Click to learn more</span>
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                animate={cardState.isHovered && !shouldReduceMotion ? { x: 2 } : { x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </motion.svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Back Face */}
        <motion.div
          className={cn(
            'absolute inset-0 w-full h-full backface-hidden rotate-y-180',
            'rounded-2xl overflow-hidden',
            'bg-white/5 backdrop-blur-md',
            'border border-white/10',
            'flex flex-col justify-center',
            'p-6'
          )}
          style={{
            background: `linear-gradient(135deg, ${feature.gradient}20, rgba(255, 255, 255, 0.05))`,
            borderImage: `linear-gradient(135deg, ${feature.gradient}60, rgba(255, 255, 255, 0.2)) 1`,
          }}
        >
          <motion.div
            className="space-y-6"
            animate="back"
            variants={variants.content as any}
          >
            {/* Back Title */}
            <motion.h3
              className="text-xl font-bold text-white leading-tight"
              style={{
                background: feature.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {feature.title}
            </motion.h3>

            {/* Detailed Description */}
            <motion.p className="text-white/80 text-sm leading-relaxed">
              {feature.detailedDescription}
            </motion.p>

            {/* Feature Benefits */}
            <motion.div className="space-y-3">
              {feature.id === 'blind-chat' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Build attraction through conversation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Photos revealed after connection</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Focus on personality compatibility</span>
                  </div>
                </div>
              )}
              
              {feature.id === 'authentic-heart' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Verified user profiles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Advanced authenticity checks</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Real people, real connections</span>
                  </div>
                </div>
              )}
              
              {feature.id === 'no-swipe' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Curated matching system</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Quality over quantity approach</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Meaningful match suggestions</span>
                  </div>
                </div>
              )}
              
              {feature.id === 'personality' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Personality-first matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Showcase your unique traits</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Deep compatibility analysis</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Back to Front Hint */}
            <motion.div
              className="flex items-center justify-center gap-2 text-xs text-white/50 pt-2 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span>Click to go back</span>
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                animate={!shouldReduceMotion ? { rotate: 180 } : {}}
                transition={{ duration: 0.3 }}
              >
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </motion.svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Card Number Badge */}
        <motion.div
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/80"
          style={{
            background: `linear-gradient(135deg, ${feature.gradient}40, rgba(255, 255, 255, 0.1))`,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={cardState.hasEntered ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ 
            delay: entranceDelay / 1000 + 0.5, 
            duration: 0.5, 
            type: 'spring',
            stiffness: 200 
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FeatureCard;