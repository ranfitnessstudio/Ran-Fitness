import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, purpose } = body;

    const selectedPurpose = purpose || 'LOGIN'; // Default to LOGIN

    let targetEmail = email;
    let memberId: string | undefined = undefined;

    // Resolve target email if phone number is provided
    if (phone) {
      const { validatePhone } = require('@/lib/validation');
      if (!validatePhone(phone)) {
        return NextResponse.json(
          { success: false, error: 'Phone number must be exactly 10 digits starting with 6-9.' },
          { status: 400 }
        );
      }

      const member = await db.getMemberByPhone(phone);
      if (!member) {
        return NextResponse.json(
          { success: false, error: 'No account found with this phone number.' },
          { status: 404 }
        );
      }
      targetEmail = member.email;
      memberId = member.member_id;
    }

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number is required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address formatting.' },
        { status: 400 }
      );
    }

    // Rate Limiting: 5 requests per 15 minutes per email/IP
    // Query database for total OTP entries in the last 15 minutes for this email
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(databaseUrl);
      
      const recentCount = await sql`
        SELECT COUNT(*)::int as count FROM otp 
        WHERE email = ${targetEmail} AND created_at > NOW() - INTERVAL '15 minutes'
      `;

      if (recentCount[0].count >= 5) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again after 15 minutes.' },
          { status: 429 }
        );
      }
    }

    // If purpose is LOGIN, verify member exists
    if (selectedPurpose === 'LOGIN' && !phone) {
      const member = await db.getMemberByEmail(targetEmail);
      if (!member) {
        return NextResponse.json(
          { success: false, error: 'No account found with this email.' },
          { status: 404 }
        );
      }
      memberId = member.member_id;
    }

    // If purpose is REGISTER, verify email/phone uniqueness if provided
    if (selectedPurpose === 'REGISTER') {
      const memberByEmail = await db.getMemberByEmail(targetEmail);
      if (memberByEmail) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists.' },
          { status: 400 }
        );
      }
    }

    // Generate secure 6-digit OTP using crypto
    const crypto = require('crypto');
    let otpVal: number;
    try {
      otpVal = crypto.randomInt(100000, 999999);
    } catch {
      // Fallback if randomInt fails
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      otpVal = 100000 + (array[0] % 900000);
    }
    const otp = String(otpVal);

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes lifetime

    await db.createOtpEntry({
      member_id: memberId,
      email: targetEmail,
      otp_hash: hashedOtp,
      purpose: selectedPurpose,
      expires_at: expiresAt
    });

    // Send OTP via SMTP
    await sendOtpEmail(targetEmail, otp);

    const maskedEmail = targetEmail.replace(/^(.)(.*)(@.*)$/, (_: string, first: string, middle: string, domain: string) => {
      return first + '*'.repeat(middle.length) + domain;
    });

    const responsePayload: any = {
      success: true,
      message: `Verification code sent to ${maskedEmail}`,
      email: targetEmail
    };

    // Return OTP in dev mode for E2E validation script convenience
    if (process.env.NODE_ENV === 'development') {
      responsePayload.otp = otp;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('[SEND OTP ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
