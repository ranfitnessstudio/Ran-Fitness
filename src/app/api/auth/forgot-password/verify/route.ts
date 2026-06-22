import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { hashSha256 } from '@/lib/auth-token';

const JWT_SECRET = process.env.JWT_SECRET || 'ran_fitness_super_secure_jwt_secret_token_2026';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required.' },
        { status: 400 }
      );
    }

    console.log(`[PASSWORD-VERIFY-AUDIT] Request received. Email/phone lookup key: ${email}, OTP entered: ${otp}`);
    const token = await db.getPasswordResetToken(email);
    if (!token) {
      console.log(`[PASSWORD-VERIFY-AUDIT] Active recovery token not found or expired for key: ${email}`);
      return NextResponse.json(
        { success: false, error: 'OTP has expired or is invalid.' },
        { status: 400 }
      );
    }

    console.log(`[PASSWORD-VERIFY-AUDIT] Token found. ID: ${token.id}, Member ID: ${token.member_id}, Attempt count: ${token.attempts}`);

    // Check attempts limit (max 5 attempts per token)
    if (token.attempts >= 5) {
      console.log(`[PASSWORD-VERIFY-AUDIT] Token invalidated due to too many failed attempts (ID: ${token.id})`);
      await db.markResetTokenUsed(token.id);
      return NextResponse.json(
        { success: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Compare Hashed OTP
    const isOtpValid = await bcrypt.compare(otp, token.otp_hash);
    console.log(`[PASSWORD-VERIFY-AUDIT] Bcrypt OTP comparison result: ${isOtpValid}`);
    if (!isOtpValid) {
      // Increment attempt counter
      await db.incrementResetTokenAttempts(token.id);
      const remaining = 5 - (token.attempts + 1);
      console.log(`[PASSWORD-VERIFY-AUDIT] OTP mismatch. ${remaining} attempts remaining.`);
      if (remaining <= 0) {
        await db.markResetTokenUsed(token.id);
        return NextResponse.json(
          { success: false, error: 'OTP invalidated due to too many failed attempts. Please request a new OTP.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Invalid OTP. ${remaining} attempts remaining.` },
        { status: 400 }
      );
    }

    // OTP is correct! Invalidate the reset token
    console.log(`[PASSWORD-VERIFY-AUDIT] OTP matches. Marking token as used.`);
    await db.markResetTokenUsed(token.id);

    // Create a temporary secure password reset token (valid for 5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const rawSig = `${token.member_id}.${expiresAt}.${JWT_SECRET}`;
    const signature = await hashSha256(rawSig);
    const resetToken = `${token.member_id}.${expiresAt}.${signature}`;
    console.log(`[PASSWORD-VERIFY-AUDIT] Reset session token generated for member: ${token.member_id}`);

    return NextResponse.json({
      success: true,
      resetToken
    });
  } catch (error: any) {
    console.error('[FORGOT PASSWORD VERIFY ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
