import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, purpose } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const selectedPurpose = purpose || 'LOGIN';

    // Retrieve active OTP record
    const otpRecord = await db.getOtpEntry(email, selectedPurpose);
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'No active OTP session found. Please start over.' },
        { status: 400 }
      );
    }

    // Cooldown check (60 seconds)
    const timeSinceLastSent = Date.now() - new Date(otpRecord.last_sent_at).getTime();
    if (timeSinceLastSent < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - timeSinceLastSent) / 1000);
      return NextResponse.json(
        { success: false, error: `Please wait ${waitSeconds} seconds before requesting another code.` },
        { status: 400 }
      );
    }

    // Resend count check (max 3 resends)
    if (otpRecord.resend_count >= 3) {
      return NextResponse.json(
        { success: false, error: 'Maximum resend limit reached. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Generate new OTP
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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Reset to 5 mins

    // Update in database using custom query or directly updating the row via sql
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(databaseUrl);
      await sql`
        UPDATE otp 
        SET otp_hash = ${hashedOtp}, 
            resend_count = resend_count + 1, 
            last_sent_at = NOW(), 
            expires_at = ${expiresAt}, 
            attempts = 0 
        WHERE id = ${otpRecord.id}
      `;
    }

    // Dispatch email
    await sendOtpEmail(email, otp);

    const responsePayload: any = {
      success: true,
      message: 'Verification code resent successfully.',
      email
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.otp = otp;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('[RESEND OTP ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend code.' },
      { status: 500 }
    );
  }
}
