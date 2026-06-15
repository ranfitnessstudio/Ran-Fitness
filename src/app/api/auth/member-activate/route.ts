import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, member_id, password } = body;

    if (!phone || !member_id || !password) {
      return NextResponse.json(
        { success: false, error: 'Phone number, Member ID, and Password are required.' },
        { status: 400 }
      );
    }

    // Retrieve member
    const member = await db.getMemberByPhone(phone);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'No member found with this phone number.' },
        { status: 404 }
      );
    }

    // Verify Member ID
    if (member.member_id.trim().toUpperCase() !== member_id.trim().toUpperCase()) {
      return NextResponse.json(
        { success: false, error: 'Member ID does not match our records.' },
        { status: 400 }
      );
    }

    // Check if already active with a password (optional check, but good for security)
    if (member.password_hash) {
      // Member is already activated
      return NextResponse.json(
        { success: false, error: 'Account is already activated. Please log in.' },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    const pwUpdated = await db.updateMemberPassword(member.member_id, passwordHash);
    if (!pwUpdated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update member credentials.' },
        { status: 500 }
      );
    }

    // Update status to Active
    await db.saveMember({
      ...member,
      status: 'Active',
      password_hash: passwordHash // keep password hash
    });

    console.log(`[MEMBER ACTIVATED] Phone: ${phone}, Member ID: ${member_id}`);

    return NextResponse.json({
      success: true,
      message: 'Account successfully activated. You can now log in.'
    });
  } catch (error: unknown) {
    console.error('[MEMBER ACTIVATE ERROR]', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
