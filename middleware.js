import { NextResponse } from 'next/server';

export async function middleware(request) {
  const allCookies = request.cookies.getAll();
  const currentPath = request.nextUrl.pathname;

  // 1. Check if ANY authentication-related cookie exists in the headers
  const hasAuthSession = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') || 
    cookie.name.toLowerCase().includes('auth') || 
    cookie.name.toLowerCase().includes('token') || 
    cookie.name.toLowerCase().includes('session')
  );

  // 2. KICK OUT UNAUTHENTICATED USERS: 
  // If they have no session cookies and are trying to access protected paths, send them to signup
  if (!hasAuthSession && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // 3. ALLOW LOGGED IN USERS THROUGH:
  // If they have session cookies, let them view the page normally.
  // Note: We removed the strict redirect away from '/signup' to prevent loop traps!
  return NextResponse.next();
}

// 4. THE EXPLICIT MATCHING GATEWAYS
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