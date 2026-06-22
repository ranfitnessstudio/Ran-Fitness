import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587');
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.FROM_EMAIL || 'verification@ranfitness.com';

const getTransporter = () => {
  if (!user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

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
