'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TestimonialData {
  id: string;
  name: string;
  location: string;
  text: string;
  avatar: string;
  rating: number;
  verified: boolean;
}

interface FloatingTestimonialProps {
  testimonials?: TestimonialData[];
  autoPlay?: boolean;
  playInterval?: number;
  className?: string;
  showRating?: boolean;
  blurAvatars?: boolean;
}

const defaultTestimonials: TestimonialData[] = [];

const FloatingTestimonial: React.FC<FloatingTestimonialProps> = ({
  testimonials = defaultTestimonials,
  autoPlay = true,
  playInterval = 8000,
  className,
  showRating = true,
  blurAvatars = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState([0, 1, 2]);
  const shouldReduceMotion = useReducedMotion();

  // Auto-advance testimonials
  useEffect(() => {
    if (!autoPlay || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % testimonials.length;
        // Update visible testimonials for cycling display
        setVisibleTestimonials([
          next,
          (next + 1) % testimonials.length,
          (next + 2) % testimonials.length,
        ]);
        return next;
      });
    }, playInterval);

    return () => clearInterval(interval);
  }, [autoPlay, playInterval, testimonials.length, shouldReduceMotion]);

  // Get slide direction based on index (alternating)
  const getSlideDirection = (index: number): 'left' | 'right' => {
    return index % 2 === 0 ? 'left' : 'right';
  };

  // Animation variants for different slide directions
  const slideVariants: any = {
    hiddenLeft: {
      x: -300,
      opacity: 0,
      scale: 0.8,
    },
    hiddenRight: {
      x: 300,
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.6,
        ease: 'easeOut' as const,
      },
    },
    exitLeft: {
      x: -300,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.4,
        ease: 'easeIn',
      },
    },
    exitRight: {
      x: 300,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.4,
        ease: 'easeIn',
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-8, 8, -8],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const hoverVariants = {
    hover: {
      y: -12,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(255, 107, 157, 0.15), 0 0 60px rgba(78, 205, 196, 0.1)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  // Avatar colors based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={cn('relative', className)}>
      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {visibleTestimonials.map((testimonialIndex, displayIndex) => {
            const testimonial = testimonials[testimonialIndex];
            const direction = getSlideDirection(displayIndex);
            
            return (
              <motion.div
                key={testimonial.id}
                className="relative"
                initial={direction === 'left' ? 'hiddenLeft' : 'hiddenRight'}
                animate="visible"
                exit={direction === 'left' ? 'exitLeft' : 'exitRight'}
                variants={slideVariants}
                whileHover={!shouldReduceMotion ? 'hover' : {}}
                style={{ originY: 0.5 }}
              >
                <motion.div
                  variants={shouldReduceMotion ? {} : floatingVariants}
                  animate={shouldReduceMotion ? {} : 'float'}
                  style={{ animationDelay: `${displayIndex * 2}s` }}
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    showRating={showRating}
                    blurAvatars={blurAvatars}
                    variants={hoverVariants}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mobile/Tablet Layout - Single Column */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonials[currentIndex].id}
            initial={getSlideDirection(currentIndex) === 'left' ? 'hiddenLeft' : 'hiddenRight'}
            animate="visible"
            exit={getSlideDirection(currentIndex) === 'left' ? 'exitLeft' : 'exitRight'}
            variants={slideVariants}
            className="max-w-md mx-auto"
          >
            <TestimonialCard
              testimonial={testimonials[currentIndex]}
              showRating={showRating}
              blurAvatars={blurAvatars}
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex ? 'bg-accent scale-125' : 'bg-white/30 hover:bg-white/50'
              )}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual testimonial card component
const TestimonialCard: React.FC<{
  testimonial: TestimonialData;
  showRating: boolean;
  blurAvatars: boolean;
  variants?: any;
}> = ({ testimonial, showRating, blurAvatars, variants }) => {
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 h-full"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      variants={variants}
    >
      {/* Quote Icon */}
      <div className="absolute top-4 left-4 text-accent/30">
        <Quote className="w-8 h-8" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Avatar and Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <motion.div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                `bg-gradient-to-br ${getAvatarColor(testimonial.name)}`,
                blurAvatars && 'blur-sm'
              )}
              whileHover={blurAvatars ? { filter: 'blur(2px)' } : {}}
              transition={{ duration: 0.3 }}
            >
              {testimonial.avatar}
            </motion.div>
            
            {/* Verified Badge */}
            {testimonial.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{testimonial.name}</h4>
              <span className="text-xs text-text-secondary">• {testimonial.location}</span>
            </div>
            
            {/* Rating */}
            {showRating && (
              <div className="flex items-center gap-1 mt-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <Star className="w-3 h-3 text-accent fill-current" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Testimonial Text */}
        <blockquote className="text-text-secondary text-sm leading-relaxed italic">
          &ldquo;{testimonial.text}&rdquo;
        </blockquote>
      </div>

      {/* Background Gradient */}
      <div
        className="absolute inset-0 opacity-5 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${getAvatarColor(testimonial.name).replace('from-', '').replace('to-', '').split(' ')[0]}, transparent)`,
        }}
      />

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(78, 205, 196, 0.1))',
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default FloatingTestimonial;