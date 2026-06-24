'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import the pathname detector hook
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname(); // This reads your current page URL (e.g., '/', '/simulator')
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.name) {
            const nameParts = profile.name.trim().split(/\s+/);
            const userInitials = nameParts.length > 1 
              ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              : nameParts[0].substring(0, 2).toUpperCase();
            setInitials(userInitials);
          } else {
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

        {/* Center: DYNAMIC NAVIGATION ITEMS */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
          <Link 
            href="/" 
            className={`pb-0.5 transition-all ${pathname === '/' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}
          >
            Home
          </Link>
          <Link 
            href="/simulator" 
            className={`pb-0.5 transition-all ${pathname === '/simulator' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}
          >
            Simulator
          </Link>
          <Link 
            href="/courses" 
            className={`pb-0.5 transition-all ${pathname === '/courses' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}
          >
            Courses
          </Link>
          <Link 
            href="/pricing" 
            className={`pb-0.5 transition-all ${pathname === '/pricing' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right Side: Contextual Auth Avatar */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-9 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
          ) : !user ? (
            <Link 
              href="/signup?mode=login" 
              className="text-xs font-black text-blue-500 border border-blue-200 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Sign In
            </Link>
          ) : (
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