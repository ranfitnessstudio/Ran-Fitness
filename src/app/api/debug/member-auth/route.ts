import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development mode' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const identifier = body.identifier || body.email || body.phone;
    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const member = isEmail 
      ? await db.getMemberByEmail(identifier) 
      : await db.getMemberByPhone(identifier);

    if (!member) {
      return NextResponse.json({
        memberFound: false,
        emailVerified: false,
        passwordHashExists: false,
        forceReset: false,
        accountStatus: 'NotFound'
      });
    }

    return NextResponse.json({
      memberFound: true,
      emailVerified: !!member.email_verified || false,
      passwordHashExists: !!member.password_hash,
      forceReset: member.force_reset || false,
      accountStatus: member.status || 'Unknown'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
