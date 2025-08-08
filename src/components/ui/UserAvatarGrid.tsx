'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UserAvatar {
  id: string;
  initials: string;
  color: string;
  isOnline?: boolean;
  joinedRecently?: boolean;
}

interface UserAvatarGridProps {
  className?: string;
  maxVisible?: number;
  showOnlineStatus?: boolean;
  showCounter?: boolean;
  totalUsers?: number;
  autoShuffle?: boolean;
  shuffleInterval?: number;
  blurLevel?: 'light' | 'medium' | 'heavy';
}

// Generate diverse user avatars with privacy-focused initials
const generateUserAvatars = (count: number): UserAvatar[] => {
  const names = [
    'AS', 'BM', 'CL', 'DK', 'EJ', 'FR', 'GH', 'IW', 'JT', 'KN',
    'LM', 'NP', 'OC', 'PR', 'QS', 'RT', 'SV', 'TY', 'UV', 'WX',
    'YZ', 'AB', 'CD', 'EF', 'GI', 'HK', 'JL', 'MO', 'PQ', 'ST'
  ];

  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-teal-500 to-green-500',
    'from-rose-500 to-pink-500',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `user-${index}`,
    initials: names[index % names.length],
    color: colors[index % colors.length],
    isOnline: Math.random() > 0.3, // 70% online
    joinedRecently: index < 5 && Math.random() > 0.6, // Some recent joiners
  }));
};

const UserAvatarGrid: React.FC<UserAvatarGridProps> = ({
  className,
  maxVisible = 8,
  showOnlineStatus = true,
  showCounter = false,
  totalUsers = 0,
  autoShuffle = false,
  shuffleInterval = 12000, // 12 seconds
  blurLevel = 'medium',
}) => {
  const [visibleAvatars, setVisibleAvatars] = useState<UserAvatar[]>([]);
  const [allAvatars] = useState<UserAvatar[]>(() => []);
  const [shuffleKey, setShuffleKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Auto-shuffle avatars to show activity
  useEffect(() => {
    // No mock avatars in production-ready state
    setVisibleAvatars([]);

    if (!autoShuffle || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setShuffleKey(prev => prev + 1);
      
      // Create a new random selection
      setVisibleAvatars([]);
    }, shuffleInterval);

    return () => clearInterval(interval);
  }, [allAvatars, maxVisible, autoShuffle, shuffleInterval, shouldReduceMotion]);

  // Get blur class based on level
  const getBlurClass = (level: string): string => {
    switch (level) {
      case 'light': return 'blur-[2px]';
      case 'heavy': return 'blur-md';
      default: return 'blur-sm';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const avatarVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        duration: shouldReduceMotion ? 0.1 : 0.6,
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: shouldReduceMotion ? 1 : 1.1,
      z: 10,
      filter: shouldReduceMotion ? 'blur(2px)' : 'blur(1px)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
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
          <Users className="w-4 h-4 text-accent" />
          <span className="text-sm text-text-secondary font-medium">
            Community Members
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">
          Join {totalUsers.toLocaleString()}+ Others
        </h3>
        <p className="text-text-secondary text-sm">
          Real people building authentic connections
        </p>
      </motion.div>

      {/* Avatar Grid */}
      <motion.div
        key={shuffleKey}
        className="relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {/* Main Grid */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-md mx-auto">
          {visibleAvatars.slice(0, maxVisible - 1).map((avatar, index) => (
            <motion.div
              key={`${avatar.id}-${shuffleKey}`}
              className="relative group cursor-pointer"
              variants={avatarVariants}
              whileHover={!shouldReduceMotion ? 'hover' : {}}
              animate={avatar.joinedRecently && !shouldReduceMotion ? 'pulse' : ''}
            >
              <motion.div
                className={cn(
                  'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm relative',
                  `bg-gradient-to-br ${avatar.color}`,
                  getBlurClass(blurLevel),
                  'border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300'
                )}
                variants={hoverVariants}
                style={{ zIndex: index }}
              >
                {avatar.initials}

                {/* Online Status Indicator */}
                {showOnlineStatus && avatar.isOnline && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className="w-full h-full bg-success rounded-full"
                      animate={!shouldReduceMotion ? {
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}

                {/* Recently Joined Badge */}
                {avatar.joinedRecently && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
                  >
                    <Plus className="w-2 h-2 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Hover Tooltip */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none z-20"
                transition={{ duration: 0.2 }}
              >
                <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap">
                  {avatar.isOnline ? 'Online now' : 'Recently active'}
                  
                  {/* Arrow */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-black/80" />
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Counter Avatar */}
          {showCounter && (
            <motion.div
              className="relative"
              variants={avatarVariants}
            >
              <motion.div
                className={cn(
                  'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
                  'bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/30',
                  'backdrop-blur-md text-white font-bold text-xs',
                  getBlurClass(blurLevel)
                )}
                whileHover={!shouldReduceMotion ? {
                  scale: 1.05,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                } : {}}
              >
                +{(totalUsers - maxVisible + 1).toLocaleString().replace(',', '')}
              </motion.div>

              {/* Pulsing Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-accent/50 pointer-events-none"
                animate={!shouldReduceMotion ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0, 1],
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          )}
        </div>

        {/* Activity Indicator */}
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <motion.div
              className="w-1.5 h-1.5 bg-success rounded-full"
              animate={!shouldReduceMotion ? {
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>
              {Math.floor(Math.random() * 5) + 8} people joined in the last hour
            </span>
          </div>
        </motion.div>

        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 -m-8 rounded-3xl opacity-20 pointer-events-none blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 157, 0.15), rgba(78, 205, 196, 0.15), transparent 70%)',
          }}
          animate={!shouldReduceMotion ? {
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.3, 0.1],
          } : {}}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
          <span className="text-xs text-text-secondary">
            Identities protected • Privacy first
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default UserAvatarGrid;