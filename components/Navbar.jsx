'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State to track if the mobile menu layout is open or closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu automatically when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group select-none" onClick={closeMenu}>
          <span className="text-xl font-black tracking-tight text-blue-500">Stock</span>
          <span className="text-xl font-black tracking-tight text-emerald-400">bazaar</span>
        </Link>

        {/* Center: DYNAMIC NAVIGATION ITEMS */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
          <Link href="/" className={`pb-0.5 transition-all ${pathname === '/' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}>Home</Link>
          <Link href="/simulator" className={`pb-0.5 transition-all ${pathname === '/simulator' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}>Simulator</Link>
          <Link href="/courses" className={`pb-0.5 transition-all ${pathname === '/courses' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}>Modules</Link>
          <Link href="/quiz" className={`pb-0.5 transition-all ${pathname === '/quiz' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}>Daily Quiz</Link>
          <Link href="/leaderboard" className={`pb-0.5 transition-all ${pathname === '/leaderboard' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}>Leaderboard</Link>
          <Link href="/pricing" className={`pb-0.5 transition-all ${pathname === '/pricing' ? 'text-blue-500 border-b-2 border-blue-500' : 'hover:text-slate-900'}`}>Pricing</Link>
        </nav>

        {/* Right Side: Contextual Auth / Hamburger Control Layout */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-9 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
          ) : !user ? (
            <Link 
              href="/signup?mode=login" 
              className="text-xs font-black text-blue-500 border border-blue-200 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl transition-all shadow-sm"
              onClick={closeMenu}
            >
              Sign In
            </Link>
          ) : (
            /* CLICKABLE INITIALS AVATAR BUTTON - REWRITTEN FOR STYLING FIXES */
            <Link
              href="/profile"
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 p-[2px] shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center select-none outline-none focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] animate-fadeIn"
              onClick={closeMenu}
            >
              <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center hover:bg-slate-50/80 transition-colors outline-none focus:outline-none">
                <span className="text-[11px] font-black tracking-wider text-slate-700 select-none">
                  {initials}
                </span>
              </div>
            </Link>
          )}

          {/* Toggle Button */}
          <button 
            className="flex flex-col gap-1.5 md:hidden p-2 text-slate-600 focus:outline-none z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`h-0.5 w-6 bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-6 bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* DYNAMIC MOBILE DRAWER MENU OVERLAY */}
      <div className={`absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-md p-6 flex flex-col gap-4 text-sm font-bold text-slate-600 md:hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'}`}>
        <Link href="/" onClick={closeMenu} className={`p-2 rounded-xl ${pathname === '/' ? 'bg-blue-50 text-blue-500' : 'hover:bg-slate-50'}`}>Home</Link>
        <Link href="/simulator" onClick={closeMenu} className={`p-2 rounded-xl ${pathname === '/simulator' ? 'bg-blue-50 text-blue-500' : 'hover:bg-slate-50'}`}>Simulator</Link>
        <Link href="/courses" onClick={closeMenu} className={`p-2 rounded-xl ${pathname === '/courses' ? 'bg-blue-50 text-blue-500' : 'hover:bg-slate-50'}`}>Modules</Link>
        <Link href="/quiz" onClick={closeMenu} className={`p-2 rounded-xl ${pathname === '/quiz' ? 'bg-blue-50 text-blue-500' : 'hover:bg-slate-50'}`}>Daily Quiz</Link>
        <Link href="/leaderboard" onClick={closeMenu} className={`p-2 rounded-xl ${pathname === '/leaderboard' ? 'bg-blue-50 text-blue-500' : 'hover:bg-slate-50'}`}>Leaderboard</Link>
        <Link href="/pricing" onClick={closeMenu} className={`p-2 rounded-xl ${pathname === '/pricing' ? 'bg-blue-50 text-blue-500' : 'hover:bg-slate-50'}`}>Pricing</Link>
        
        {user && (
          <Link href="/profile" onClick={closeMenu} className={`p-2 rounded-xl border-t border-slate-100 mt-2 text-blue-500 ${pathname === '/profile' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
            My Profile ({initials})
          </Link>
        )}
      </div>
    </header>
  );
}