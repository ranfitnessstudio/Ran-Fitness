import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { validateEmail } from '@/lib/validation';
import { generateMemberSessionCookieValue } from '@/lib/auth-token';

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
      if (!validateEmail(identifier)) {
        console.log(`[MEMBER-LOGIN-AUDIT] Email formatting check failed: ${identifier}`);
        return NextResponse.json(
          { success: false, error: 'Invalid email address format.' },
          { status: 400 }
        );
      }
    } else {
      const isValidPhone = /^\+?\d{8,15}$/.test(identifier);
      if (!isValidPhone) {
        console.log(`[MEMBER-LOGIN-AUDIT] Phone formatting check failed: ${identifier}`);
        return NextResponse.json(
          { success: false, error: 'Phone number must be between 8 and 15 digits.' },
          { status: 400 }
        );
      }
    }

    // Retrieve member
    console.log(`[MEMBER-LOGIN-AUDIT] Running db lookup for: ${identifier}`);
    const members = isEmail
      ? await db.getMembersByEmail(identifier)
      : await db.getMembersByPhone(identifier);

    if (!members || members.length === 0) {
      console.log(`[MEMBER-LOGIN-AUDIT] Member lookup failed: No record found for ${identifier}`);
      return NextResponse.json(
        { success: false, error: 'Invalid identifier or password.' },
        { status: 401 }
      );
    }

    // Lockout Check
    let allLocked = true;
    let lockoutMessage = '';
    const activeMembers = [];

    for (const member of members) {
      if (member.lockout_until && new Date(member.lockout_until).getTime() > Date.now()) {
        console.log(`[MEMBER-LOGIN-AUDIT] Member ${member.member_id} is currently locked out until ${member.lockout_until}.`);
        lockoutMessage = `Account locked due to too many failed attempts. Try again after ${new Date(member.lockout_until).toLocaleTimeString()}.`;
      } else {
        allLocked = false;
        activeMembers.push(member);
      }
    }

    if (activeMembers.length === 0 && allLocked) {
      return NextResponse.json(
        { success: false, error: lockoutMessage || 'Account is currently locked out.' },
        { status: 423 }
      );
    }

    console.log(`[MEMBER-LOGIN-AUDIT] Members found: ${activeMembers.length} active. Scanning for password match.`);

    let matchedMember = null;
    for (const member of activeMembers) {
      console.log(`[MEMBER-LOGIN-AUDIT] Checking member: ${member.member_id}, Status: ${member.status}, Force Reset: ${member.force_reset}, Password Hash length: ${member.password_hash ? member.password_hash.length : 0}`);
      
      // Check if account has been activated (has password_hash)
      if (!member.password_hash) {
        console.log(`[MEMBER-LOGIN-AUDIT] Member ${member.member_id} does not have password hash. Skipping.`);
        continue;
      }

      // Verify Password
      console.log(`[MEMBER-LOGIN-AUDIT] Comparing password against hash via bcrypt for member ${member.member_id}.`);
      const passwordMatch = await bcrypt.compare(password, member.password_hash);
      console.log(`[MEMBER-LOGIN-AUDIT] Bcrypt match result for member ${member.member_id}: ${passwordMatch}`);
      
      if (passwordMatch) {
        matchedMember = member;
        break;
      }
    }

    if (!matchedMember) {
      console.log(`[MEMBER-LOGIN-AUDIT] No matching member password hash found in the list.`);
      // Increment login attempts for all active matched members
      for (const member of activeMembers) {
        const updated = await db.incrementLoginAttempts(member.member_id);
        if (updated && updated.login_attempts >= 5) {
          await db.lockoutAccount(member.member_id, 15); // 15 mins lockout
          console.log(`[MEMBER-LOGIN-AUDIT] Member ${member.member_id} locked out due to consecutive failures.`);
        }
      }
      return NextResponse.json(
        { success: false, error: 'Invalid identifier or password.' },
        { status: 401 }
      );
    }

    const member = matchedMember;

    // Check if activated
    if (!member.account_activated) {
      console.log(`[MEMBER-LOGIN-AUDIT] Account is not activated.`);
      return NextResponse.json(
        { success: false, error: 'Please activate your gym account first.' },
        { status: 403 }
      );
    }

    // Reset login attempts on successful auth
    await db.resetLoginAttempts(member.member_id);

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

    const signedCookieVal = await generateMemberSessionCookieValue(member.member_id, member.password_hash);

    // Set ran_member_session cookie with member_id and SameSite=Strict
    response.headers.set(
      'Set-Cookie',
      `ran_member_session=${signedCookieVal}; Path=/; Max-Age=7200; SameSite=Strict; HttpOnly; Secure`
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
