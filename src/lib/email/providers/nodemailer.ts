import nodemailer from 'nodemailer';
import { EmailTemplate, EmailProvider, EmailResponse } from '../types';

export class NodemailerProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) {
    this.transporter = nodemailer.createTransport(config as any);
  }

  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    try {
      const result = await this.transporter.sendMail({
        from: template.from,
        to: template.to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        headers: template.metadata ? {
          'X-Metadata': JSON.stringify(template.metadata),
        } : undefined,
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: 'nodemailer',
      };

    } catch (error) {
      console.error('Nodemailer send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'nodemailer',
      };
    }
  }

  async isConfigured(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}