import { NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/service';

export async function GET() {
  try {
    const service = getEmailService();
    const test = await service.testConnection();
    return NextResponse.json({ ok: true, ...test });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

