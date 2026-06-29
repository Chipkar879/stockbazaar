import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Initialize Supabase Client for Middleware
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

  // 2. Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = new URL(request.url);

  // 3. If NO session exists, redirect them to the login page
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// 4. Specify exactly which routes require a mandatory account
export const config = {
  matcher: [
    '/simulator/:path*',
    '/courses/:path*',
    '/quiz/:path*',
    '/leaderboard/:path*',
  ],
};