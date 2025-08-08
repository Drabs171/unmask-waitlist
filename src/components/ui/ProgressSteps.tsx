'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Mail, UserCheck, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StepStatus = 'pending' | 'current' | 'completed';

interface Step {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  className,
  showLabels = true,
  size = 'md',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: {
      step: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs',
      connector: 'h-0.5',
    },
    md: {
      step: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-sm',
      connector: 'h-1',
    },
    lg: {
      step: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base',
      connector: 'h-1',
    },
  };

  const getStepStatus = (stepIndex: number): StepStatus => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };



  return (
    <div className={cn('flex items-center justify-center', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const IconComponent = step.icon;
        const isLastStep = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="relative flex flex-col items-center">
              <motion.div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 relative overflow-hidden',
                  sizeClasses[size].step
                )}
                initial={{ scale: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                animate={
                  status === 'current' ? {
                    scale: 1.1,
                    backgroundColor: 'rgba(255, 107, 157, 0.3)',
                    borderColor: '#FF6B9D',
                    boxShadow: '0 0 30px rgba(255, 107, 157, 0.8), 0 0 60px rgba(255, 107, 157, 0.4), 0 0 90px rgba(255, 107, 157, 0.2)',
                  } : status === 'completed' ? {
                    scale: 1,
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                    borderColor: '#10B981',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.7), 0 0 50px rgba(16, 185, 129, 0.3)',
                  } : {
                    scale: 0.9,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }
                transition={shouldReduceMotion ? {} : {
                  duration: 0.3,
                  delay: index * 0.1,
                  type: 'spring' as const,
                  stiffness: 200,
                }}
              >
                {/* Step Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    rotate: status === 'completed' ? 360 : 0,
                  }}
                  transition={shouldReduceMotion ? {} : {
                    duration: 0.4,
                    delay: index * 0.1 + 0.1,
                  }}
                >
                  {status === 'completed' ? (
                    <Check 
                      className={cn(sizeClasses[size].icon, 'text-success')} 
                    />
                  ) : (
                    <IconComponent 
                      className={cn(
                        sizeClasses[size].icon,
                        status === 'current' ? 'text-accent' : 'text-text-secondary'
                      )} 
                    />
                  )}
                </motion.div>

                {/* Pulsing effect for current step */}
                {status === 'current' && !shouldReduceMotion && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      style={{
                        boxShadow: '0 0 20px rgba(255, 107, 157, 0.6), 0 0 40px rgba(255, 107, 157, 0.4)'
                      }}
                      initial={{ scale: 1, opacity: 0.9 }}
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.9, 0, 0.9],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut' as const,
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-accent/50"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 107, 157, 0.8)'
                      }}
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ 
                        scale: [1, 1.6, 1],
                        opacity: [0.7, 0, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut' as const,
                        delay: 0.3,
                      }}
                    />
                  </>
                )}

                {/* Shimmer effect for completed steps */}
                {status === 'completed' && !shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 1,
                        delay: index * 0.1 + 0.5,
                        ease: 'easeInOut' as const,
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Step Label */}
              {showLabels && (
                <motion.p
                  className={cn(
                    'mt-2 font-medium text-center',
                    sizeClasses[size].text,
                    status === 'current' ? 'text-accent' : 
                    status === 'completed' ? 'text-success' : 'text-text-secondary'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? {} : {
                    duration: 0.3,
                    delay: index * 0.1 + 0.2,
                  }}
                >
                  {step.label}
                </motion.p>
              )}
            </div>

            {/* Connector Line */}
            {!isLastStep && (
              <div className="flex items-center px-4">
                <div className="relative w-16 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn('w-full', sizeClasses[size].connector, 'bg-white/10')} />
                  <motion.div
                    className={cn(
                      'absolute top-0 left-0 w-full rounded-full origin-left',
                      sizeClasses[size].connector
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: index < currentStep ? 1 : 0,
                      backgroundColor: index < currentStep ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
                    }}
                    transition={shouldReduceMotion ? {} : {
                      duration: 0.5,
                      delay: index * 0.1 + 0.3,
                      ease: 'easeInOut' as const,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Default steps for waitlist signup
export const defaultWaitlistSteps: Step[] = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    status: 'pending',
  },
  {
    id: 'validate',
    label: 'Validate',
    icon: UserCheck,
    status: 'pending',
  },
  {
    id: 'submit',
    label: 'Submit',
    icon: Sparkles,
    status: 'pending',
  },
  {
    id: 'success',
    label: 'Success',
    icon: Check,
    status: 'pending',
  },
];

export default ProgressSteps;