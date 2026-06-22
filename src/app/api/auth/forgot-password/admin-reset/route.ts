import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('ran_admin_session');
    
    if (!adminSession || !adminSession.value) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const adminUsername = await verifyToken(adminSession.value);
    if (!adminUsername) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Invalid admin session token.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { memberId, tempPassword, forceReset } = body;

    if (!memberId || !tempPassword) {
      return NextResponse.json(
        { success: false, error: 'Member ID and temporary password are required.' },
        { status: 400 }
      );
    }

    const member = await db.getMemberById(memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member profile not found.' },
        { status: 404 }
      );
    }

    // Hash the temporary password
    const hashed = await bcrypt.hash(tempPassword, 10);

    // Save password
    await db.updateMemberPassword(memberId, hashed, forceReset === true);

    // Log administrative action
    await db.savePasswordResetAudit({
      member_id: memberId,
      admin_id: adminUsername,
      action: `ADMIN_RESET_PASSWORD_TEMP_GENERATED_FORCE_${String(forceReset).toUpperCase()}`
    });

    console.log(`[ADMIN PASSWORD RECOVERY] Reset password for ${memberId}. Force reset: ${forceReset}`);

    return NextResponse.json({
      success: true,
      message: 'Temporary password set and action logged successfully.'
    });
  } catch (error: any) {
    console.error('[ADMIN PASSWORD RESET API ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
