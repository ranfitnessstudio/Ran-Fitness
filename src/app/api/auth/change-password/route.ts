import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { memberId, currentPassword, newPassword } = body;

    if (!memberId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Member ID, current password, and new password are required.' },
        { status: 400 }
      );
    }

    // Retrieve member
    const member = await db.getMemberById(memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member profile not found.' },
        { status: 404 }
      );
    }

    if (!member.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Account not active. Activate account first.' },
        { status: 403 }
      );
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, member.password_hash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect current password.' },
        { status: 401 }
      );
    }

    // Validate new password strength
    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.' },
        { status: 400 }
      );
    }

    // Hash and update
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await db.updateMemberPassword(member.member_id, hashed, false);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error: any) {
    console.error('[CHANGE PASSWORD ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
