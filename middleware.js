import { NextResponse } from 'next/server';

export async function middleware(request) {
  const allCookies = request.cookies.getAll();
  const currentPath = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // 1. SEARCH ENGINE PASS-THROUGH: Never block search crawlers from fetching pages
  if (
    userAgent.toLowerCase().includes('googlebot') || 
    userAgent.toLowerCase().includes('bingbot')
  ) {
    return NextResponse.next();
  }

  // 2. Scan to see if any authentication-related session cookie exists
  const hasAuthSession = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') || 
    cookie.name.toLowerCase().includes('auth') || 
    cookie.name.toLowerCase().includes('token') || 
    cookie.name.toLowerCase().includes('session')
  );

  // 3. Kick unauthenticated users away from protected dashboard directories
  if (!hasAuthSession && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
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