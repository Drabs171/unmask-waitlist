import { MailgunProvider } from './providers/mailgun';
import { SendGridProvider } from './providers/sendgrid';
import { NodemailerProvider } from './providers/nodemailer';
import { generateEmailTemplate } from './templates';
import { EmailProvider, EmailType, WaitlistEmailData, EmailResponse, EmailTemplate } from './types';
import { generateSecureToken } from '@/lib/security/encryption';

export class EmailService {
  private providers: EmailProvider[] = [];
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'hello@unmask.life';
    this.initializeProviders();
  }

  private initializeProviders() {
    // Mailgun provider
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      this.providers.push(new MailgunProvider(
        process.env.MAILGUN_API_KEY,
        process.env.MAILGUN_DOMAIN
      ));
    }

    // SendGrid provider
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push(new SendGridProvider(process.env.SENDGRID_API_KEY));
    }

    // Nodemailer provider (fallback)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.providers.push(new NodemailerProvider({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }));
    }
  }

  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    if (this.providers.length === 0) {
      console.warn('No email providers configured. Email would be sent:', {
        to: template.to,
        subject: template.subject,
      });
      
      return {
        success: false,
        error: 'No email providers configured',
        provider: 'none',
      };
    }

    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        const isConfigured = await provider.isConfigured();
        if (!isConfigured) {
          continue;
        }

        const result = await provider.sendEmail(template);
        if (result.success) {
          return result;
        }

        console.warn(`Email provider ${result.provider} failed:`, result.error);
      } catch (error) {
        console.error('Email provider error:', error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All email providers failed',
      provider: 'fallback',
    };
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<EmailResponse> {
    const unsubscribeToken = generateSecureToken();
    
    const emailData: WaitlistEmailData = {
      email,
      verificationToken,
      unsubscribeToken,
    };

    const template = generateEmailTemplate(EmailType.VERIFICATION, emailData);

    return this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: template.tags,
      metadata: {
        type: 'verification',
        email: email,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendWelcomeEmail(email: string, unsubscribeToken: string, waitlistPosition?: number): Promise<EmailResponse> {
    const emailData: WaitlistEmailData = {
      email,
      unsubscribeToken,
      waitlistPosition,
    };

    const template = generateEmailTemplate(EmailType.WELCOME, emailData);

    return this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: template.tags,
      metadata: {
        type: 'welcome',
        email: email,
        waitlistPosition: waitlistPosition || 0,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendLaunchNotification(email: string, unsubscribeToken: string): Promise<EmailResponse> {
    const emailData: WaitlistEmailData = {
      email,
      unsubscribeToken,
    };

    const template = generateEmailTemplate(EmailType.LAUNCH_NOTIFICATION, emailData);

    return this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: template.tags,
      metadata: {
        type: 'launch',
        email: email,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async testConnection(): Promise<{ configured: boolean; providers: string[] }> {
    const results = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          const isConfigured = await provider.isConfigured();
          const canConnect = isConfigured ? await provider.testConnection() : false;
          return {
            provider: provider.constructor.name,
            configured: isConfigured,
            connected: canConnect,
          };
        } catch {
          return {
            provider: provider.constructor.name,
            configured: false,
            connected: false,
          };
        }
      })
    );

    const workingProviders = results.filter(r => r.configured && r.connected);

    return {
      configured: workingProviders.length > 0,
      providers: workingProviders.map(r => r.provider),
    };
  }

  isConfigured(): boolean {
    return this.providers.length > 0;
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}