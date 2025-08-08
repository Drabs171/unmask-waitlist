import { EmailTemplate, EmailProvider, EmailResponse } from '../types';

export class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.sendgrid.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    try {
      const payload = {
        personalizations: [{
          to: [{ email: template.to }],
          subject: template.subject,
          custom_args: template.metadata || {},
        }],
        from: { email: template.from },
        content: [
          {
            type: 'text/html',
            value: template.html,
          },
          ...(template.text ? [{
            type: 'text/plain',
            value: template.text,
          }] : []),
        ],
        categories: template.tags || [],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
          subscription_tracking: { enable: false },
        },
      };

      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`SendGrid error: ${response.status} - ${errorData}`);
      }

      // SendGrid returns 202 with X-Message-Id header
      const messageId = response.headers.get('X-Message-Id') || 'unknown';

      return {
        success: true,
        messageId,
        provider: 'sendgrid',
      };

    } catch (error) {
      console.error('SendGrid send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'sendgrid',
      };
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}