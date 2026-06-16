import { NextResponse, NextRequest } from 'next/server';

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

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const response = NextResponse.redirect(url);
  
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
