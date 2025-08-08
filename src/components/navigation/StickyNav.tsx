'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface StickyNavProps {
  items?: NavItem[];
  className?: string;
  showProgress?: boolean;
  showScrollToTop?: boolean;
  hideOnScrollDown?: boolean;
  blurBackground?: boolean;
  threshold?: number; // Scroll position to show nav
}

const defaultNavItems: NavItem[] = [
  { id: 'hero', label: 'Home', href: '#hero' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'waitlist', label: 'Join', href: '#waitlist-form' },
  { id: 'social-proof', label: 'Community', href: '#social-proof' },
];

export const StickyNav: React.FC<StickyNavProps> = ({
  items = defaultNavItems,
  className,
  showProgress = true,
  showScrollToTop = true,
  hideOnScrollDown = true,
  blurBackground = true,
  threshold = 100,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();
  const lastScrollYRef = useRef(0);
  const ticking = useRef(false);
  const sectionsRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset;
        const direction = currentScrollY > lastScrollYRef.current ? 'down' : 'up';
        
        setScrollY(currentScrollY);
        setScrollDirection(direction);
        setIsVisible(currentScrollY > threshold);
        
        // Calculate scroll progress
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const progress = Math.min(currentScrollY / documentHeight, 1);
        setScrollProgress(progress);
        
        lastScrollYRef.current = currentScrollY;
        ticking.current = false;
      });
      
      ticking.current = true;
    }
  }, [threshold]);

  // Detect active section based on scroll position
  const updateActiveSection = useCallback(() => {
    if (sectionsRef.current) {
      clearTimeout(sectionsRef.current);
    }
    
    sectionsRef.current = setTimeout(() => {
      const sections = items.map(item => {
        const element = document.querySelector(item.href);
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            id: item.id,
            top: rect.top,
            bottom: rect.bottom,
          };
        }
        return null;
      }).filter(Boolean);

      // Find the section that's most in view
      const viewportCenter = window.innerHeight / 2;
      let closestSection = '';
      let closestDistance = Infinity;

      sections.forEach(section => {
        if (section) {
          const distance = Math.abs(section.top - viewportCenter);
          if (distance < closestDistance && section.top < viewportCenter) {
            closestDistance = distance;
            closestSection = section.id;
          }
        }
      });

      if (closestSection !== activeSection) {
        setActiveSection(closestSection);
      }
    }, 100);
  }, [items, activeSection]);

  // Setup scroll listeners
  useEffect(() => {
    handleScroll(); // Initial call
    updateActiveSection(); // Initial call
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      
      if (sectionsRef.current) {
        clearTimeout(sectionsRef.current);
      }
    };
  }, [handleScroll, updateActiveSection]);

  // Smooth scroll to section
  const scrollToSection = useCallback((href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMobileMenuOpen(false);
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Determine if nav should be shown
  const shouldShow = isVisible && (!hideOnScrollDown || scrollDirection === 'up' || scrollY < threshold);

  const navVariants: any = {
    hidden: {
      y: -100,
      opacity: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : 0.3,
            ease: 'easeInOut' as const,
          },
    },
    visible: {
      y: 0,
      opacity: 1,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.3,
          ease: 'easeOut' as const,
        },
    },
  };

  const mobileMenuVariants: any = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: 'easeInOut' as const,
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const progressBarVariants = {
    initial: { scaleX: 0 },
    animate: { scaleX: scrollProgress },
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.nav
          className={cn(
            'fixed top-0 left-0 right-0 z-50',
            blurBackground && 'backdrop-blur-md',
            className
          )}
          variants={navVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{
            background: blurBackground 
              ? 'rgba(10, 10, 10, 0.8)' 
              : 'rgba(10, 10, 10, 0.95)',
          }}
        >
          {/* Progress Bar */}
          {showProgress && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-primary-blue origin-left"
              variants={progressBarVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: shouldReduceMotion ? 0 : 0.1, ease: 'linear' }}
              style={{ width: '100%' }}
            />
          )}

          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <motion.div
                className="flex items-center gap-2"
                variants={itemVariants}
              >
                <div className="text-xl font-bold gradient-text">
                  Unmask.life
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className={cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors duration-200',
                      'hover:text-white focus:outline-none focus:text-white',
                      activeSection === item.id
                        ? 'text-white'
                        : 'text-text-secondary'
                    )}
                    onClick={() => scrollToSection(item.href)}
                    variants={itemVariants}
                    transition={{ delay: shouldReduceMotion ? 0 : index * 0.1 }}
                    whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                    whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && (
                        <span className="text-accent">{item.icon}</span>
                      )}
                      {item.label}
                    </div>

                    {/* Active Indicator */}
                    {activeSection === item.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                        layoutId="activeIndicator"
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.3,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </motion.button>
                ))}

                {/* Scroll to Top Button */}
                {showScrollToTop && scrollY > threshold * 2 && (
                  <motion.button
                    className={cn(
                      'ml-4 p-2 rounded-full bg-accent/20 text-accent',
                      'hover:bg-accent/30 hover:scale-110 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-accent/50'
                    )}
                    onClick={scrollToTop}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={!shouldReduceMotion ? { scale: 1.1 } : {}}
                    whileTap={!shouldReduceMotion ? { scale: 0.9 } : {}}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className={cn(
                  'md:hidden p-2 rounded-lg text-white',
                  'hover:bg-white/10 focus:outline-none focus:bg-white/10'
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variants={itemVariants}
                whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  className="md:hidden border-t border-white/10 overflow-hidden"
                  variants={mobileMenuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <div className="py-4 space-y-2">
                    {items.map((item, index) => (
                      <motion.button
                        key={item.id}
                        className={cn(
                          'block w-full text-left px-4 py-3 rounded-lg',
                          'hover:bg-white/5 focus:outline-none focus:bg-white/5',
                          'transition-colors duration-200',
                          activeSection === item.id
                            ? 'text-white bg-white/5'
                            : 'text-text-secondary'
                        )}
                        onClick={() => scrollToSection(item.href)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: shouldReduceMotion ? 0 : index * 0.1,
                          duration: shouldReduceMotion ? 0 : 0.2,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <span className="text-accent">{item.icon}</span>
                          )}
                          {item.label}
                        </div>
                      </motion.button>
                    ))}

                    {/* Mobile Scroll to Top */}
                    {showScrollToTop && scrollY > threshold * 2 && (
                      <motion.button
                        className={cn(
                          'flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg',
                          'text-accent hover:bg-accent/10 focus:outline-none focus:bg-accent/10',
                          'transition-colors duration-200'
                        )}
                        onClick={scrollToTop}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: shouldReduceMotion ? 0 : items.length * 0.1,
                          duration: shouldReduceMotion ? 0 : 0.2,
                        }}
                      >
                        <ArrowUp className="w-4 h-4" />
                        Back to Top
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default StickyNav;