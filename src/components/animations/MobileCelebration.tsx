'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Heart, Sparkles, Star, MessageCircle, Shield } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import ShareButton from '@/components/ui/ShareButton';
import MobileButton from '@/components/ui/MobileButton';

interface MobileCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  userCount?: number;
  className?: string;
}

const MobileCelebration: React.FC<MobileCelebrationProps> = ({
  isVisible,
  onClose,
  userCount = 2847,
  className,
}) => {
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'celebration' | 'content' | 'exit'>('entrance');
  const [particleCount, setParticleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const shouldReduceMotion = useReducedMotion();
  const { isMobile, viewportHeight, safeAreaInsets } = useMobileDetection();

  // Animation sequence
  useEffect(() => {
    if (!isVisible) return;

    const sequence = [
      () => setAnimationPhase('entrance'),
      () => setTimeout(() => setAnimationPhase('celebration'), 300),
      () => setTimeout(() => setAnimationPhase('content'), 1200),
    ];

    sequence.forEach(fn => fn());

    // Haptic feedback sequence
    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    return () => {
      setAnimationPhase('entrance');
    };
  }, [isVisible, isMobile]);

  // Particle animation
  useEffect(() => {
    if (animationPhase === 'celebration' && !shouldReduceMotion) {
      const interval = setInterval(() => {
        setParticleCount(prev => (prev + 1) % 20);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [animationPhase, shouldReduceMotion]);

  const handleClose = () => {
    setAnimationPhase('exit');
    setTimeout(onClose, 300);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  if (!isVisible) return null;

  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    icon: [Heart, Sparkles, Star, MessageCircle][i % 4],
    delay: i * 0.1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    rotation: Math.random() * 360,
    color: ['text-accent', 'text-primary-blue', 'text-yellow-400', 'text-green-400'][i % 4],
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden',
            'bg-gradient-to-br from-background via-background to-accent/20',
            className
          )}
          style={{
            paddingTop: safeAreaInsets.top,
            paddingBottom: safeAreaInsets.bottom,
            paddingLeft: safeAreaInsets.left,
            paddingRight: safeAreaInsets.right,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Effects */}
          {!shouldReduceMotion && (
            <>
              {/* Radial Gradient Pulses */}
              <motion.div
                className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-primary-blue/10 rounded-full blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />

              {/* Floating Particles */}
              {animationPhase === 'celebration' && particles.map((particle) => {
                const IconComponent = particle.icon;
                return (
                  <motion.div
                    key={particle.id}
                    className={`absolute ${particle.color}`}
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      fontSize: `${particle.size}px`,
                    }}
                    initial={{ 
                      scale: 0, 
                      opacity: 0,
                      rotate: 0,
                    }}
                    animate={{ 
                      scale: [0, 1.5, 1],
                      opacity: [0, 1, 0],
                      rotate: [0, particle.rotation, particle.rotation + 180],
                      y: [-20, -100, -200],
                    }}
                    transition={{
                      duration: 2,
                      delay: particle.delay,
                      ease: 'easeOut',
                    }}
                  >
                    <IconComponent className="w-full h-full" />
                  </motion.div>
                );
              })}
            </>
          )}

          {/* Main Content */}
          <div className="relative z-10 text-center px-6 max-w-sm mx-auto">
            {/* Heart Icon with Pulse */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0, rotate: -45 }}
              animate={animationPhase === 'entrance' ? {
                scale: 1,
                rotate: 0,
              } : animationPhase === 'celebration' ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{
                duration: animationPhase === 'celebration' ? 0.6 : 0.5,
                ease: 'easeOut',
                repeat: animationPhase === 'celebration' ? 3 : 0,
              }}
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-accent to-primary-blue rounded-full flex items-center justify-center mx-auto shadow-glow-brand">
                  <Heart className="w-12 h-12 text-white fill-current" />
                </div>
                
                {/* Pulsing Rings */}
                {!shouldReduceMotion && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      animate={{
                        scale: [1, 2, 3],
                        opacity: [0.8, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary-blue"
                      animate={{
                        scale: [1, 1.8, 2.5],
                        opacity: [0.6, 0.2, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: 0.5,
                      }}
                    />
                  </>
                )}
              </div>
            </motion.div>

            {/* Success Message */}
            <AnimatePresence mode="wait">
              {animationPhase === 'content' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <div className="space-y-3">
                    <motion.h1
                      className="text-mobile-hero font-bold gradient-text"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      Welcome Aboard! 🎉
                    </motion.h1>
                    
                    <motion.p
                      className="text-mobile-body text-text-secondary leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      You're now part of the <span className="text-accent font-semibold">Unmask</span> revolution! 
                      We'll notify you when authentic dating goes live.
                    </motion.p>
                  </div>

                  {/* Stats */}
                  <motion.div
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Sparkles className="w-6 h-6 text-accent" />
                      <span className="text-mobile-title font-bold text-white">
                        #{userCount.toLocaleString()}
                      </span>
                      <Sparkles className="w-6 h-6 text-primary-blue" />
                    </div>
                    <p className="text-mobile-caption text-text-secondary">
                      Early supporters strong and growing!
                    </p>
                  </motion.div>

                  {/* Benefits */}
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-mobile-subtitle font-semibold text-white mb-4">
                      What's next?
                    </h3>
                    <div className="space-y-3 text-left">
                      {[
                        { icon: MessageCircle, text: 'Early access to beta features' },
                        { icon: Shield, text: 'Priority safety & privacy updates' },
                        { icon: Heart, text: 'Exclusive community perks' },
                      ].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div
                            key={index}
                            className="flex items-center gap-3 text-mobile-caption text-text-secondary"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-4 h-4 text-accent" />
                            </div>
                            <span>{item.text}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    className="space-y-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {/* Share Button */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                          <h4 className="text-mobile-caption font-semibold text-white">
                            Share & Move Up
                          </h4>
                          <p className="text-xs text-text-secondary">
                            Get priority access
                          </p>
                        </div>
                        <ShareButton
                          variant="secondary"
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    </div>

                    {/* Close Button */}
                    <MobileButton
                      variant="ghost"
                      size="lg"
                      fullWidth
                      onClick={handleClose}
                      className="border-white/20"
                    >
                      Continue Exploring
                    </MobileButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCelebration;