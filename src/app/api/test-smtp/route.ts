import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.FROM_EMAIL || '';

  const maskedPass = pass 
    ? pass.length > 4 
      ? `${pass.slice(0, 2)}***${pass.slice(-2)}` 
      : '***'
    : 'not set';

  const diagnostics = {
    SMTP_HOST: process.env.SMTP_HOST || 'not set (defaults to smtp.gmail.com)',
    SMTP_PORT: process.env.SMTP_PORT || 'not set (defaults to 587)',
    SMTP_USER: process.env.SMTP_USER || 'not set',
    SMTP_PASS: maskedPass,
    FROM_EMAIL: process.env.FROM_EMAIL || 'not set',
    fromEmailMatchesUser: from === user,
    isAppPasswordFormat: pass ? /^[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}$/.test(pass) || /^[a-z]{16}$/.test(pass) : false
  };

  if (!user || !pass) {
    return NextResponse.json({
      success: false,
      message: 'SMTP environment variables are missing.',
      diagnostics
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: 'SMTP verification and connection successful!',
      diagnostics
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'SMTP verification failed.',
      error: error.message || error,
      diagnostics
    });
  }
}
