import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587');
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.FROM_EMAIL || 'verification@ranfitness.com';

// Startup environment audit warning
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL) {
  const missing = [
    !process.env.SMTP_HOST && 'SMTP_HOST',
    !process.env.SMTP_PORT && 'SMTP_PORT',
    !process.env.SMTP_USER && 'SMTP_USER',
    !process.env.SMTP_PASS && 'SMTP_PASS',
    !process.env.FROM_EMAIL && 'FROM_EMAIL'
  ].filter(Boolean).join(', ');

  const warnMsg = `[SMTP WARNING] Startup audit detected missing environment variables: ${missing}.`;
  console.warn(warnMsg);

  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_BUILD === 'true';
  if (process.env.NODE_ENV === 'production' && !isBuild) {
    throw new Error(`CRITICAL: Production startup failed due to missing SMTP configurations: ${missing}`);
  }
}

let cachedTransporter: any = null;
let isTransporterVerified = false;

const getTransporter = () => {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_BUILD === 'true';
  if (process.env.NODE_ENV === 'production' && !isBuild && (!user || !pass)) {
    throw new Error('CRITICAL: Missing SMTP credentials in production mode');
  }
  if (!user || !pass) {
    return null;
  }
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
  return cachedTransporter;
};

async function verifyTransporter(transporter: any): Promise<boolean> {
  if (isTransporterVerified) return true;
  try {
    console.log('[SMTP] Verifying connection with transporter...');
    await transporter.verify();
    isTransporterVerified = true;
    console.log('[SMTP] Transporter verified successfully.');
    return true;
  } catch (error) {
    console.error('[SMTP] Transporter verification failed:', error);
    return false;
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const transporter = getTransporter();
  const subject = 'Your RAN Fitness Verification Code';
  const body = `Your verification code is:

${otp}

Expires in 5 minutes.

If you did not request this code please ignore this email.`;

  if (!transporter) {
    console.log(`[EMAIL MOCK SEND] To: ${email}\nSubject: ${subject}\nBody: ${body}`);
    return true;
  }

  try {
    await verifyTransporter(transporter);
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text: body,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email via SMTP:', error);
    console.log(`[EMAIL FALLBACK LOG] To: ${email}\nSubject: ${subject}\nBody: ${body}`);
    return true;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const transporter = getTransporter();
  const subject = 'Welcome to RAN Fitness';
  const body = `Welcome to RAN Fitness.

Your account has been verified successfully.

You may now access your dashboard.`;

  if (!transporter) {
    console.log(`[EMAIL MOCK SEND] To: ${email}\nSubject: ${subject}\nBody: ${body}`);
    return true;
  }

  try {
    await verifyTransporter(transporter);
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text: body,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email via SMTP:', error);
    console.log(`[EMAIL FALLBACK LOG] To: ${email}\nSubject: ${subject}\nBody: ${body}`);
    return true;
  }
}
