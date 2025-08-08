import { EmailTemplate, EmailProvider, EmailResponse } from '../types';

export class MailgunProvider implements EmailProvider {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor(apiKey: string, domain: string) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.baseUrl = 'https://api.mailgun.net/v3';
  }

  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    try {
      const formData = new FormData();
      formData.append('from', template.from);
      formData.append('to', template.to);
      formData.append('subject', template.subject);
      formData.append('html', template.html);
      
      if (template.text) {
        formData.append('text', template.text);
      }

      if (template.tags && template.tags.length > 0) {
        template.tags.forEach(tag => formData.append('o:tag', tag));
      }

      if (template.metadata) {
        Object.entries(template.metadata).forEach(([key, value]) => {
          formData.append(`v:${key}`, String(value));
        });
      }

      const response = await fetch(`${this.baseUrl}/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email via Mailgun');
      }

      return {
        success: true,
        messageId: data.id,
        provider: 'mailgun',
      };

    } catch (error) {
      console.error('Mailgun send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mailgun',
      };
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.apiKey && this.domain);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.domain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}