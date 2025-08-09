import { Resend } from 'resend';
import { EmailTemplate, EmailProvider, EmailResponse } from '../types';

export class ResendProvider implements EmailProvider {
  private client: Resend | null;

  constructor(apiKey?: string) {
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    try {
      if (!this.client) {
        return { success: false, error: 'Resend not configured', provider: 'resend' };
      }
      const result = await this.client.emails.send({
        from: template.from,
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        headers: template.metadata as Record<string, string> | undefined,
        // Resend requires tag names to be unique; using each tag as its own name
        tags: template.tags?.map((t) => ({
          name: String(t).toLowerCase().replace(/[^a-z0-9_-]/gi, '_').slice(0, 50),
          value: '1',
        })),
      });
      if ((result as any).error) {
        throw new Error((result as any).error?.message || 'Resend send failed');
      }
      return { success: true, messageId: (result as any).id, provider: 'resend' };
    } catch (error) {
      return { success: false, error: (error as Error).message, provider: 'resend' };
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!this.client;
  }

  async testConnection(): Promise<boolean> {
    return !!this.client; // Resend has no ping; assume configured
  }
}

