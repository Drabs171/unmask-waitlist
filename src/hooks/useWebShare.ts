'use client';

import { useCallback, useState } from 'react';
import { useMobileDetection } from './useMobileDetection';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface ShareOptions {
  fallbackUrl?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  hapticFeedback?: boolean;
}

interface WebShareResult {
  canShare: boolean;
  isSupported: boolean;
  isMobile: boolean;
  share: (data: ShareData, options?: ShareOptions) => Promise<boolean>;
  shareToTwitter: (text: string, url?: string) => void;
  shareToFacebook: (url: string) => void;
  shareToLinkedIn: (url: string, title?: string, summary?: string) => void;
  shareToWhatsApp: (text: string, url?: string) => void;
  shareViaSMS: (text: string, url?: string) => void;
  shareViaEmail: (subject: string, body: string, url?: string) => void;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export const useWebShare = (): WebShareResult => {
  const [isSharing, setIsSharing] = useState(false);
  const { isMobile, isIOS, isAndroid } = useMobileDetection();

  // Check if Web Share API is supported
  const isSupported = typeof navigator !== 'undefined' && 'share' in navigator;
  
  // Check if current data can be shared
  const canShare = useCallback((data: ShareData) => {
    if (!isSupported) return false;
    try {
      return navigator.canShare ? navigator.canShare(data) : true;
    } catch {
      return false;
    }
  }, [isSupported]);

  // Main share function
  const share = useCallback(async (
    data: ShareData, 
    options: ShareOptions = {}
  ): Promise<boolean> => {
    const { 
      fallbackUrl = data.url || window.location.href, 
      onSuccess, 
      onError, 
      hapticFeedback = true 
    } = options;

    if (isSharing) return false;
    
    setIsSharing(true);
    
    try {
      // Haptic feedback for mobile devices
      if (hapticFeedback && isMobile && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }

      // Try native Web Share API first
      if (isSupported && canShare(data)) {
        await navigator.share(data);
        onSuccess?.();
        return true;
      }
      
      // Fallback to social sharing or copy to clipboard
      if (fallbackUrl) {
        const shareText = `${data.title || ''} ${data.text || ''} ${fallbackUrl}`.trim();
        const copied = await copyToClipboard(shareText);
        
        if (copied) {
          onSuccess?.();
          return true;
        }
      }
      
      throw new Error('Sharing not supported and fallback failed');
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Share failed');
      onError?.(err);
      console.error('Share failed:', err);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, isSupported, canShare, isMobile]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return result;
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }, []);

  // Platform-specific share functions
  const shareToTwitter = useCallback((text: string, url?: string) => {
    const tweetText = encodeURIComponent(text);
    const tweetUrl = url ? encodeURIComponent(url) : '';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}${url ? `&url=${tweetUrl}` : ''}`;
    
    if (isMobile) {
      // Try to open Twitter app first, then fallback to web
      const twitterAppUrl = `twitter://post?message=${tweetText}${url ? `&url=${tweetUrl}` : ''}`;
      const link = document.createElement('a');
      link.href = twitterAppUrl;
      link.click();
      
      // Fallback to web after a delay
      setTimeout(() => {
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    }
  }, [isMobile]);

  const shareToFacebook = useCallback((url: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    
    if (isMobile) {
      // Try to open Facebook app first
      const fbAppUrl = `fb://facewebmodal/f?href=${encodeURIComponent(url)}`;
      const link = document.createElement('a');
      link.href = fbAppUrl;
      link.click();
      
      // Fallback to web
      setTimeout(() => {
        window.open(facebookUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  }, [isMobile]);

  const shareToLinkedIn = useCallback((url: string, title?: string, summary?: string) => {
    const params = new URLSearchParams({
      url,
      ...(title && { title }),
      ...(summary && { summary }),
    });
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
    
    if (isMobile) {
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=550,height=550');
    }
  }, [isMobile]);

  const shareToWhatsApp = useCallback((text: string, url?: string) => {
    const message = `${text}${url ? ` ${url}` : ''}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    if (isMobile) {
      // Try to open WhatsApp app
      const waAppUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const link = document.createElement('a');
      link.href = waAppUrl;
      link.click();
      
      // Fallback to WhatsApp Web
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }, [isMobile]);

  const shareViaSMS = useCallback((text: string, url?: string) => {
    const message = `${text}${url ? ` ${url}` : ''}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    
    const link = document.createElement('a');
    link.href = smsUrl;
    link.click();
  }, []);

  const shareViaEmail = useCallback((subject: string, body: string, url?: string) => {
    const emailBody = `${body}${url ? `\n\n${url}` : ''}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    const link = document.createElement('a');
    link.href = emailUrl;
    link.click();
  }, []);

  return {
    canShare: canShare({ title: '', text: '', url: window.location.href }),
    isSupported,
    isMobile,
    share,
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    shareToWhatsApp,
    shareViaSMS,
    shareViaEmail,
    copyToClipboard,
  };
};

export default useWebShare;