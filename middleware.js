import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Permanent super admin immunity email
const SUPER_ADMIN_EMAIL = 'verymystery18@gmail.com';

export async function middleware(req) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // 1. Static files and API routes that must always be accessible
  const isInternalAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico');

  if (isInternalAsset) {
    return res;
  }

  // 2. Open public pages that anyone (guest or frozen user) can see
  const isAlwaysAllowedPage =
    pathname === '/' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth');

  // 3. Initialize Supabase SSR client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 4. Fetch the authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // CASE 1: NOT LOGGED IN
  if (!user) {
    // Allow homepage, pricing, signup, and auth callbacks
    if (isAlwaysAllowedPage) {
      return res;
    }
    // Redirect to login for all other features (simulator, modules, arena, etc.)
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/signup';
    loginUrl.searchParams.set('mode', 'login');
    return NextResponse.redirect(loginUrl);
  }

  // CASE 2: LOGGED IN AS SUPER ADMIN
  if (user.email === SUPER_ADMIN_EMAIL) {
    return res;
  }

  // CASE 3: LOGGED IN USER — CHECK 7-DAY TRIAL & FREEZE STATUS
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_frozen, is_premium, access_expires_at, created_at, role')
    .eq('id', user.id)
    .single();

  if (profile) {
    // Super admin role immunity
    if (profile.role === 'admin') {
      return res;
    }

    // Determine expiration date
    let expiryMs;
    if (profile.access_expires_at) {
      expiryMs = new Date(profile.access_expires_at).getTime();
    } else {
      const createdAtMs = profile.created_at ? new Date(profile.created_at).getTime() : Date.now();
      expiryMs = createdAtMs + 7 * 24 * 60 * 60 * 1000;
    }

    const isTrialExpired = Date.now() >= expiryMs && !profile.is_premium;
    const isFrozen = Boolean(profile.is_frozen || isTrialExpired);

    // If account is frozen or 7-day trial is over:
    if (isFrozen) {
      // Allowed only on home and pricing
      const isAllowedForFrozenUser = pathname === '/' || pathname.startsWith('/pricing');

      if (!isAllowedForFrozenUser) {
        const pricingUrl = req.nextUrl.clone();
        pricingUrl.pathname = '/pricing';
        return NextResponse.redirect(pricingUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};