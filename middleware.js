import { NextResponse } from 'next/server';

export async function middleware(request) {
  const allCookies = request.cookies.getAll();
  const currentPath = request.nextUrl.pathname;

  // 1. Broad Check: See if ANY Supabase session cookie exists
  // Supabase cookies look like 'sb-xxxx-auth-token' or 'sb-access-token'
  const hasAuthCookie = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') || 
    cookie.name.includes('auth') || 
    cookie.name.includes('token')
  );

  // 2. STAGE 1 LOCKOUT: If no session cookie is found, and they aren't on /signup, send them to /signup
  if (!hasAuthCookie && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // 3. STAGE 2 SAFETY: If they ARE logged in, don't trap them on the signup page. Let them go to the simulator!
  if (hasAuthCookie && currentPath === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/simulator';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/signup',
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