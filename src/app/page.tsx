'use client';

import React, { useState } from 'react';
import { Hero, Features, SocialProof } from '@/components/sections';
import WaitlistForm from '@/components/WaitlistForm';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import PullToRefresh from '@/components/ui/PullToRefresh';
import ShareButton from '@/components/ui/ShareButton';
import { SiteIdentity } from '@/components/ui/SiteIdentity';
import { motion } from 'framer-motion';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useButtonTracking } from '@/hooks/useAnalytics';
import { cn } from '@/utils/cn';

export default function Home() {
  const [, setShowWaitlistForm] = useState(false);
  const { isMobile, isTablet, safeAreaInsets } = useMobileDetection();
  const { trackCTAClick } = useButtonTracking();

  const handleJoinWaitlist = () => {
    // Track CTA click
    trackCTAClick('join_waitlist', 'hero');
    
    setShowWaitlistForm(true);
    
    // Smooth scroll to waitlist form
    setTimeout(() => {
      const formElement = document.getElementById('waitlist-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth',
          block: isMobile ? 'start' : 'center'
        });
      }
    }, 100);
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Optional: Trigger any data refresh logic here
    console.log('Page refreshed');
  };

  const mainContent = (
    <main 
      className="min-h-screen overflow-x-hidden" 
      style={{ 
        background: '#0a0a0a',
        paddingBottom: isMobile ? Math.max(safeAreaInsets.bottom, 16) : 0
      }}
    >
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation onJoinWaitlist={handleJoinWaitlist} />
      )}

      {/* Hero Section */}
      <Hero onJoinWaitlist={handleJoinWaitlist} />

      {/* Features Section */}
      <Features />

      {/* Community Updates Section - Hidden until we have real data */}
      {/* <CommunityUpdates /> */}

      {/* Waitlist Form Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "px-4 relative bg-white/[0.02] border-y border-white/10",
          isMobile ? "py-mobile-lg" : "py-20"
        )}
        id="waitlist-form"
      >
        <div className={cn(
          "mx-auto",
          isMobile ? "max-w-sm" : "max-w-4xl"
        )}>
          <WaitlistForm />
        </div>
      </motion.section>

      {/* Social Proof Section */}
      <SocialProof />

      {/* Mobile-Optimized Footer */}
      <footer className={cn(
        "border-t border-white/10 px-4",
        isMobile ? "py-mobile-lg" : "py-12"
      )}>
        <div className={cn(
          "mx-auto text-center",
          isMobile ? "max-w-sm" : "max-w-6xl"
        )}>
          <div className={cn(
            isMobile ? "mb-mobile-md" : "mb-6"
          )}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <SiteIdentity size={isMobile ? 32 : 40} />
              <h3 className={cn(
                "font-bold gradient-text",
                isMobile ? "text-mobile-title" : "text-2xl"
              )}>
                Unmask.life
              </h3>
            </div>
            <p className={cn(
              "text-text-secondary",
              isMobile ? "text-mobile-caption" : "text-sm"
            )}>
              Dating reimagined for the authentic generation
            </p>
          </div>

          {/* Footer Features */}
          <div className={cn(
            "flex items-center justify-center text-text-secondary mb-6",
            isMobile 
              ? "flex-col gap-3 text-mobile-caption" 
              : "gap-8 text-sm"
          )}>
            <span className="flex items-center gap-1">
              <span>🔒</span> Privacy First
            </span>
            <span className="flex items-center gap-1">
              <span>💝</span> Authentic Connections
            </span>
            <span className="flex items-center gap-1">
              <span>🚀</span> Coming Soon
            </span>
          </div>

          {/* Social Share for Mobile */}
          {isMobile && (
            <div className="mb-6">
              <ShareButton 
                variant="secondary"
                size="md"
                showLabel={true}
                className="mx-auto"
              />
            </div>
          )}

          <div className={cn(
            "text-text-secondary",
            isMobile ? "text-xs leading-relaxed" : "text-xs"
          )}>
            © 2024 Unmask.life. All rights reserved.
            {isMobile && <br />}
            {!isMobile && ' '}Built for GenZ, by GenZ.
          </div>
        </div>
      </footer>
    </main>
  );

  // Wrap content with analytics
  const analyticsWrappedContent = mainContent;

  // Wrap with pull-to-refresh for mobile
  if (isMobile || isTablet) {
    return (
      <PullToRefresh
        onRefresh={handleRefresh}
        hapticFeedback={true}
        showSparkles={true}
        refreshText="Getting latest updates..."
        pullText="Pull to refresh"
        releaseText="Release to update"
      >
        {mainContent}
      </PullToRefresh>
    );
  }

  return analyticsWrappedContent;
}
