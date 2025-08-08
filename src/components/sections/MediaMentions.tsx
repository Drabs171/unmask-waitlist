'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface MediaMention {
  id: string;
  name: string;
  quote: string;
  logo: string; // Could be text or icon identifier
  url?: string;
  featured?: boolean;
}

interface MediaMentionsProps {
  className?: string;
  autoScroll?: boolean;
  scrollSpeed?: number;
}

const mediaMentions: MediaMention[] = [
  {
    id: '1',
    name: 'TechCrunch',
    quote: 'Revolutionary approach to digital dating',
    logo: 'TC',
    featured: true,
  },
  {
    id: '2',
    name: 'Product Hunt',
    quote: '#1 Product of the Day',
    logo: 'PH',
    featured: true,
  },
  {
    id: '3',
    name: 'Mashable',
    quote: 'Finally, an app that gets it right',
    logo: 'M',
    featured: false,
  },
  {
    id: '4',
    name: 'The Verge',
    quote: 'The future of authentic connections',
    logo: 'TV',
    featured: true,
  },
  {
    id: '5',
    name: 'Wired',
    quote: 'Dating without the superficiality',
    logo: 'W',
    featured: false,
  },
  {
    id: '6',
    name: 'Fast Company',
    quote: 'Innovative approach to modern romance',
    logo: 'FC',
    featured: false,
  },
  {
    id: '7',
    name: 'Forbes',
    quote: 'A game-changer for GenZ dating',
    logo: 'F',
    featured: true,
  },
  {
    id: '8',
    name: 'VentureBeat',
    quote: 'Personality-first matching system',
    logo: 'VB',
    featured: false,
  },
];

const MediaMentions: React.FC<MediaMentionsProps> = ({
  className,
  autoScroll = true,
  scrollSpeed = 30,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Double the mentions for seamless scroll
  const duplicatedMentions = [...mediaMentions, ...mediaMentions];

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const logoHoverVariants: any = {
    hover: {
      scale: shouldReduceMotion ? 1 : 1.1,
      filter: shouldReduceMotion ? 'brightness(1)' : 'brightness(1.2)',
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  // Get logo styling based on media outlet
  const getLogoStyle = (mention: MediaMention) => {
    const baseStyle = 'h-8 flex items-center justify-center px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300';
    
    switch (mention.name.toLowerCase()) {
      case 'techcrunch':
        return cn(baseStyle, 'bg-green-500/20 text-green-400 border border-green-500/30');
      case 'product hunt':
        return cn(baseStyle, 'bg-orange-500/20 text-orange-400 border border-orange-500/30');
      case 'the verge':
        return cn(baseStyle, 'bg-purple-500/20 text-purple-400 border border-purple-500/30');
      case 'wired':
        return cn(baseStyle, 'bg-red-500/20 text-red-400 border border-red-500/30');
      case 'forbes':
        return cn(baseStyle, 'bg-blue-500/20 text-blue-400 border border-blue-500/30');
      default:
        return cn(baseStyle, 'bg-white/10 text-white border border-white/20');
    }
  };

  return (
    <section className={cn('py-12 overflow-hidden', className)}>
      {/* Section Header */}
      <motion.div
        className="text-center mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4"
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
            Featured In
          </span>
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          As Seen On
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto"
        >
          Leading tech publications are talking about the future of authentic dating
        </motion.p>
      </motion.div>

      {/* Scrolling Media Mentions */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling Container */}
        <motion.div
          className="flex gap-6 items-center"
          animate={autoScroll && !shouldReduceMotion ? {
            x: [0, -50 * mediaMentions.length],
          } : {}}
          transition={{
            duration: scrollSpeed,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ width: `${duplicatedMentions.length * 200}px` }}
        >
          {duplicatedMentions.map((mention, index) => (
            <motion.div
              key={`${mention.id}-${index}`}
              className="flex-shrink-0 group cursor-pointer"
              onHoverStart={() => setHoveredItem(mention.id)}
              onHoverEnd={() => setHoveredItem(null)}
              whileHover="hover"
              variants={logoHoverVariants}
            >
              {/* Media Logo/Badge */}
              <div className={getLogoStyle(mention)}>
                {mention.logo}
              </div>

              {/* Hover Quote Tooltip */}
              {hoveredItem === mention.id && !shouldReduceMotion && (
                <motion.div
                  className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-20 w-64"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center shadow-2xl">
                    <p className="text-white text-sm font-medium mb-1">
                      {mention.name}
                    </p>
                    <blockquote className="text-text-secondary text-xs italic">
                      &ldquo;{mention.quote}&rdquo;
                    </blockquote>
                    
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white/20" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Featured Quotes Section */}
      <motion.div
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        {mediaMentions
          .filter(mention => mention.featured)
          .slice(0, 3)
          .map((mention, index) => (
            <motion.div
              key={mention.id}
              variants={itemVariants}
              className="relative overflow-hidden rounded-xl p-6 group"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={!shouldReduceMotion ? {
                scale: 1.02,
                y: -4,
              } : {}}
              transition={{ duration: 0.3 }}
            >
              {/* Quote */}
              <blockquote className="text-white text-sm md:text-base font-medium mb-4 leading-relaxed">
                &ldquo;{mention.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div className={cn(getLogoStyle(mention), 'h-6 text-xs')}>
                  {mention.logo}
                </div>
                <span className="text-text-secondary text-sm font-medium">
                  {mention.name}
                </span>
              </div>

              {/* Hover Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.05), rgba(78, 205, 196, 0.05))',
                }}
              />

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 text-accent/20 text-3xl font-serif">
                &ldquo;
              </div>
              <div className="absolute bottom-4 left-4 text-accent/20 text-3xl font-serif rotate-180">
                &rdquo;
              </div>
            </motion.div>
          ))}
      </motion.div>

      {/* Bottom Stats */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-white/5 border border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{mediaMentions.length}+</div>
            <div className="text-xs text-text-secondary">Media Mentions</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-blue">50K+</div>
            <div className="text-xs text-text-secondary">Social Reach</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-success">Top 10</div>
            <div className="text-xs text-text-secondary">Dating Apps</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default MediaMentions;