'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial authentication session state
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user's profile to extract their chosen full name
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.name) {
            // Convert full name into uppercase initials (e.g. "Vikrant Chipkar" -> "VC")
            const nameParts = profile.name.trim().split(/\s+/);
            const userInitials = nameParts.length > 1 
              ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              : nameParts[0].substring(0, 2).toUpperCase();
            setInitials(userInitials);
          } else {
            // Fallback to the first two letters of their email handle
            setInitials(session.user.email.substring(0, 2).toUpperCase());
          }
        }
      } catch (err) {
        console.error("Navbar sync error:", err);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    // 2. Setup active realtime auth state event stream listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        getSessionAndProfile();
      } else {
        setUser(null);
        setInitials('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group select-none">
          <span className="text-xl font-black tracking-tight text-blue-500">Stock</span>
          <span className="text-xl font-black tracking-tight text-emerald-400">bazaar</span>
        </Link>

        {/* Center: Navigation Layout Items */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
          <Link href="/" className="text-blue-500 border-b-2 border-blue-500 pb-0.5 transition-all">Home</Link>
          <Link href="/#simulator" className="hover:text-slate-900 transition-all">Simulator</Link>
          <Link href="/#courses" className="hover:text-slate-900 transition-all">Courses</Link>
          <Link href="/#pricing" className="hover:text-slate-900 transition-all">Pricing</Link>
        </nav>

        {/* Right Side: Contextual Auth Avatar / Signup Call to Action */}
        <div className="flex items-center gap-4">
          {loading ? (
            // Loading State Spinner Placeholder
            <div className="h-9 w-9 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
          ) : !user ? (
            // Condition A: User is not authenticated
            <Link 
              href="/signup?mode=login" 
              className="text-xs font-black text-blue-500 border border-blue-200 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Sign In
            </Link>
          ) : (
            // Condition B: User is active (Replaces hardcoded 'SB' with extracted initials)
            <div className="relative group cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 p-[2px] shadow-sm transition-transform active:scale-95">
                <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                  <span className="text-[11px] font-black tracking-wider bg-gradient-to-tr from-blue-500 to-emerald-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}