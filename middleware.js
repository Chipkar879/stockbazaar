import { NextResponse } from 'next/server';

export async function middleware(request) {
  const allCookies = request.cookies.getAll();
  const currentPath = request.nextUrl.pathname;

  // Scan to see if the cookie written by our custom storage adapter is present
  const hasAuthCookie = allCookies.some(cookie => 
    cookie.name.includes('supabase-auth-token') || 
    cookie.name.startsWith('sb-')
  );

  // 1. If not logged in and trying to view restricted routes, kick to signup
  if (!hasAuthCookie && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // 2. If logged in and trying to go to signup, forward to simulator dashboard
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