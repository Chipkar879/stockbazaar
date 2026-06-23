"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to check if a link is active
  const getLinkClass = (path) => {
    const baseClass = "font-medium text-sm tracking-wide transition-colors pb-1 md:py-0 py-2 block";
    const activeClass = "text-[#4F8EF7] font-bold border-b-2 border-[#4F8EF7] md:border-b-2 border-b-0";
    const inactiveClass = "text-slate-600 hover:text-[#4F8EF7]";
    
    return `${baseClass} ${pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* LEFT SIDE: MOBILE MENU TRIGGER & LOGO */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button (2 lines) */}
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex flex-col justify-center items-center md:hidden w-6 h-6 gap-1.5 text-slate-600 focus:outline-none z-50"
                  aria-label="Toggle Menu"
                >
                    <span className={`h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
                    <span className={`h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
                </button>

                {/* Brand Logo */}
                <Link href="/" className="font-poppins font-extrabold text-2xl text-[#4F8EF7] tracking-tight select-none">
                    Stock<span className="text-[#34D399]">bazaar</span>
                </Link>
            </div>

            {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
            <div className="hidden md:flex items-center justify-center gap-8 flex-1">
                <Link href="/" className={getLinkClass('/')}>Home</Link>
                <Link href="/simulator" className={getLinkClass('/simulator')}>Simulator</Link>
                <Link href="/courses" className={getLinkClass('/courses')}>Courses</Link>
                <Link href="/pricing" className={getLinkClass('/pricing')}>Pricing</Link>
            </div>

            {/* RIGHT SIDE: PROFILE AVATAR */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-tr from-[#4F8EF7] to-[#34D399] rounded-xl p-0.5 shadow-sm">
                    <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-xs font-extrabold text-[#4F8EF7]">SB</div>
                </div>
            </div>
        </div>

        {/* MOBILE DROPDOWN MENU (Only opens when button clicked) */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 px-6 py-4 space-y-3 shadow-xl animate-fadeInFast z-40">
              <Link href="/" onClick={() => setIsOpen(false)} className={getLinkClass('/')}>Home</Link>
              <Link href="/simulator" onClick={() => setIsOpen(false)} className={getLinkClass('/simulator')}>Simulator</Link>
              <Link href="/courses" onClick={() => setIsOpen(false)} className={getLinkClass('/courses')}>Courses</Link>
              <Link href="/pricing" onClick={() => setIsOpen(false)} className={getLinkClass('/pricing')}>Pricing</Link>
          </div>
        )}
    </nav>
  );
}