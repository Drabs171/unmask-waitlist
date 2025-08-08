'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  blur?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty' | 'data:image/...';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  rounded?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  overlayClassName?: string;
  children?: React.ReactNode;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className,
  containerClassName,
  blur = true,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  rounded = false,
  aspectRatio = 'auto',
  overlayClassName,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const element = document.getElementById(`image-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView, src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>`
    ).toString('base64')}`;
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  const containerClass = cn(
    'relative overflow-hidden',
    aspectRatioClasses[aspectRatio],
    rounded && 'rounded-xl',
    containerClassName
  );

  const imageClass = cn(
    'transition-all duration-300',
    isLoading && 'blur-sm scale-105',
    !isLoading && 'blur-0 scale-100',
    className
  );

  // Error fallback component
  const ErrorFallback = () => (
    <div className={cn(
      'absolute inset-0 bg-gradient-to-br from-accent/10 to-primary-blue/10 flex items-center justify-center',
      rounded && 'rounded-xl'
    )}>
      <div className="text-center">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 mx-auto">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xs text-white/50">Image unavailable</p>
      </div>
    </div>
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={cn(
      'absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse',
      rounded && 'rounded-xl'
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );

  const imageId = `image-${src.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div id={imageId} className={containerClass}>
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10"
          >
            <LoadingSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      {hasError ? (
        <ErrorFallback />
      ) : isInView ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            fill={fill}
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder={blur && placeholder === 'blur' ? 'blur' : 'empty'}
            blurDataURL={
              blur && placeholder === 'blur'
                ? blurDataURL || generateBlurDataURL(width || 400, height || 300)
                : undefined
            }
            className={imageClass}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy && !priority ? 'lazy' : 'eager'}
          />
          
          {/* Overlay content */}
          {children && (
            <div className={cn('absolute inset-0 z-20', overlayClassName)}>
              {children}
            </div>
          )}
        </>
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
};

export default OptimizedImage;