import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = body.identifier || body.email || body.phone;
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Identifier (Email/Phone) and Password are required.' },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes('@');
    if (isEmail) {
      const { validateEmail } = require('@/lib/validation');
      if (!validateEmail(identifier)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address format.' },
          { status: 400 }
        );
      }
    } else {
      const { validatePhone } = require('@/lib/validation');
      if (!validatePhone(identifier)) {
        return NextResponse.json(
          { success: false, error: 'Phone number must be exactly 10 digits starting with 6-9.' },
          { status: 400 }
        );
      }
    }

    // Retrieve member
    const member = isEmail
      ? await db.getMemberByEmail(identifier)
      : await db.getMemberByPhone(identifier);

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Invalid identifier or password.' },
        { status: 401 }
      );
    }

    // Check if account has been activated (has password_hash)
    if (!member.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Account not activated yet. Please activate your account first.' },
        { status: 403 }
      );
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, member.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid identifier or password.' },
        { status: 401 }
      );
    }

    // Check if suspended
    if (member.status === 'Suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact gym administration.' },
        { status: 403 }
      );
    }

    // Successful login - set the cookie
    const response = NextResponse.json({
      success: true,
      member: {
        id: member.id,
        member_id: member.member_id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        membership_type: member.membership_type,
        start_date: member.start_date,
        end_date: member.end_date,
        status: member.status,
        force_reset: member.force_reset
      }
    });

    const { generateMemberSessionCookieValue } = require('@/lib/auth-token');
    const signedCookieVal = await generateMemberSessionCookieValue(member.member_id, member.password_hash);

    // Set ran_member_session cookie with member_id
    response.headers.set(
      'Set-Cookie',
      `ran_member_session=${signedCookieVal}; Path=/; Max-Age=7200; SameSite=Lax; HttpOnly`
    );

    console.log(`[MEMBER LOGGED IN] Member ID: ${member.member_id}, Name: ${member.name}`);

    return response;
  } catch (error: unknown) {
    console.error('[MEMBER LOGIN ERROR]', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
