import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { generateMemberSessionCookieValue } from '@/lib/auth-token';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otp, purpose, registrationData } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required.' },
        { status: 400 }
      );
    }

    const selectedPurpose = purpose || 'LOGIN';

    // Retrieve active OTP record
    const otpRecord = await db.getOtpEntry(email, selectedPurpose);
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    // Expiry check
    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired.' },
        { status: 400 }
      );
    }

    // Verify OTP code matches stored hash
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (isOtpValid) {
      // Mark OTP as used
      await db.markOtpUsed(otpRecord.id);

      let member: any = null;

      if (selectedPurpose === 'REGISTER') {
        if (!registrationData || !registrationData.phone || !registrationData.password) {
          return NextResponse.json(
            { success: false, error: 'Registration details (including password) are missing.' },
            { status: 400 }
          );
        }

        // Retrieve existing member using email and phone
        const memberLookup = await db.getMemberByEmailAndPhone(email, registrationData.phone);
        if (!memberLookup) {
          return NextResponse.json(
            { success: false, error: 'No active gym membership found. Please contact reception.' },
            { status: 404 }
          );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);

        // Activate the member
        member = await db.activateMemberAccount(memberLookup.member_id, hashedPassword);

        // Dispatch Welcome Email
        if (member) {
          await sendWelcomeEmail(email, member.name);
        }
      } else {
        member = await db.getMemberByEmail(email);
      }

      if (!member) {
        return NextResponse.json(
          { success: false, error: 'Member profile could not be retrieved.' },
          { status: 404 }
        );
      }

      // Create authenticated session
      const cookieValue = await generateMemberSessionCookieValue(member.member_id, member.password_hash);
      
      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        member
      });

      // Set HttpOnly secure session cookie with SameSite=Strict
      response.cookies.set('ran_member_session', cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 Days
      });

      return response;
    } else {
      // Increment attempts
      const updatedRecord = await db.incrementOtpAttempts(otpRecord.id);
      const remaining = 5 - updatedRecord.attempts;

      if (updatedRecord.attempts >= 5) {
        await db.markOtpUsed(otpRecord.id);
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
  } catch (error: any) {
    console.error('[VERIFY OTP ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify code.' },
      { status: 500 }
    );
  }
}
