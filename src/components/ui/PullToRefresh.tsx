'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { RefreshCw, ChevronDown, Sparkles } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  disabled?: boolean;
  threshold?: number;
  hapticFeedback?: boolean;
  showSparkles?: boolean;
  refreshText?: string;
  pullText?: string;
  releaseText?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  disabled = false,
  threshold = 80,
  hapticFeedback = true,
  showSparkles = true,
  refreshText = 'Refreshing...',
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTriggered, setRefreshTriggered] = useState(false);
  const [touchStart, setTouchStart] = useState({ y: 0, time: 0 });
  const [canPull, setCanPull] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { isMobile, supportsTouch } = useMobileDetection();

  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, threshold], [0, 1]);
  const refreshIconRotation = useTransform(y, [0, threshold], [0, 180]);
  const sparkleOpacity = useTransform(y, [threshold * 0.5, threshold], [0, 1]);

  // Check if user can pull (at top of scroll)
  const checkCanPull = useCallback(() => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop === 0;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !supportsTouch) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    const canPullNow = checkCanPull();
    setCanPull(canPullNow);
    
    if (canPullNow) {
      setTouchStart({
        y: touch.clientY,
        time: Date.now(),
      });
    }
  }, [disabled, isRefreshing, supportsTouch, checkCanPull]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !canPull || !supportsTouch) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    const deltaY = touch.clientY - touchStart.y;
    const pullDistance = Math.max(0, deltaY);
    
    // Prevent default scrolling when pulling down
    if (pullDistance > 10) {
      e.preventDefault();
    }
    
    // Apply elastic resistance
    const elasticDistance = Math.min(pullDistance * 0.6, threshold * 1.5);
    y.set(elasticDistance);
    
    // Haptic feedback at threshold
    if (pullDistance > threshold && !refreshTriggered) {
      setRefreshTriggered(true);
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } else if (pullDistance <= threshold && refreshTriggered) {
      setRefreshTriggered(false);
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
    
    // Micro haptic feedback for smooth pulling
    if (hapticFeedback && pullDistance > 0 && pullDistance % 20 === 0) {
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
    }
  }, [
    disabled, 
    isRefreshing, 
    canPull, 
    supportsTouch, 
    touchStart.y, 
    threshold, 
    refreshTriggered, 
    hapticFeedback,
    y
  ]);

  // Handle touch end
  const handleTouchEnd = useCallback(async (e: TouchEvent) => {
    if (disabled || isRefreshing || !canPull || !supportsTouch) return;
    
    const currentY = y.get();
    
    if (currentY > threshold && refreshTriggered) {
      // Trigger refresh
      setIsRefreshing(true);
      
      // Strong haptic feedback for refresh
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
      
      // Animate to refresh position
      y.set(threshold * 0.6);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        // Reset state
        setIsRefreshing(false);
        setRefreshTriggered(false);
        setCanPull(false);
        
        // Animate back to normal position
        y.set(0);
      }
    } else {
      // Snap back to normal position
      y.set(0);
      setRefreshTriggered(false);
      setCanPull(false);
    }
  }, [
    disabled, 
    isRefreshing, 
    canPull, 
    supportsTouch, 
    threshold, 
    refreshTriggered, 
    hapticFeedback, 
    onRefresh,
    y
  ]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsTouch) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, supportsTouch]);

  // Get current status text
  const getStatusText = () => {
    if (isRefreshing) return refreshText;
    if (refreshTriggered) return releaseText;
    return pullText;
  };

  // Get current icon
  const getCurrentIcon = () => {
    if (isRefreshing) {
      return (
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={shouldReduceMotion ? {} : {
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <RefreshCw className="w-5 h-5 text-accent" />
        </motion.div>
      );
    }
    
    if (refreshTriggered) {
      return <RefreshCw className="w-5 h-5 text-accent" />;
    }
    
    return (
      <motion.div style={shouldReduceMotion ? {} : { rotate: refreshIconRotation }}>
        <ChevronDown className="w-5 h-5 text-text-secondary" />
      </motion.div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-auto',
        'overscroll-behavior-y-none', // Prevent browser pull-to-refresh
        className
      )}
    >
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-b border-white/10"
        style={{
          height: shouldReduceMotion ? (isRefreshing ? 60 : 0) : y,
          opacity: shouldReduceMotion ? (isRefreshing ? 1 : 0) : pullProgress,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-3">
          {getCurrentIcon()}
          
          <span className={cn(
            'text-sm font-medium transition-colors duration-200',
            isRefreshing ? 'text-accent' : 
            refreshTriggered ? 'text-accent' : 
            'text-text-secondary'
          )}>
            {getStatusText()}
          </span>
          
          {/* Sparkles Effect */}
          {showSparkles && !shouldReduceMotion && (
            <motion.div
              style={{ opacity: sparkleOpacity }}
              className="flex gap-1"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-accent" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Content */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
      
      {/* Loading Overlay */}
      {isRefreshing && (
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-background/90 backdrop-blur-md rounded-2xl p-6 flex items-center gap-4 border border-white/10">
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={shouldReduceMotion ? {} : {
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <RefreshCw className="w-6 h-6 text-accent" />
            </motion.div>
            <span className="text-white font-medium">{refreshText}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PullToRefresh;