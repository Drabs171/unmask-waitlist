'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, AlertCircle, Loader2, Mail, Shield, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ValidationState } from '@/hooks/useRealTimeValidation';

interface ValidationRule {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'validating' | 'valid' | 'invalid';
  message?: string;
}

interface ValidationFeedbackProps {
  validationState: ValidationState;
  email?: string;
  rules?: ValidationRule[];
  className?: string;
  showProgress?: boolean;
  compact?: boolean;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validationState,
  email = '',
  rules,
  className,
  showProgress = true,
  compact = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Default validation rules if none provided
  const defaultRules: ValidationRule[] = [
    {
      id: 'format',
      label: 'Valid email format',
      icon: Mail,
      status: email.includes('@') && email.includes('.') ? 'valid' : 'invalid',
      message: email.includes('@') && email.includes('.') ? 
        'Email format looks good!' : 
        'Please enter a valid email address',
    },
    {
      id: 'domain',
      label: 'Domain verification',
      icon: Shield,
      status: validationState === 'validating' ? 'validating' : 
               validationState === 'valid' ? 'valid' : 
               email.length > 0 ? 'invalid' : 'pending',
      message: validationState === 'valid' ? 
        'Domain verified successfully' : 
        validationState === 'invalid' ? 
        'Domain verification failed' : 
        'Verifying email domain...',
    },
    {
      id: 'deliverable',
      label: 'Email deliverability',
      icon: Zap,
      status: validationState === 'valid' ? 'valid' : 
               validationState === 'validating' ? 'validating' : 
               'pending',
      message: validationState === 'valid' ? 
        'Email can receive messages' : 
        'Checking deliverability...',
    },
  ];

  const activeRules = rules || defaultRules;

  // Calculate progress percentage
  const progress = React.useMemo(() => {
    const validCount = activeRules.filter(rule => rule.status === 'valid').length;
    return (validCount / activeRules.length) * 100;
  }, [activeRules]);

  const getStatusIcon = (status: ValidationRule['status']) => {
    switch (status) {
      case 'valid':
        return <Check className="w-4 h-4 text-success" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-error" />;
      case 'validating':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-text-secondary opacity-30" />;
    }
  };

  const getStatusColor = (status: ValidationRule['status']) => {
    switch (status) {
      case 'valid':
        return 'text-success';
      case 'invalid':
        return 'text-error';
      case 'validating':
        return 'text-yellow-500';
      default:
        return 'text-text-secondary';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      marginTop: 8,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: 'easeIn' as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: 'easeOut' as const,
      },
    },
  };

  const progressVariants = {
    initial: { scaleX: 0 },
    animate: {
      scaleX: progress / 100,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: shouldReduceMotion ? { scale: 1, opacity: 1 } : {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  if (validationState === 'idle' && email.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        'bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg p-3',
        compact ? 'p-2' : 'p-3',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        {/* Progress Bar */}
        {showProgress && !compact && (
          <motion.div
            className="mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Email Validation
              </span>
              <span className="text-xs text-text-secondary">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-secondary origin-left"
                variants={progressVariants}
                initial="initial"
                animate="animate"
              />
              
              {/* Shimmer effect */}
              {!shouldReduceMotion && progress > 0 && progress < 100 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                  }}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Validation Rules */}
        <div className="space-y-2">
          {activeRules.map((rule, index) => (
            <motion.div
              key={rule.id}
              className={cn(
                'flex items-start gap-3 transition-all duration-medium',
                compact ? 'gap-2' : 'gap-3'
              )}
              variants={itemVariants}
              custom={index}
            >
              {/* Status Icon */}
              <motion.div
                className="flex-shrink-0 mt-0.5"
                variants={rule.status === 'validating' ? pulseVariants : {}}
                initial="initial"
                animate="animate"
              >
                {getStatusIcon(rule.status)}
              </motion.div>

              {/* Rule Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <rule.icon className={cn(
                    'w-3 h-3 flex-shrink-0',
                    getStatusColor(rule.status)
                  )} />
                  <span className={cn(
                    compact ? 'text-xs' : 'text-sm',
                    'font-medium',
                    getStatusColor(rule.status)
                  )}>
                    {rule.label}
                  </span>
                </div>
                
                {rule.message && !compact && (
                  <motion.p
                    className="text-xs text-text-secondary mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    {rule.message}
                  </motion.p>
                )}
              </div>

              {/* Status Badge */}
              {rule.status === 'valid' && !shouldReduceMotion && (
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Overall Status Message */}
        <AnimatePresence mode="wait">
          {validationState === 'valid' && (
            <motion.div
              className="mt-3 pt-3 border-t border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-sm font-medium text-success">
                  Email validated successfully!
                </span>
              </div>
            </motion.div>
          )}
          
          {validationState === 'invalid' && (
            <motion.div
              className="mt-3 pt-3 border-t border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-error/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-error" />
                </div>
                <span className="text-sm font-medium text-error">
                  Please check your email address
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
  );
};

export default ValidationFeedback;