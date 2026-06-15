import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });

  // Clear both cookies by setting Max-Age=0
  response.headers.append(
    'Set-Cookie',
    'ran_member_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly'
  );
  response.headers.append(
    'Set-Cookie',
    'ran_admin_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly'
  );

  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL('/', 'http://localhost:3000')); // fallback url path is handled by nextjs relative formatting
  
  response.headers.append(
    'Set-Cookie',
    'ran_member_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly'
  );
  response.headers.append(
    'Set-Cookie',
    'ran_admin_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly'
  );

  return response;
}
