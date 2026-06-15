import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin CMS
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('ran_admin_session');
    if (!adminSession || adminSession.value !== 'valid') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      // Pass query param to show login if desired, or just redirect
      return NextResponse.redirect(url);
    }
  }

  // Protect Member Dashboard
  if (pathname.startsWith('/member-dashboard')) {
    const memberSession = request.cookies.get('ran_member_session');
    if (!memberSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member-dashboard/:path*'],
};
