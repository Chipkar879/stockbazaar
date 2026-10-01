import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Permanent super admin immunity email
const SUPER_ADMIN_EMAIL = 'verymystery18@gmail.com';

export async function middleware(req) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // 1. Static files and internal API routes always allowed
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

  // 3. Extract the Supabase auth token directly from request cookies
  const allCookies = req.cookies.getAll();
  const authCookie = allCookies.find((c) =>
    c.name.includes('-auth-token') || c.name.startsWith('sb-')
  );

  let user = null;

  if (authCookie) {
    try {
      let token = authCookie.value;
      if (token.startsWith('base64-')) {
        token = Buffer.from(token.replace('base64-', ''), 'base64').toString('utf-8');
      }
      const parsed = JSON.parse(token);
      const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token || parsed;

      if (accessToken && typeof accessToken === 'string') {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data } = await supabase.auth.getUser(accessToken);
        user = data?.user || null;
      }
    } catch {
      user = null;
    }
  }

  // CASE 1: NOT LOGGED IN
  if (!user) {
    if (isAlwaysAllowedPage) {
      return res;
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/signup';
    loginUrl.searchParams.set('mode', 'login');
    return NextResponse.redirect(loginUrl);
  }

  // CASE 2: LOGGED IN AS SUPER ADMIN
  if (user.email === SUPER_ADMIN_EMAIL) {
    return res;
  }

  // CASE 3: LOGGED IN USER — CHECK TRIAL & FREEZE STATUS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_frozen, is_premium, access_expires_at, created_at, role')
    .eq('id', user.id)
    .single();

  if (profile) {
    if (profile.role === 'admin') {
      return res;
    }

    let expiryMs;
    if (profile.access_expires_at) {
      expiryMs = new Date(profile.access_expires_at).getTime();
    } else {
      const createdAtMs = profile.created_at ? new Date(profile.created_at).getTime() : Date.now();
      expiryMs = createdAtMs + 7 * 24 * 60 * 60 * 1000;
    }

    const hasPremium = Boolean(profile.is_premium);
    const isTrialExpired = Date.now() >= expiryMs && !hasPremium;

    // Explicit database freeze takes absolute precedence over Pro/Premium status
    const isFrozen = Boolean(profile.is_frozen) || isTrialExpired;

    if (isFrozen) {
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