'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  Copy, 
  Check,
  X
} from 'lucide-react';
import { useWebShare } from '@/hooks/useWebShare';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useSocialSharingTracking } from '@/hooks/useAnalytics';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showFallbackOptions?: boolean;
  onShare?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title = 'Check out Unmask - Authentic Dating Revolution',
  text = 'Join the waitlist for Unmask, where genuine connections happen through real conversations. No swiping, just authentic dating.',
  url = window.location.href,
  className,
  variant = 'primary',
  size = 'md',
  showLabel = true,
  showFallbackOptions = true,
  onShare,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const { 
    share, 
    isSupported, 
    isMobile, 
    shareToTwitter, 
    shareToFacebook, 
    shareToLinkedIn, 
    shareToWhatsApp, 
    shareViaSMS, 
    shareViaEmail, 
    copyToClipboard 
  } = useWebShare();

  const { supportsTouch } = useMobileDetection();
  const { 
    trackShareAttempt, 
    trackShareSuccess, 
    trackShareFallback, 
    trackCopyLink 
  } = useSocialSharingTracking();

  // Handle main share action
  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    onShare?.();
    
    // Track share attempt
    trackShareAttempt('share_button');

    const shareData = { title, text, url };
    
    const success = await share(shareData, {
      hapticFeedback: true,
      onSuccess: () => {
        setShareSuccess(true);
        trackShareSuccess('native', 'share_button');
        setTimeout(() => setShareSuccess(false), 2000);
      },
      onError: (error) => {
        console.error('Share failed:', error);
        if (showFallbackOptions) {
          setShowFallback(true);
          trackShareFallback('share_button');
        }
      },
    });

    // If native share failed and we have fallback options, show them
    if (!success && showFallbackOptions) {
      setShowFallback(true);
      trackShareFallback('share_button');
    }
    
    setIsSharing(false);
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    const shareText = `${title} - ${text} ${url}`;
    const success = await copyToClipboard(shareText);
    
    if (success) {
      setCopySuccess(true);
      trackCopyLink('share_modal');
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
    }
  };

  // Handle social shares
  const handleTwitterShare = () => {
    trackShareSuccess('twitter', 'share_modal');
    shareToTwitter(text, url);
    setShowFallback(false);
  };

  const handleFacebookShare = () => {
    trackShareSuccess('facebook', 'share_modal');
    shareToFacebook(url);
    setShowFallback(false);
  };

  const handleLinkedInShare = () => {
    trackShareSuccess('linkedin', 'share_modal');
    shareToLinkedIn(url, title, text);
    setShowFallback(false);
  };

  const handleWhatsAppShare = () => {
    trackShareSuccess('whatsapp', 'share_modal');
    shareToWhatsApp(text, url);
    setShowFallback(false);
  };

  const handleSMSShare = () => {
    trackShareSuccess('sms', 'share_modal');
    shareViaSMS(text, url);
    setShowFallback(false);
  };

  const handleEmailShare = () => {
    trackShareSuccess('email', 'share_modal');
    shareViaEmail(title, text, url);
    setShowFallback(false);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-accent to-primary-blue text-white shadow-glow-brand hover:shadow-glow-brand/80',
    secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
    ghost: 'bg-transparent text-text-secondary hover:text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const buttonClasses = cn(
    'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'touch-manipulation select-none',
    variants[variant],
    sizes[size],
    className
  );

  return (
    <>
      {/* Main Share Button */}
      <motion.button
        className={buttonClasses}
        onClick={handleShare}
        disabled={isSharing}
        whileTap={supportsTouch ? { scale: 0.98 } : {}}
        whileHover={{ scale: 1.02 }}
      >
        {/* Success State */}
        <AnimatePresence mode="wait">
          {shareSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2 text-green-400"
            >
              <Check className="w-5 h-5" />
              {showLabel && <span>Shared!</span>}
            </motion.div>
          ) : isSharing ? (
            <motion.div
              key="loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Share2 className="w-5 h-5" />
              </motion.div>
              {showLabel && <span>Sharing...</span>}
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {showLabel && <span>Share</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-xl opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Fallback Share Options Modal */}
      <AnimatePresence>
        {showFallback && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFallback(false)}
          >
            <motion.div
              className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 pb-8"
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Share Unmask</h3>
                <button
                  onClick={() => setShowFallback(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-text-secondary hover:text-white transition-colors touch-manipulation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share Options Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Twitter */}
                <motion.button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                  onClick={handleTwitterShare}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-[#1DA1F2] rounded-xl flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-text-secondary">Twitter</span>
                </motion.button>

                {/* Facebook */}
                <motion.button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                  onClick={handleFacebookShare}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-text-secondary">Facebook</span>
                </motion.button>

                {/* LinkedIn */}
                <motion.button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                  onClick={handleLinkedInShare}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-[#0A66C2] rounded-xl flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-text-secondary">LinkedIn</span>
                </motion.button>

                {/* WhatsApp (Mobile only) */}
                {isMobile && (
                  <motion.button
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                    onClick={handleWhatsAppShare}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-text-secondary">WhatsApp</span>
                  </motion.button>
                )}

                {/* SMS (Mobile only) */}
                {isMobile && (
                  <motion.button
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                    onClick={handleSMSShare}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-text-secondary">SMS</span>
                  </motion.button>
                )}

                {/* Email */}
                <motion.button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                  onClick={handleEmailShare}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-text-secondary rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-text-secondary">Email</span>
                </motion.button>
              </div>

              {/* Copy Link Button */}
              <motion.button
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white touch-manipulation"
                onClick={handleCopy}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {copySuccess ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-3 text-green-400"
                    >
                      <Check className="w-5 h-5" />
                      <span>Copied to clipboard!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-3"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Copy Link</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButton;