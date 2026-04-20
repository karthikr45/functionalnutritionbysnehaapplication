import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, contactFormEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }

    const recipient = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'hello@gutshell.com';

    await sendEmail({
      to: recipient,
      subject: `New contact form submission from ${name}`,
      html: contactFormEmail({ name, email, phone, message }),
    });

    return NextResponse.json({ message: 'Message sent successfully!' });
  } catch (err: any) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Failed to send message. Please try again or WhatsApp us directly.' }, { status: 500 });
  }
}
