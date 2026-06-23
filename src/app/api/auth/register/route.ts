import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';
import { validatePassword, validatePhone } from '@/lib/validation';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, password, confirmPassword } = body;

    // Standard validations
    if (!email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, phone number, password, and confirm password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address formatting.' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be exactly 10 digits starting with 6-9.' },
        { status: 400 }
      );
    }

    // Pre-registered lookup
    let member;
    try {
      member = await db.getMemberByEmailAndPhone(email, phone);
    } catch (lookupErr) {
      console.error("[ACTIVATION LOOKUP ERROR]", lookupErr);
      throw lookupErr;
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'No active gym membership found. Please contact reception.' },
        { status: 400 }
      );
    }

    // Already activated check
    if (member.account_activated || member.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Account already activated. Please login.' },
        { status: 400 }
      );
    }

    // Rate Limiting check: 5 requests per 15 minutes per email/IP
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const sql = neon(databaseUrl);
      const recentCount = await sql`
        SELECT COUNT(*)::int as count FROM otp 
        WHERE email = ${email} AND created_at > NOW() - INTERVAL '15 minutes'
      `;

      if (recentCount[0].count >= 5) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again after 15 minutes.' },
          { status: 429 }
        );
      }
    }

    // Generate secure 6-digit OTP
    let otpVal: number;
    try {
      otpVal = crypto.randomInt(100000, 999999);
    } catch {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      otpVal = 100000 + (array[0] % 900000);
    }
    const otp = String(otpVal);

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    await db.createOtpEntry({
      email,
      otp_hash: hashedOtp,
      purpose: 'REGISTER',
      expires_at: expiresAt
    });

    // Send register verification code
    await sendOtpEmail(email, otp);

    const responsePayload: any = {
      success: true,
      message: 'Verification OTP sent successfully.',
      email
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.otp = otp;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("[REGISTER ROUTE ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      },
      { status: 500 }
    );
  }
}
