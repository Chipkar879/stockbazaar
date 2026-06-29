import { NextResponse } from 'next/server';

export async function middleware(request) {
  // 1. Grab all active cookies passing through the request header
  const allCookies = request.cookies.getAll();
  
  // 2. Scan to see if any Supabase authentication cookies are present
  const hasAuthCookie = allCookies.some(cookie => cookie.name.startsWith('sb-'));

  // 3. Fallback check for standard explicit session tokens
  const hasSessionToken = request.cookies.has('sb-access-token') || request.cookies.has('supabase-auth-token');

  // 4. STRICT LOCKOUT: If no auth markers exist, force redirect to the local /signup folder
  if (!hasAuthCookie && !hasSessionToken) {
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  // 5. If cookies exist, let them through to the dashboard pages
  return NextResponse.next();
}

// 6. THE EXPLICIT SECURITY MATCHER
export const config = {
  matcher: [
    '/simulator',
    '/simulator/:path*',
    '/courses',
    '/courses/:path*',
    '/quiz',
    '/quiz/:path*',
    '/leaderboard',
    '/leaderboard/:path*',
  ],
};