import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Initialize official Supabase SSR Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Safely unpack session tokens directly from the auth engine
  const { data: { session } } = await supabase.auth.getSession();
  const currentPath = request.nextUrl.pathname;

  // 3. INFINITE LOOP GUARD: If they don't have a session, and they are NOT already going to /signup, block them
  if (!session && currentPath !== '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // 4. OPPOSITE GUARD: If they ARE logged in, don't let them stay stuck on the signup screen
  if (session && currentPath === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/simulator'; // Forward to workspace dashboard
    return NextResponse.redirect(url);
  }

  return response;
}

// 5. STRICT SECURITY MATCHER MATRIX
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