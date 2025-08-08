'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Menu, X, Heart, MessageCircle, Shield, Sparkles, ArrowUp } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import ShareButton from '@/components/ui/ShareButton';
import MobileButton from '@/components/ui/MobileButton';

interface MobileNavigationProps {
  onJoinWaitlist: () => void;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onJoinWaitlist,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { isMobile, viewportHeight, safeAreaInsets } = useMobileDetection();
  const shouldReduceMotion = useReducedMotion();

  // Track scroll position for navigation states
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      setShowScrollTop(scrollY > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewportHeight]);

  // Handle menu toggle with haptic feedback
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  // Handle navigation item click
  const handleNavClick = (action: () => void) => {
    action();
    setIsOpen(false);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const navItems = [
    {
      id: 'features',
      label: 'Features',
      icon: Sparkles,
      action: () => scrollToSection('features'),
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      icon: MessageCircle,
      action: () => scrollToSection('how-it-works'),
    },
    {
      id: 'safety',
      label: 'Safety',
      icon: Shield,
      action: () => scrollToSection('safety'),
    },
    {
      id: 'community',
      label: 'Community',
      icon: Heart,
      action: () => scrollToSection('community'),
    },
  ];

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <motion.div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-transparent',
          className
        )}
        style={{
          paddingTop: safeAreaInsets.top,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <motion.div
            className="text-xl font-bold gradient-text"
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToTop()}
          >
            Unmask
          </motion.div>

          {/* Menu Button */}
          <motion.button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white touch-manipulation"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Bottom Sheet Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/20 rounded-t-3xl"
              style={{
                paddingBottom: Math.max(safeAreaInsets.bottom, 16),
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Menu Content */}
              <div className="px-6 pb-6">
                {/* Primary Action */}
                <div className="mb-6">
                  <MobileButton
                    variant="gradient"
                    size="lg"
                    fullWidth
                    onClick={() => handleNavClick(onJoinWaitlist)}
                    className="text-lg font-bold"
                  >
                    <Heart className="w-6 h-6" />
                    Join the Revolution
                  </MobileButton>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2 mb-6">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                        onClick={() => handleNavClick(item.action)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-lg font-medium text-white">
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Share Section */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Share Unmask
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Help spread the word
                      </p>
                    </div>
                    <ShareButton
                      variant="secondary"
                      size="md"
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* App Info */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-text-secondary">
                    Built for GenZ • Mobile-First • Privacy-Focused
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && !isOpen && (
          <motion.button
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-accent to-primary-blue rounded-full flex items-center justify-center shadow-glow-brand touch-manipulation"
            style={{
              bottom: Math.max(safeAreaInsets.bottom + 24, 24),
              right: 24,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowUp className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navigation */}
      <div 
        style={{ 
          height: 60 + safeAreaInsets.top 
        }} 
      />
    </>
  );
};

export default MobileNavigation;