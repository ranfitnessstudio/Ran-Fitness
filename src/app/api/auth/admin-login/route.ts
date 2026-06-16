import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth-token';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and Password are required.' },
        { status: 400 }
      );
    }

    // Retrieve admin credentials
    const credentials = await db.getAdminCredentials(username);
    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password credentials.' },
        { status: 401 }
      );
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, credentials.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password credentials.' },
        { status: 401 }
      );
    }

    // Successful login - set the cookie
    const token = await signToken(username, Date.now() + 3600000 * 2);
    const response = NextResponse.json({
      success: true,
      token
    });

    response.headers.set(
      'Set-Cookie',
      `ran_admin_session=${token}; Path=/; Max-Age=7200; SameSite=Strict; HttpOnly; Secure`
    );

    return response;
  } catch (error: any) {
    console.error('Admin authentication failure:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
