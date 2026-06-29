import { NextResponse } from 'next/server';

export async function middleware(request) {
  // 1. Grab all active cookies passing through the request header
  const allCookies = request.cookies.getAll();
  
  // 2. Comprehensive structural check: Look for ANY Supabase or authentication marker
  const hasAuthMarker = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') || 
    cookie.name.includes('auth') || 
    cookie.name.includes('token') ||
    cookie.name.includes('session')
  );

  // 3. STRICT LOCKOUT: If no auth markers exist at all, force redirect to the local /signup folder
  if (!hasAuthMarker) {
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  // 4. If cookies exist, let them through to the dashboard pages safely
  return NextResponse.next();
}

// 5. THE EXPLICIT SECURITY MATCHER
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
    '/profile',
    '/profile/:path*',
  ],
};