import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = body.identifier || body.email || body.phone;
    const { password } = body;

    console.log(`[MEMBER-LOGIN-AUDIT] Request received. Identifier: ${identifier}, Password provided: ${password ? 'YES (length: ' + password.length + ')' : 'NO'}`);

    if (!identifier || !password) {
      console.log(`[MEMBER-LOGIN-AUDIT] Missing credentials.`);
      return NextResponse.json(
        { success: false, error: 'Identifier (Email/Phone) and Password are required.' },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes('@');
    if (isEmail) {
      console.log(`[MEMBER-LOGIN-AUDIT] Identifier detected as email.`);
      const { validateEmail } = require('@/lib/validation');
      if (!validateEmail(identifier)) {
        console.log(`[MEMBER-LOGIN-AUDIT] Email formatting check failed: ${identifier}`);
        return NextResponse.json(
          { success: false, error: 'Invalid email address format.' },
          { status: 400 }
        );
      }
    } else {
      console.log(`[MEMBER-LOGIN-AUDIT] Identifier detected as phone.`);
      const { validatePhone } = require('@/lib/validation');
      if (!validatePhone(identifier)) {
        console.log(`[MEMBER-LOGIN-AUDIT] Phone formatting check failed: ${identifier}`);
        return NextResponse.json(
          { success: false, error: 'Phone number must be exactly 10 digits starting with 6-9.' },
          { status: 400 }
        );
      }
    }

    // Retrieve member
    console.log(`[MEMBER-LOGIN-AUDIT] Running db lookup for: ${identifier}`);
    const member = isEmail
      ? await db.getMemberByEmail(identifier)
      : await db.getMemberByPhone(identifier);

    if (!member) {
      console.log(`[MEMBER-LOGIN-AUDIT] Member lookup failed: No record found for ${identifier}`);
      return NextResponse.json(
        { success: false, error: 'Invalid identifier or password.' },
        { status: 401 }
      );
    }

    console.log(`[MEMBER-LOGIN-AUDIT] Member found. Member ID: ${member.member_id}, Name: ${member.name}, Status: ${member.status}, Force Reset: ${member.force_reset}, Password Hash length: ${member.password_hash ? member.password_hash.length : 0}`);

    // Check if account has been activated (has password_hash)
    if (!member.password_hash) {
      console.log(`[MEMBER-LOGIN-AUDIT] Member does not have password hash. Activation required.`);
      return NextResponse.json(
        { success: false, error: 'Account not activated yet. Please activate your account first.' },
        { status: 403 }
      );
    }

    // Verify Password
    console.log(`[MEMBER-LOGIN-AUDIT] Comparing password against hash via bcrypt.`);
    const passwordMatch = await bcrypt.compare(password, member.password_hash);
    console.log(`[MEMBER-LOGIN-AUDIT] Bcrypt match result: ${passwordMatch}`);
    if (!passwordMatch) {
      console.log(`[MEMBER-LOGIN-AUDIT] Bcrypt mismatch for member: ${member.member_id}`);
      return NextResponse.json(
        { success: false, error: 'Invalid identifier or password.' },
        { status: 401 }
      );
    }

    // Check if suspended
    if (member.status === 'Suspended') {
      console.log(`[MEMBER-LOGIN-AUDIT] Account is suspended.`);
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact gym administration.' },
        { status: 403 }
      );
    }

    // Successful login - set the cookie
    console.log(`[MEMBER-LOGIN-AUDIT] Password verified. Creating session.`);
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

    console.log(`[MEMBER-LOGIN-AUDIT] Cookie established. Login complete.`);

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
