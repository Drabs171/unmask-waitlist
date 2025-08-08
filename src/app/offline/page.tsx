'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Heart, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function OfflinePage() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleRetry = async () => {
    try {
      // Guard against browsers without Background Sync
      const swReg: any = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null;
      if (swReg && swReg.sync && typeof swReg.sync.register === 'function') {
        await swReg.sync.register('retry-connection');
      }
    } catch {}
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated offline icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Wifi className="w-10 h-10 text-white/50" />
              
              {/* Animated slash */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-0.5 bg-accent rotate-45 rounded-full" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* GenZ-style messaging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className={cn(
            'text-2xl font-bold gradient-text mb-4',
            'md:text-3xl'
          )}>
            You're offline, bestie! 📱
          </h1>
          
          <p className="text-text-secondary leading-relaxed mb-6">
            No worries! Even the best of us lose signal sometimes. 
            When you're back online, we'll be right here waiting for you.
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <Heart className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-sm text-text-secondary">
              Your spot on the waitlist is safe
            </span>
            <Heart className="w-5 h-5 text-primary-blue animate-pulse" />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={handleRetry}
            className={cn(
              'w-full bg-gradient-to-r from-accent to-primary-blue text-white',
              'px-6 py-4 rounded-xl font-semibold',
              'hover:shadow-glow-brand transition-all duration-300',
              'flex items-center justify-center gap-3',
              'touch-manipulation'
            )}
          >
            <RefreshCw className="w-5 h-5" />
            Try again
          </button>
          
          <button
            onClick={() => window.history.back()}
            className={cn(
              'w-full bg-white/10 backdrop-blur-md border border-white/20',
              'text-white px-6 py-4 rounded-xl font-semibold',
              'hover:bg-white/20 transition-all duration-300',
              'touch-manipulation'
            )}
          >
            Go back
          </button>
        </motion.div>

        {/* Fun offline tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-3">
            💡 Pro tip while you wait:
          </h3>
          
          <div className="text-sm text-text-secondary space-y-2">
            <p>• Take a screenshot to remember your waitlist position</p>
            <p>• Think of friends who'd love authentic dating</p>
            <p>• Practice your best conversation starters ✨</p>
          </div>
        </motion.div>

        {/* Floating hearts animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-accent/20"
              initial={{ y: '100vh', x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 800 }}
              animate={{ 
                y: '-10vh',
                x: Math.random() * 100 - 50 + (typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 800)
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 2,
                ease: 'linear'
              }}
            >
              ❤️
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}