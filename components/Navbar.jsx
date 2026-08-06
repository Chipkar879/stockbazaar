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
    <header className="w-full bg-[#0f0505] border-b border-[#2b0808] sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 group select-none outline-none" onClick={closeMenu}>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-slate-200 transition-colors">Bull</span>
          <span className="text-xl font-black tracking-tight text-[#ff3333] group-hover:text-[#dc2626] transition-colors">Run</span>
        </Link>

        {/* Center: DYNAMIC NAVIGATION ITEMS */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
          <Link href="/" className={`pb-0.5 transition-all ${pathname === '/' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Home</Link>
          <Link href="/simulator" className={`pb-0.5 transition-all ${pathname === '/simulator' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Simulator</Link>
          <Link href="/courses" className={`pb-0.5 transition-all ${pathname === '/courses' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Modules</Link>
          <Link href="/quiz" className={`pb-0.5 transition-all ${pathname === '/quiz' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Daily Quiz</Link>
          <Link href="/leaderboard" className={`pb-0.5 transition-all ${pathname === '/leaderboard' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Leaderboard</Link>
          <Link href="/pricing" className={`pb-0.5 transition-all ${pathname === '/pricing' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Pricing</Link>
        </nav>

        {/* Right Side: Contextual Auth / Hamburger Control Layout */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-9 bg-[#1a0808] border border-[#2b0808] rounded-xl animate-pulse" />
          ) : !user ? (
            <Link 
              href="/signup?mode=login" 
              className="text-xs font-black text-[#ff3333] border border-[#7a0000]/50 hover:bg-[#7a0000]/20 px-4 py-2.5 rounded-xl transition-all shadow-sm"
              onClick={closeMenu}
            >
              Sign In
            </Link>
          ) : (
            /* CLICKABLE INITIALS AVATAR BUTTON - BRANDED FOR BULL RUN */
            <Link
              href="/profile"
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#7a0000] to-black p-[1px] shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center select-none outline-none focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] animate-fadeIn"
              onClick={closeMenu}
            >
              <div className="h-full w-full bg-[#1a0808] border border-[#2b0808] rounded-[11px] flex items-center justify-center hover:bg-[#2b0808] transition-colors outline-none focus:outline-none">
                <span className="text-[11px] font-black tracking-wider text-[#ff3333] select-none">
                  {initials}
                </span>
              </div>
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button 
            className="flex flex-col gap-1.5 md:hidden p-2 text-slate-300 focus:outline-none z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <span className={`h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2 bg-[#ff3333]' : ''}`}></span>
            <span className={`h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2 bg-[#ff3333]' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* DYNAMIC MOBILE DRAWER MENU OVERLAY */}
      <div className={`absolute top-full left-0 w-full bg-[#0f0505] border-b border-[#2b0808] shadow-2xl p-6 flex flex-col gap-3 text-sm font-bold text-slate-300 md:hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'}`}>
        <Link href="/" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Home</Link>
        <Link href="/simulator" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/simulator' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Simulator</Link>
        <Link href="/courses" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/courses' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Modules</Link>
        <Link href="/quiz" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/quiz' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Daily Quiz</Link>
        <Link href="/leaderboard" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/leaderboard' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Leaderboard</Link>
        <Link href="/pricing" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/pricing' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Pricing</Link>
        
        {user && (
          <Link href="/profile" onClick={closeMenu} className={`p-2.5 rounded-xl border-t border-[#2b0808] mt-2 text-[#ff3333] flex items-center justify-between ${pathname === '/profile' ? 'bg-[#1a0808]' : 'hover:bg-[#1a0808]'}`}>
            <span>My Profile</span>
            <span className="px-2 py-0.5 bg-[#7a0000] text-white rounded-md text-xs font-black">{initials}</span>
          </Link>
        )}
      </div>
    </header>
  );
}