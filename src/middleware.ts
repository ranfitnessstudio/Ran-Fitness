import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin CMS and sensitive API routes
  if (
    pathname.startsWith('/admin') || 
    (pathname.startsWith('/api/analytics') && request.method === 'GET') || 
    pathname.startsWith('/api/ai-status')
  ) {
    const adminSession = request.cookies.get('ran_admin_session');
    let isValid = false;
    
    if (adminSession?.value) {
      const username = await verifyToken(adminSession.value);
      if (username) {
        isValid = true;
      }
    }

    if (!isValid) {
      // For API calls, return JSON with 401 Unauthorized status
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized CMS operation' },
          { status: 401 }
        );
      }
      
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Protect Member Dashboard
  if (pathname.startsWith('/member-dashboard')) {
    const memberSession = request.cookies.get('ran_member_session');
    if (!memberSession || memberSession.value.split('.').length !== 2) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member-dashboard/:path*', '/api/db', '/api/analytics', '/api/ai-status'],
};
