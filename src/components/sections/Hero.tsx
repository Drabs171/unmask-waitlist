'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MobileButton from '@/components/ui/MobileButton';
import ShareButton from '@/components/ui/ShareButton';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { 
  FadeIn, 
  TypewriterText, 
  UnmaskLogo, 
  FloatingHearts, 
  ParallaxBackground,
  MaskAnimation
} from '@/components/animations';
import { ArrowRight, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeroProps {
  onJoinWaitlist: () => void;
}

const Hero: React.FC<HeroProps> = ({ onJoinWaitlist }) => {
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { isMobile, isTablet, viewportHeight } = useMobileDetection();

  const handleTypewriterComplete = () => {
    setTypewriterComplete(true);
  };

  const handleJoinWaitlist = () => {
    // Add a subtle vibration effect on mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onJoinWaitlist();
  };

  return (
    <section 
      className="relative flex items-center justify-center px-4 overflow-hidden"
      style={{
        minHeight: isMobile ? viewportHeight : '100vh',
        paddingTop: isMobile ? '60px' : '0', // Account for mobile navigation
      }}
    >
      {/* Parallax Background with Floating Orbs */}
      <ParallaxBackground className="z-0" />

      {/* Floating Hearts */}
      <FloatingHearts 
        count={shouldReduceMotion ? 3 : 8}
        mouseInteraction={!shouldReduceMotion}
        className="z-5"
      />

      {/* Main Content */}
      <div className={cn(
        "relative z-20 mx-auto text-center",
        isMobile ? "max-w-sm px-2" : "max-w-5xl"
      )}>
        {/* Unmask Logo */}
        <FadeIn delay={0.2} triggerOnMount={true}>
          <motion.div
            className={cn(
              isMobile ? "mb-mobile-md" : "mb-8 md:mb-12"
            )}
            onHoverStart={() => setLogoHovered(true)}
            onHoverEnd={() => setLogoHovered(false)}
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
            onTapStart={() => isMobile && setLogoHovered(true)}
            onTap={() => isMobile && setTimeout(() => setLogoHovered(false), 200)}
          >
            <UnmaskLogo 
              size={isMobile ? "lg" : "xl"} 
              className={isMobile ? "mb-mobile-sm" : "mb-4"}
              enableHoverEffects={!shouldReduceMotion}
            />

            {/* Mask Animation underneath the logo */}
            <MaskAnimation
              size={isMobile ? "md" : "lg"}
              delay={0.8}
              enableGlow={!shouldReduceMotion}
              className={isMobile ? "mt-2 mb-mobile-md" : "mt-4 mb-8"}
            />
            
            {/* Glowing Particles on Logo Hover */}
            {logoHovered && !shouldReduceMotion && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-accent rounded-full"
                    initial={{ 
                      opacity: 0,
                      x: 0,
                      y: 0,
                      scale: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: Math.cos((i * Math.PI) / 3) * 80,
                      y: Math.sin((i * Math.PI) / 3) * 80,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: 'easeOut',
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </FadeIn>

        {/* Animated Tagline */}
        <FadeIn delay={0.8} triggerOnMount={true}>
          <div className={cn(
            isMobile ? "mb-mobile-lg" : "mb-8 md:mb-12"
          )}>
            <TypewriterText
              text={isMobile 
                ? "Discover real connections. No filters. No facades." 
                : "Discover who they really are. No filters. No facades. Just real connections."
              }
              className={cn(
                "text-white mx-auto leading-relaxed font-bold tracking-wide",
                isMobile 
                  ? "text-mobile-body max-w-xs" 
                  : "text-lg md:text-xl lg:text-2xl max-w-3xl"
              )}
              typeSpeed={isMobile ? 25 : 20}
              startDelay={200}
              onComplete={handleTypewriterComplete}
              glowOnComplete={!shouldReduceMotion}
            />
          </div>
        </FadeIn>

        {/* CTA Section with Enhanced Animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: typewriterComplete ? 1 : 0,
            y: typewriterComplete ? 0 : 20,
          }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={cn(
            isMobile ? "mb-mobile-lg" : "mb-12"
          )}
        >
          <div className={cn(
            "flex items-center justify-center",
            isMobile ? "flex-col gap-4" : "flex-col sm:flex-row gap-6"
          )}>
            {/* Enhanced CTA Button */}
            <MobileButton
              variant="gradient"
              size={isMobile ? "xl" : "lg"}
              onClick={handleJoinWaitlist}
              touchOptimized={isMobile || isTablet}
              hapticFeedback={true}
              rippleEffect={true}
              magneticStrength={isMobile ? 0.2 : 0.4}
              glowIntensity="high"
              fullWidth={isMobile}
              className={cn(
                "font-bold relative overflow-hidden",
                isMobile 
                  ? "text-mobile-subtitle px-8 py-4" 
                  : "text-lg px-10 py-5 min-w-[240px]"
              )}
            >
              <span className="relative z-10 flex items-center">
                Join the Revolution
                <motion.div
                  animate={{ x: logoHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className={cn(
                    "transition-transform",
                    isMobile ? "ml-2 w-5 h-5" : "ml-3 w-5 h-5 group-hover:translate-x-1"
                  )} />
                </motion.div>
              </span>
            </MobileButton>

            {/* Feature Highlights */}
            {!isMobile && (
              <div className="flex items-center gap-4 text-text-secondary text-sm">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                  whileHover={{ 
                    scale: shouldReduceMotion ? 1 : 1.05,
                    backgroundColor: shouldReduceMotion ? undefined : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Heart className="w-4 h-4 text-accent" />
                  <span>No swiping</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                  whileHover={{ 
                    scale: shouldReduceMotion ? 1 : 1.05,
                    backgroundColor: shouldReduceMotion ? undefined : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <MessageCircle className="w-4 h-4 text-primary-blue" />
                  <span>Real conversations</span>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: typewriterComplete ? 1 : 0,
          }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className={cn(
            "inline-flex items-center rounded-full bg-white/5 backdrop-blur-md border border-white/10",
            isMobile 
              ? "gap-2 px-4 py-2 flex-wrap justify-center" 
              : "gap-3 px-6 py-3"
          )}>
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className={cn(
              "text-text-secondary",
              isMobile ? "text-mobile-caption" : "text-sm"
            )}>
              {isMobile ? (
                <>
                  <span className="text-white font-semibold">2,847+</span> supporters
                </>
              ) : (
                <>
                  Join <span className="text-white font-semibold">2,847+</span> early supporters
                </>
              )}
            </span>
            {!isMobile && (
              <div className="flex -space-x-1 ml-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: typewriterComplete ? 0.8 + i * 0.1 : 0,
                      duration: 0.4,
                    }}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-primary-blue border border-white/20 flex items-center justify-center text-xs font-semibold"
                  >
                    {String.fromCharCode(65 + i)}
                  </motion.div>
                ))}
              </div>
            )}
            {isMobile && (
              <ShareButton 
                variant="ghost" 
                size="sm" 
                showLabel={false}
                className="ml-auto opacity-60"
              />
            )}
          </div>
        </motion.div>



        {/* Scroll Indicator */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: typewriterComplete ? 0.6 : 0,
              y: typewriterComplete ? 0 : 20,
            }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-text-secondary text-xs flex flex-col items-center gap-2"
            >
              <span>Scroll to explore</span>
              <div className="w-0.5 h-8 bg-gradient-to-b from-accent to-transparent rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Ambient Light Effects */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-blue/5 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </>
      )}
    </section>
  );
};

export default Hero;