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

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 w-full z-50 bg-[#0f0505] border-b border-[#2b0808] px-4 sm:px-6 shadow-2xl">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 group select-none outline-none" onClick={closeMenu}>
          <span className="text-xl font-black tracking-tight text-white transition-colors">Bull</span>
          <span className="text-xl font-black tracking-tight text-[#ff3333] transition-colors">Run</span>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
          <Link href="/" className={`pb-0.5 transition-all ${pathname === '/' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Home</Link>
          <Link href="/simulator" className={`pb-0.5 transition-all ${pathname === '/simulator' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Simulator</Link>
          <Link href="/courses" className={`pb-0.5 transition-all ${pathname === '/courses' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Modules</Link>
          <Link href="/quiz" className={`pb-0.5 transition-all ${pathname === '/quiz' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Daily Quiz</Link>
          <Link href="/leaderboard" className={`pb-0.5 transition-all ${pathname === '/leaderboard' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Leaderboard</Link>
          <Link href="/pricing" className={`pb-0.5 transition-all ${pathname === '/pricing' ? 'text-[#ff3333] border-b-2 border-[#7a0000]' : 'hover:text-white'}`}>Pricing</Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 bg-[#1a0808] border border-[#2b0808] rounded-xl animate-pulse" />
          ) : !user ? (
            <Link 
              href="/signup?mode=login" 
              className="text-xs font-black text-[#ff3333] border border-[#7a0000]/50 hover:bg-[#7a0000]/20 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
              onClick={closeMenu}
            >
              Sign In
            </Link>
          ) : (
            <Link
              href="/profile"
              className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#7a0000] to-black p-[1px] shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center select-none outline-none"
              onClick={closeMenu}
            >
              <div className="h-full w-full bg-[#1a0808] border border-[#2b0808] rounded-[11px] flex items-center justify-center">
                <span className="text-[10px] font-black tracking-wider text-[#ff3333] select-none">
                  {initials}
                </span>
              </div>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="flex flex-col gap-1.5 md:hidden p-1.5 text-slate-300 focus:outline-none z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <span className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2 bg-[#ff3333]' : ''}`} />
            <span className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2 bg-[#ff3333]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`absolute top-full left-0 right-0 w-full bg-[#0f0505] border-b border-[#2b0808] shadow-2xl p-5 flex flex-col gap-2.5 text-xs font-bold text-slate-300 md:hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'}`}>
        <Link href="/" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Home</Link>
        <Link href="/simulator" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/simulator' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Simulator</Link>
        <Link href="/courses" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/courses' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Modules</Link>
        <Link href="/quiz" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/quiz' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Daily Quiz</Link>
        <Link href="/leaderboard" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/leaderboard' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Leaderboard</Link>
        <Link href="/pricing" onClick={closeMenu} className={`p-2.5 rounded-xl transition-colors ${pathname === '/pricing' ? 'bg-[#1a0808] text-[#ff3333] border border-[#2b0808]' : 'hover:bg-[#1a0808]'}`}>Pricing</Link>
      </div>
    </header>
  );
}