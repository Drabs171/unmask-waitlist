export interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface EmailProvider {
  sendEmail(template: EmailTemplate): Promise<EmailResponse>;
  isConfigured(): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

export interface WaitlistEmailData {
  email: string;
  verificationToken?: string;
  unsubscribeToken?: string;
  firstName?: string;
  waitlistPosition?: number;
}

export interface EmailTemplateConfig {
  subject: string;
  template: string;
  tags: string[];
}

export enum EmailType {
  VERIFICATION = 'verification',
  WELCOME = 'welcome',
  LAUNCH_NOTIFICATION = 'launch_notification',
  REMINDER = 'reminder',
}

export interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
}