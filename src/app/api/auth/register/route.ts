import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { validatePassword, validatePhone } from '@/lib/validation';
import { generateMemberSessionCookieValue } from '@/lib/auth-token';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, password, confirmPassword } = body;

    console.log(`[ACTIVATION LOOKUP] Email: ${email}, Phone: ${phone ? phone.substring(0, 4) + '****' : 'MISSING'}`);

    // ── Input validation ──────────────────────────────────────
    if (!email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, phone number, password, and confirm password are required.' },
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
        { success: false, error: 'Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address formatting.' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be exactly 10 digits starting with 6-9.' },
        { status: 400 }
      );
    }

    // ── CMS member lookup (email + phone) ─────────────────────
    let member;
    try {
      member = await db.getMemberByEmailAndPhone(email, phone);
    } catch (lookupErr) {
      console.error("[ACTIVATION LOOKUP ERROR]", lookupErr);
      throw lookupErr;
    }

    if (!member) {
      console.log(`[ACTIVATION LOOKUP] No CMS member found for email=${email}, phone=${phone}`);
      return NextResponse.json(
        { success: false, error: 'No active gym membership found. Please contact reception.' },
        { status: 404 }
      );
    }

    // ── Already activated check ───────────────────────────────
    if (member.account_activated || member.password_hash) {
      console.log(`[ACTIVATION LOOKUP] Member ${member.member_id} already activated.`);
      return NextResponse.json(
        { success: false, error: 'Account already activated. Please login.' },
        { status: 400 }
      );
    }

    // ── Direct activation: hash password and activate ─────────
    const hashedPassword = await bcrypt.hash(password, 10);
    const activatedMember = await db.activateMemberAccount(member.member_id, hashedPassword);

    if (!activatedMember) {
      console.error(`[ACTIVATION ERROR] activateMemberAccount returned null for ${member.member_id}`);
      return NextResponse.json(
        { success: false, error: 'Account activation failed. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`[ACCOUNT ACTIVATED] member_id=${activatedMember.member_id}, email=${email}`);

    // ── Auto-login: create session cookie ─────────────────────
    const cookieValue = await generateMemberSessionCookieValue(
      activatedMember.member_id,
      activatedMember.password_hash
    );

    const response = NextResponse.json({
      success: true,
      message: 'Account activated successfully.',
      member: {
        id: activatedMember.id,
        member_id: activatedMember.member_id,
        name: activatedMember.name,
        email: activatedMember.email,
        phone: activatedMember.phone,
        membership_type: activatedMember.membership_type,
        start_date: activatedMember.start_date,
        end_date: activatedMember.end_date,
        status: activatedMember.status
      }
    });

    response.cookies.set('ran_member_session', cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7200 // 2 hours — matches member-login
    });

    console.log(`[ACCOUNT ACTIVATED] Session cookie set for ${activatedMember.member_id}. Activation complete.`);

    return response;
  } catch (error: unknown) {
    console.error("[REGISTER ROUTE ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Activation failed'
      },
      { status: 500 }
    );
  }
}
