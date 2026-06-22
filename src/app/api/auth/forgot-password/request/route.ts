import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const { validateEmail } = require('@/lib/validation');
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Rate Limiting check (max 5 requests per hour per email/IP)
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(databaseUrl);
      const recentTokens = await sql`
        SELECT created_at FROM password_reset_tokens 
        WHERE email = ${email} AND created_at > NOW() - INTERVAL '1 hour'
        ORDER BY created_at DESC
      `;

      if (recentTokens.length >= 5) {
        const lastTokenTime = new Date(recentTokens[0].created_at).getTime();
        const lockoutThreshold = 15 * 60 * 1000; // 15 minutes lockout
        if (Date.now() - lastTokenTime < lockoutThreshold) {
          return NextResponse.json(
            { success: false, error: 'Too many requests. Please try again after 15 minutes.' },
            { status: 429 }
          );
        }
      }
    }

    // Retrieve member
    console.log(`[PASSWORD-REQUEST-AUDIT] Looking up member by email: ${email}`);
    const member = await db.getMemberByEmail(email);
    if (!member) {
      console.log(`[PASSWORD-REQUEST-AUDIT] Member not found for email: ${email}. Returning generic success.`);
      // Return generic success to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: 'If the account exists, recovery instructions have been sent.'
      });
    }

    console.log(`[PASSWORD-REQUEST-AUDIT] Member found. ID: ${member.member_id}, Name: ${member.name}, Phone: ${member.phone}`);

    // Check cooldown on existing token if any
    const existingToken = await db.getPasswordResetToken(email);
    if (existingToken) {
      console.log(`[PASSWORD-REQUEST-AUDIT] Active token already exists (resends: ${existingToken.resend_count}, last sent: ${existingToken.last_sent_at})`);
      const timeSinceLastSent = Date.now() - new Date(existingToken.last_sent_at).getTime();
      if (timeSinceLastSent < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeSinceLastSent) / 1000);
        console.log(`[PASSWORD-REQUEST-AUDIT] Cooldown block. Wait: ${waitSeconds}s`);
        return NextResponse.json(
          { success: false, error: `Please wait ${waitSeconds} seconds before requesting another code.` },
          { status: 400 }
        );
      }
    }

    // Generate secure 6-digit OTP
    const crypto = require('crypto');
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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    await db.createPasswordResetToken({
      member_id: member.member_id,
      phone: member.phone,
      email: member.email,
      otp_hash: hashedOtp,
      expires_at: expiresAt
    });

    // Send OTP email via SMTP
    await sendOtpEmail(email, otp);

    // Delete expired tokens automatically to clean up database
    await db.deleteExpiredResetTokens().catch(() => {});

    const responsePayload: any = {
      success: true,
      message: 'If the account exists, recovery instructions have been sent.'
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.otp = otp;
    }

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error('[FORGOT PASSWORD REQUEST ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
