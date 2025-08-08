'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular',
  animation = 'shimmer',
  children,
}) => {
  const baseClasses = 'bg-white/10 overflow-hidden relative';
  
  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'rounded-md',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    wave: 'animate-shimmer',
    none: '',
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
      {children}
    </div>
  );
};

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        {/* Logo skeleton */}
        <Skeleton 
          variant="circular" 
          width={80} 
          height={80} 
          className="mx-auto mb-8"
        />
        
        {/* Title skeleton */}
        <div className="space-y-4 mb-8">
          <Skeleton 
            variant="text" 
            className="h-16 w-full max-w-2xl mx-auto"
          />
          <Skeleton 
            variant="text" 
            className="h-12 w-3/4 mx-auto"
          />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-3 mb-12">
          <Skeleton 
            variant="text" 
            className="h-4 w-full max-w-xl mx-auto"
          />
          <Skeleton 
            variant="text" 
            className="h-4 w-5/6 mx-auto"
          />
        </div>
        
        {/* Button skeleton */}
        <Skeleton 
          variant="rounded" 
          className="h-14 w-64 mx-auto"
        />
      </div>
    </div>
  );
};

// Feature Card Skeleton
export const FeatureCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
          <Skeleton variant="text" className="h-4 w-full" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-5/6" />
        <Skeleton variant="text" className="h-4 w-4/5" />
      </div>
    </div>
  );
};

// Features Section Skeleton
export const FeaturesSkeleton: React.FC = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section title skeleton */}
        <div className="text-center mb-16">
          <Skeleton variant="text" className="h-12 w-96 mx-auto mb-4" />
          <Skeleton variant="text" className="h-4 w-2/3 mx-auto" />
        </div>
        
        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <FeatureCardSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Waitlist Form Skeleton
export const WaitlistFormSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress steps skeleton */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="circular" width={8} height={8} />
        ))}
      </div>
      
      {/* Counter skeleton */}
      <div className="text-center mb-8">
        <Skeleton variant="text" className="h-8 w-48 mx-auto mb-2" />
        <Skeleton variant="text" className="h-4 w-32 mx-auto" />
      </div>
      
      {/* Form skeleton */}
      <div className="space-y-4">
        <Skeleton variant="rounded" className="h-14 w-full" />
        <Skeleton variant="rounded" className="h-14 w-full" />
      </div>
      
      {/* Helper text skeleton */}
      <div className="text-center space-y-2">
        <Skeleton variant="text" className="h-3 w-3/4 mx-auto" />
        <Skeleton variant="text" className="h-3 w-1/2 mx-auto" />
      </div>
    </div>
  );
};

// Social Proof Skeleton
export const SocialProofSkeleton: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <div className="text-center mb-12">
          <Skeleton variant="text" className="h-8 w-64 mx-auto mb-4" />
          <Skeleton variant="text" className="h-4 w-96 mx-auto" />
        </div>
        
        {/* Avatars grid */}
        <div className="flex justify-center mb-8">
          <div className="flex -space-x-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton 
                key={i} 
                variant="circular" 
                width={64} 
                height={64}
                className="border-4 border-background"
              />
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton variant="text" className="h-8 w-16 mx-auto mb-2" />
              <Skeleton variant="text" className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Admin Dashboard Skeleton
export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton variant="text" className="h-8 w-64 mb-2" />
              <Skeleton variant="text" className="h-4 w-48" />
            </div>
            <div className="flex gap-4">
              <Skeleton variant="rounded" className="h-10 w-24" />
              <Skeleton variant="rounded" className="h-10 w-32" />
            </div>
          </div>
        </div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="rounded" className="h-6 w-16" />
              </div>
              <Skeleton variant="text" className="h-8 w-20 mb-1" />
              <Skeleton variant="text" className="h-4 w-32" />
            </div>
          ))}
        </div>
        
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <Skeleton variant="text" className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton variant="text" className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton variant="rounded" className="h-2 w-32" />
                      <Skeleton variant="text" className="h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;