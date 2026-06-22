import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';
import { verifyMemberSessionCookie } from '@/lib/auth-token';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('ran_member_session');

    if (!session || !session.value) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active session' },
        { status: 401 }
      );
    }

    const parts = session.value.split('.');
    if (parts.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid session format' },
        { status: 401 }
      );
    }

    const memberId = parts[0];
    const member = await db.getMemberById(memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Member not found' },
        { status: 401 }
      );
    }

    const isValid = await verifyMemberSessionCookie(session.value, member.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session signature mismatch' },
        { status: 401 }
      );
    }

    // Omit sensitive info
    const { password_hash, ...safeMember } = member;

    return NextResponse.json({
      success: true,
      member: safeMember
    });
  } catch (error: any) {
    console.error('[SESSION GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
