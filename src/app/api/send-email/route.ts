import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, htmlBody } = body;

    if (!to || !subject || !htmlBody) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, htmlBody' }, { status: 400 });
    }

    const result = await sendEmail({ to, subject, htmlBody });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email queued successfully' });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
