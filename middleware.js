import { NextResponse } from 'next/server';

export async function middleware(request) {
  // 1. Get all cookies from the incoming request header
  const allCookies = request.cookies.getAll();

  // 2. Look for any active Supabase authentication token cookie
  // Supabase stores chunks starting with "sb-" followed by your project configuration reference keys
  const hasSupabaseSession = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );

  const currentPath = request.nextUrl.pathname;

  // 3. INFINITE LOOP GUARD: If no active session cookie is found, force bounce to /signup
  if (!hasSupabaseSession && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // 4. OPPOSITE GUARD: If they are logged in, don't let them stay stuck on the signup screen
  if (hasSupabaseSession && currentPath === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/simulator';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 5. THE EXPLICIT SECURITY MATCHER
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