'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card } from '@/components/ui';
import { FadeIn, GradientText } from '@/components/animations';
import { useWaitlist } from '@/hooks/useWaitlist';
import { Check, Mail, User, AlertCircle, Sparkles } from 'lucide-react';

interface WaitlistFormProps {
  className?: string;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ className }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { isSubmitting, error, success, submitToWaitlist, resetForm } = useWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    setEmailError(null);
    
    const result = await submitToWaitlist({
      email: email.trim(),
      name: name.trim() || undefined,
    });

    if (result.success) {
      // Form will show success state automatically via the hook
      setEmail('');
      setName('');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError(null);
    }
  };

  if (success) {
    return (
      <FadeIn>
        <Card className={`max-w-md mx-auto text-center ${className}`} padding="lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-6"
          >
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
          </motion.div>

          <h3 className="text-heading-m font-semibold mb-3">
            Welcome to the <GradientText>Revolution!</GradientText>
          </h3>
          
          <p className="text-text-secondary mb-6 leading-relaxed">
            You&apos;re now part of an exclusive group pioneering authentic dating. 
            We&apos;ll notify you when Unmask launches!
          </p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm text-accent font-medium">
              Position #{typeof window !== 'undefined' ? localStorage.getItem('unmask_waitlist_count') || '2847' : '2847'} in line
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              setEmail('');
              setName('');
            }}
            className="text-text-secondary"
          >
            Join another email?
          </Button>
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <Card className={`max-w-md mx-auto ${className}`} padding="lg">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="w-12 h-12 bg-gradient-brand/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-heading-m font-semibold mb-2">
              Join the <GradientText>Waitlist</GradientText>
            </h3>
            <p className="text-text-secondary text-sm">
              Be among the first to experience authentic dating
            </p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input (Optional) */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <User className="w-5 h-5 text-text-secondary" />
            </div>
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={setName}
              disabled={isSubmitting}
              className="pl-11"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Mail className="w-5 h-5 text-text-secondary" />
            </div>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isSubmitting}
              className="pl-11"
              required
              error={emailError || error || undefined}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={isSubmitting || !email.trim()}
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Joining Waitlist...' : 'Join the Revolution'}
          </Button>

          {/* Error Display */}
          <AnimatePresence>
            {(error || emailError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-error text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error || emailError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-text-secondary mb-2">
              We respect your privacy. No spam, ever.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
              <span>🔒 Secure</span>
              <span>📧 No spam</span>
              <span>🎯 Early access</span>
            </div>
          </div>
        </form>
      </Card>
    </FadeIn>
  );
};

export default WaitlistForm;