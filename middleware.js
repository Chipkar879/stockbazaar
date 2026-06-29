import { createServerClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Initialize using your project's environmental variables
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false, // Essential configuration flag inside edge middleware environments
      },
    }
  );

  // 2. Fetch the session tokens dynamically
  const { data: { session } } = await supabase.auth.getSession();
  const currentPath = request.nextUrl.pathname;

  // 3. INFINITE LOOP GUARD: If not logged in and not on signup, redirect to signup
  if (!session && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // 4. OPPOSITE GUARD: If logged in, don't let them sit on the signup screen
  if (session && currentPath === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/simulator';
    return NextResponse.redirect(url);
  }

  return response;
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