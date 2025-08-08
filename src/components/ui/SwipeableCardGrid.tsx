'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMobileDetection, useMobileGestures } from '@/hooks/useMobileDetection';
import { useFeatureCardTracking } from '@/hooks/useAnalytics';

interface SwipeableCard {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  badge?: string;
  color?: string;
  [key: string]: any;
}

interface SwipeableCardGridProps {
  cards: SwipeableCard[];
  className?: string;
  cardClassName?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onCardSelect?: (card: SwipeableCard, index: number) => void;
  renderCard?: (card: SwipeableCard, index: number) => React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  hapticFeedback?: boolean;
  infiniteScroll?: boolean;
}

const SwipeableCardGrid: React.FC<SwipeableCardGridProps> = ({
  cards,
  className,
  cardClassName,
  showDots = true,
  showArrows = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  onCardSelect,
  renderCard,
  spacing = 'md',
  hapticFeedback = true,
  infiniteScroll = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { isMobile, isTablet, supportsTouch } = useMobileDetection();
  const { gestureState, handlers } = useMobileGestures();
  const { 
    trackCardView, 
    trackCardClick, 
    trackCardHoverStart, 
    trackCardHoverEnd, 
    trackCardSwipe 
  } = useFeatureCardTracking();

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  
  // Spacing variants
  const spacingVariants = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6', 
    lg: 'gap-6 md:gap-8',
  };

  // Calculate card width based on screen size
  const getCardWidth = useCallback(() => {
    if (!containerRef.current) return 280;
    
    const containerWidth = containerRef.current.offsetWidth;
    
    if (isMobile) {
      return containerWidth - 40; // Full width with margin
    } else if (isTablet) {
      return Math.min(320, containerWidth * 0.8);
    } else {
      return Math.min(360, containerWidth / 3 - 32);
    }
  }, [isMobile, isTablet]);

  // Handle drag constraints
  useEffect(() => {
    const updateConstraints = () => {
      if (!containerRef.current) return;
      
      const cardWidth = getCardWidth();
      const spacing = 16; // Gap between cards
      const totalWidth = (cardWidth + spacing) * (cards.length - 1);
      const containerWidth = containerRef.current.offsetWidth;
      
      setDragConstraints({
        left: -(totalWidth - containerWidth + cardWidth),
        right: 0,
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [cards.length, getCardWidth]);

  // Handle swipe navigation
  const navigateToCard = useCallback((index: number, triggerHaptic = true) => {
    const clampedIndex = Math.max(0, Math.min(index, cards.length - 1));
    setCurrentIndex(clampedIndex);
    
    // Haptic feedback
    if (hapticFeedback && triggerHaptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Animate to position
    const cardWidth = getCardWidth();
    const spacing = 16;
    const newX = -(cardWidth + spacing) * clampedIndex;
    x.set(newX);
  }, [cards.length, hapticFeedback, getCardWidth, x]);

  // Handle gesture-based navigation
  useEffect(() => {
    if (gestureState.lastSwipeDirection === 'left' && currentIndex < cards.length - 1) {
      const nextCard = cards[currentIndex + 1];
      if (nextCard) {
        trackCardSwipe(nextCard.title, currentIndex + 1, 'left');
      }
      navigateToCard(currentIndex + 1);
    } else if (gestureState.lastSwipeDirection === 'right' && currentIndex > 0) {
      const prevCard = cards[currentIndex - 1];
      if (prevCard) {
        trackCardSwipe(prevCard.title, currentIndex - 1, 'right');
      }
      navigateToCard(currentIndex - 1);
    }
  }, [gestureState.lastSwipeDirection, currentIndex, cards.length, navigateToCard, trackCardSwipe, cards]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = infiniteScroll ? (prev + 1) % cards.length : Math.min(prev + 1, cards.length - 1);
        navigateToCard(next, false);
        return next;
      });
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isDragging, infiniteScroll, cards.length, navigateToCard]);

  // Handle drag events
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    const threshold = getCardWidth() * 0.3;
    const velocity = info.velocity.x;
    
    if (info.offset.x > threshold || velocity > 500) {
      // Swipe right - go to previous card
      if (currentIndex > 0) {
        navigateToCard(currentIndex - 1);
      } else if (infiniteScroll) {
        navigateToCard(cards.length - 1);
      } else {
        navigateToCard(0);
      }
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swipe left - go to next card
      if (currentIndex < cards.length - 1) {
        navigateToCard(currentIndex + 1);
      } else if (infiniteScroll) {
        navigateToCard(0);
      } else {
        navigateToCard(cards.length - 1);
      }
    } else {
      // Snap back to current position
      navigateToCard(currentIndex, false);
    }
  };

  // Handle card click/tap
  const handleCardClick = (card: SwipeableCard, index: number) => {
    if (isDragging) return;
    
    // Track card interaction
    trackCardClick(card.title, index);
    
    onCardSelect?.(card, index);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  // Default card renderer
  const defaultCardRenderer = (card: SwipeableCard, index: number) => (
    <motion.div
      key={card.id}
      className={cn(
        'flex-shrink-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6',
        'cursor-pointer select-none overflow-hidden relative',
        'hover:bg-white/10 transition-colors duration-300',
        'touch-manipulation', // Optimize for touch
        cardClassName
      )}
      style={{
        width: getCardWidth(),
      }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      onClick={() => handleCardClick(card, index)}
      onHoverStart={() => trackCardHoverStart(card.title, index)}
      onHoverEnd={() => trackCardHoverEnd(card.title, index)}
      onViewportEnter={() => trackCardView(card.title, index)}
      {...(supportsTouch ? (handlers as any) : {})}
    >
      {/* Card Badge */}
      {card.badge && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-accent/20 rounded-full text-xs text-accent font-medium">
          {card.badge}
        </div>
      )}
      
      {/* Card Icon */}
      {card.icon && (
        <div className="mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-xl flex items-center justify-center">
            {card.icon}
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white">{card.title}</h3>
        <p className="text-text-secondary leading-relaxed">{card.description}</p>
      </div>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: card.color 
            ? `linear-gradient(135deg, ${card.color}20, ${card.color}10)`
            : 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(78, 205, 196, 0.05))'
        }}
      />
    </motion.div>
  );

  return (
    <div className={cn('relative w-full', className)}>
      {/* Cards Container */}
      <div 
        ref={containerRef} 
        className="relative overflow-hidden"
      >
        <motion.div
          className={cn('flex', spacingVariants[spacing])}
          drag={supportsTouch ? 'x' : false}
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ x: shouldReduceMotion ? 0 : x, opacity: shouldReduceMotion ? 1 : opacity }}
          animate={shouldReduceMotion ? {} : {
            x: -(getCardWidth() + 16) * currentIndex,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {cards.map((card, index) =>
            renderCard ? renderCard(card, index) : defaultCardRenderer(card, index)
          )}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && !isMobile && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-30"
            onClick={() => navigateToCard(currentIndex - 1)}
            disabled={!infiniteScroll && currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-30"
            onClick={() => navigateToCard(currentIndex + 1)}
            disabled={!infiniteScroll && currentIndex === cards.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {cards.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300 touch-manipulation',
                'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background',
                index === currentIndex
                  ? 'bg-accent w-6'
                  : 'bg-white/30 hover:bg-white/50'
              )}
              onClick={() => navigateToCard(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint for Mobile */}
      {isMobile && cards.length > 1 && (
        <motion.div
          className="text-center mt-4 text-text-secondary text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-0.5 bg-text-secondary/30 rounded-full" />
            <span>Swipe to explore</span>
            <div className="w-8 h-0.5 bg-text-secondary/30 rounded-full" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeableCardGrid;