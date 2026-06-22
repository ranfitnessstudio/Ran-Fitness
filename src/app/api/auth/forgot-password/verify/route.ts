import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { hashSha256 } from '@/lib/auth-token';

const JWT_SECRET = process.env.JWT_SECRET || 'ran_fitness_super_secure_jwt_secret_token_2026';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required.' },
        { status: 400 }
      );
    }

    const token = await db.getPasswordResetToken(phone);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired or is invalid.' },
        { status: 400 }
      );
    }

    // Check attempts limit (max 5 attempts per token)
    if (token.attempts >= 5) {
      await db.markResetTokenUsed(token.id);
      return NextResponse.json(
        { success: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Compare Hashed OTP
    const isOtpValid = await bcrypt.compare(otp, token.otp_hash);
    if (!isOtpValid) {
      // Increment attempt counter
      await db.incrementResetTokenAttempts(token.id);
      const remaining = 5 - (token.attempts + 1);
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
    await db.markResetTokenUsed(token.id);

    // Create a temporary secure password reset token (valid for 5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const rawSig = `${token.member_id}.${expiresAt}.${JWT_SECRET}`;
    const signature = await hashSha256(rawSig);
    const resetToken = `${token.member_id}.${expiresAt}.${signature}`;

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
