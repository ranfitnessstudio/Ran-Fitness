import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { hashSha256 } from '@/lib/auth-token';
import { validatePassword } from '@/lib/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'ran_fitness_super_secure_jwt_secret_token_2026';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { resetToken, password, confirmPassword } = body;
    if (!password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Matching passwords are required.' },
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
        { success: false, error: 'Password does not meet complexity requirements.' },
        { status: 400 }
      );
    }

    let memberId = '';

    if (resetToken) {
      // Validate Reset Token signature and expiry
      const parts = resetToken.split('.');
      if (parts.length !== 3) {
        return NextResponse.json(
          { success: false, error: 'Invalid or corrupted reset token.' },
          { status: 400 }
        );
      }

      const [mId, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);

      if (expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'Reset session has expired. Please request a new OTP.' },
          { status: 400 }
        );
      }

      const expectedSig = await hashSha256(`${mId}.${expiresAtStr}.${JWT_SECRET}`);
      if (signature !== expectedSig) {
        return NextResponse.json(
          { success: false, error: 'Reset token signature validation failed.' },
          { status: 403 }
        );
      }
      memberId = mId;
    } else {
      // Fallback to active member session cookie
      const { cookies } = require('next/headers');
      const cookieStore = await cookies();
      const session = cookieStore.get('ran_member_session');
      if (!session || !session.value) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized reset request. Reset token or active session required.' },
          { status: 401 }
        );
      }

      const parts = session.value.split('.');
      memberId = parts[0];
      const checkMember = await db.getMemberById(memberId);
      if (!checkMember) {
        return NextResponse.json(
          { success: false, error: 'Member not found.' },
          { status: 404 }
        );
      }

      const { verifyMemberSessionCookie } = require('@/lib/auth-token');
      const isValid = await verifyMemberSessionCookie(session.value, checkMember.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Session signature verification failed.' },
          { status: 401 }
        );
      }
    }

    // Retrieve member to check if active/suspended
    const member = await db.getMemberById(memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member profile not found.' },
        { status: 404 }
      );
    }

    if (member.status === 'Suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Recovery is blocked.' },
        { status: 403 }
      );
    }

    // Hash and update the password
    const hashed = await bcrypt.hash(password, 10);
    const updated = await db.updateMemberPassword(memberId, hashed, false);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to save updated password.' },
        { status: 500 }
      );
    }

    // Create logout/invalidation response header to force login
    const response = NextResponse.json({
      success: true,
      message: 'Password successfully reset! Please log in with your new password.'
    });

    response.headers.set(
      'Set-Cookie',
      `ran_member_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`
    );

    console.log(`[PASSWORD RESET SUCCESS] Member: ${memberId}`);

    return response;
  } catch (error: any) {
    console.error('[PASSWORD RESET ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
