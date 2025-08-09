import { NextRequest, NextResponse } from 'next/server';
import { getEmailByHash, updateVerificationToken } from '@/lib/database/neon';
import { generateVerificationToken, hashEmail } from '@/lib/security/encryption';
import { getEmailService } from '@/lib/email/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string | undefined = body?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    // Simple protection: require debug bypass or admin key if set
    const bypass = request.headers.get('x-debug-bypass') === 'true';
    const adminKey = request.headers.get('x-admin-key');
    if (!bypass && process.env.ADMIN_API_KEY && adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const emailHash = hashEmail(email);
    const existing = await getEmailByHash(emailHash);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 });
    }

    const token = generateVerificationToken();
    await updateVerificationToken(existing.id, token);

    const service = getEmailService();
    const publicUrl = process.env.NEXT_PUBLIC_URL || 'https://www.unmask.life';
    const result = await service.sendVerificationEmail(email, token, publicUrl);

    return NextResponse.json({ success: result.success, email_debug: result, token });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

