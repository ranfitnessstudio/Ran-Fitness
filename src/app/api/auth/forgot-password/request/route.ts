import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const { validatePhone } = require('@/lib/validation');
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be exactly 10 digits starting with 6-9.' },
        { status: 400 }
      );
    }

    // Rate Limiting check (max 5 requests per hour)
    // We can query database for tokens generated in the last hour
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(databaseUrl);
      const recentTokens = await sql`
        SELECT created_at FROM password_reset_tokens 
        WHERE phone = ${phone} AND created_at > NOW() - INTERVAL '1 hour'
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
    const member = await db.getMemberByPhone(phone);
    if (!member) {
      // Return generic success to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: 'If the account exists, recovery instructions have been sent.'
      });
    }

    // Generate secure 6-digit OTP
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const otp = String(100000 + (array[0] % 900000));

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    await db.createPasswordResetToken({
      member_id: member.member_id,
      phone,
      otp_hash: hashedOtp,
      expires_at: expiresAt
    });

    // In development mode, print OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEVELOPER OTP Recovery Mode] OTP for member ${member.member_id} (${phone}): ${otp}`);
    } else {
      // Production fallback - print to log for testing or simulated SMS
      console.log(`[PRODUCTION OTP MOCK SEND] OTP generated for member ${member.member_id}: ${otp}`);
    }

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
