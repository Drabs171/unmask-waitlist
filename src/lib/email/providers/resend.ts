import { EmailTemplate, EmailProvider, EmailResponse } from '../types';

export class ResendProvider implements EmailProvider {
  private client: any | null = null;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async ensureClient(): Promise<void> {
    if (this.client || !this.apiKey) return;
    try {
      const req: any = eval('require');
      const mod = req('resend');
      const ResendCtor = mod?.Resend || mod?.default;
      this.client = ResendCtor ? new ResendCtor(this.apiKey) : null;
    } catch {
      this.client = null;
    }
  }

  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    try {
      await this.ensureClient();
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
        // Temporarily disable tags to avoid duplication errors during rollout
        // tags: template.tags?.map((t) => ({ name: String(t).toLowerCase().replace(/[^a-z0-9_-]/gi, '_').slice(0, 50), value: '1' })),
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
    if (!this.apiKey) return false;
    await this.ensureClient();
    return !!this.client;
  }

  async testConnection(): Promise<boolean> {
    await this.ensureClient();
    return !!this.client; // Resend has no ping; assume configured
  }
}

