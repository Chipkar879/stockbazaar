import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Initialize Supabase Client
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

  // 2. Fetch active authentication state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3. If NO active login token exists, bounce them to the login screen instantly
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// 4. THE MATCHER MATRIX: Explicitly lock every target gateway
export const config = {
  matcher: [
    '/simulator',
    '/simulator/:path*',       // Catches both simulators and sub-paths
    '/courses',
    '/courses/:path*',         // Dynamic modules layout
    '/quiz',
    '/quiz/:path*',            // Daily quiz routes
    '/leaderboard',
    '/leaderboard/:path*',     // Blocks anonymous leaderboard viewing entirely
  ],
};