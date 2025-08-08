'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Settings, Database, Share2, Cookie } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import MobileButton from '@/components/ui/MobileButton';
import { cn } from '@/utils/cn';

const PrivacyPolicyPage: React.FC = () => {
  const { isMobile, safeAreaInsets } = useMobileDetection();

  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          subtitle: 'Information You Provide',
          text: 'When you join our waitlist, we collect your email address to notify you about our launch. This is the only personal information we require.'
        },
        {
          subtitle: 'Automatic Information',
          text: 'We automatically collect certain information when you visit our website, including your IP address, browser type, device information, and usage patterns. This helps us improve our service and understand our audience.'
        },
        {
          subtitle: 'Analytics Data',
          text: 'We use analytics tools to understand how visitors interact with our website. This includes page views, time spent on site, click patterns, and general demographic information.'
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: Settings,
      content: [
        {
          subtitle: 'Primary Purposes',
          text: 'We use your email address solely to notify you when Unmask launches and to send important updates about our service. We will never spam you or sell your information.'
        },
        {
          subtitle: 'Service Improvement',
          text: 'We analyze usage data to improve our website performance, understand user preferences, and optimize the user experience.'
        },
        {
          subtitle: 'Communication',
          text: 'We may occasionally send you updates about our progress, but you can unsubscribe at any time with one click.'
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: Share2,
      content: [
        {
          subtitle: 'We Don\'t Sell Your Data',
          text: 'We never sell, rent, or trade your personal information to third parties. Your privacy is our priority.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We may share limited data with trusted service providers who help us operate our website and send emails, but only under strict confidentiality agreements.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law or to protect our rights, but we will notify you unless prohibited by law.'
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: Cookie,
      content: [
        {
          subtitle: 'Essential Cookies',
          text: 'We use essential cookies to ensure our website functions properly. These cannot be disabled as they are necessary for basic functionality.'
        },
        {
          subtitle: 'Analytics Cookies',
          text: 'With your consent, we use analytics cookies to understand how visitors use our site. You can opt out of these at any time.'
        },
        {
          subtitle: 'Marketing Cookies',
          text: 'We may use marketing cookies to show you relevant advertisements and track campaign effectiveness, but only with your explicit consent.'
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      icon: Shield,
      content: [
        {
          subtitle: 'Access and Control',
          text: 'You have the right to access, update, or delete your personal information at any time. Contact us and we\'ll respond within 30 days.'
        },
        {
          subtitle: 'Opt-Out Rights',
          text: 'You can unsubscribe from our emails at any time, withdraw cookie consent, or request that we stop processing your data.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You have the right to receive your personal data in a portable format if you want to transfer it to another service.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Eye,
      content: [
        {
          subtitle: 'Protection Measures',
          text: 'We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls.'
        },
        {
          subtitle: 'Data Retention',
          text: 'We only retain your information for as long as necessary to provide our services or as required by law. Waitlist emails are typically kept until our app launches.'
        },
        {
          subtitle: 'Breach Notification',
          text: 'In the unlikely event of a data breach, we will notify affected users and authorities as required by law within 72 hours.'
        }
      ]
    }
  ];

  return (
    <div 
      className="min-h-screen bg-background text-white"
      style={{
        paddingTop: isMobile ? safeAreaInsets.top + 60 : 0,
        paddingBottom: isMobile ? Math.max(safeAreaInsets.bottom, 16) : 0,
      }}
    >
      <div className={cn(
        'mx-auto px-4 py-8',
        isMobile ? 'max-w-full' : 'max-w-4xl'
      )}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Back Button */}
          <MobileButton
            variant="ghost"
            size="md"
            onClick={() => window.history.back()}
            className="mb-6 border-white/20"
            touchOptimized={isMobile}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </MobileButton>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            
            <h1 className={cn(
              'font-bold gradient-text mb-4',
              isMobile ? 'text-mobile-hero' : 'text-4xl'
            )}>
              Privacy Policy
            </h1>
            
            <p className={cn(
              'text-text-secondary max-w-2xl mx-auto leading-relaxed',
              isMobile ? 'text-mobile-body' : 'text-lg'
            )}>
              Your privacy matters to us. This policy explains how we collect, use, and protect 
              your personal information when you use Unmask.
            </p>
            
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className={cn(
                'text-text-secondary',
                isMobile ? 'text-mobile-caption' : 'text-sm'
              )}>
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            
            return (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div>
                    <h2 className={cn(
                      'font-bold text-white mb-2',
                      isMobile ? 'text-mobile-title' : 'text-2xl'
                    )}>
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-2 border-accent/30 pl-4">
                      <h3 className={cn(
                        'font-semibold text-white mb-2',
                        isMobile ? 'text-mobile-body' : 'text-lg'
                      )}>
                        {item.subtitle}
                      </h3>
                      <p className={cn(
                        'text-text-secondary leading-relaxed',
                        isMobile ? 'text-mobile-caption' : 'text-base'
                      )}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-accent/10 to-primary-blue/10 rounded-2xl border border-white/10 p-6 md:p-8 text-center"
        >
          <h2 className={cn(
            'font-bold text-white mb-4',
            isMobile ? 'text-mobile-title' : 'text-2xl'
          )}>
            Questions About Your Privacy?
          </h2>
          
          <p className={cn(
            'text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed',
            isMobile ? 'text-mobile-body' : 'text-lg'
          )}>
            We're here to help. If you have any questions about this privacy policy or 
            how we handle your data, don't hesitate to reach out.
          </p>

          <div className={cn(
            'flex gap-4',
            isMobile ? 'flex-col' : 'justify-center'
          )}>
            <MobileButton
              variant="gradient"
              size={isMobile ? 'lg' : 'md'}
              onClick={() => window.location.href = 'mailto:privacy@unmask.life'}
              touchOptimized={isMobile}
              className="font-semibold"
            >
              Contact Us
            </MobileButton>
            
            <MobileButton
              variant="secondary"
              size={isMobile ? 'lg' : 'md'}
              onClick={() => window.history.back()}
              touchOptimized={isMobile}
            >
              Back to Home
            </MobileButton>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;