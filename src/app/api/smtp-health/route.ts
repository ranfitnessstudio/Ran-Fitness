import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!user || !pass) {
    return NextResponse.json({
      success: false,
      error: 'SMTP credentials (SMTP_USER, SMTP_PASS) are not configured in environment variables.'
    }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    console.log('[SMTP-HEALTH] Verifying connection with mail server...');
    await transporter.verify();
    console.log('[SMTP-HEALTH] Verification successful.');

    return NextResponse.json({
      success: true,
      message: 'SMTP transporter verified and working correctly.',
      host,
      port,
      user
    });
  } catch (error: any) {
    console.error('[SMTP-HEALTH ERROR]', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'SMTP verification failed.'
    }, { status: 500 });
  }
}
