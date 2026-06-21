'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Absolute hardcoded route mappings strictly mapped to plural /courses
  const navLinks = [
    { label: 'Simulator', path: '/simulator' },
    { label: 'Courses', path: '/courses' }, 
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-filter backdrop-blur-md bg-white/95 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* BRAND LOGO LAYER */}
        <div className="flex-shrink-0">
          <Link href="/" className="font-poppins font-extrabold text-2xl text-[#4F8EF7] tracking-tight select-none">
            Stock<span className="text-[#34D399]">bazaar</span>
          </Link>
        </div>

        {/* MIDDLE NAV BAR LINKS - STRICT HARDCODED BINDINGS */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={`nav-link-item-${link.path}`}
                href={link.path}
                className={`transition-colors font-medium text-sm tracking-wide ${
                  isActive
                    ? 'text-[#4F8EF7] font-bold border-b-2 border-[#4F8EF7] pb-1'
                    : 'text-slate-600 hover:text-[#4F8EF7]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* RIGHT ZONE ACTIONS MENU */}
        <div className="flex items-center gap-4 flex-shrink-0 relative">
          <div className="hidden sm:flex flex-col text-right font-sans">
            <span className="text-xs font-bold text-slate-800">Pro Trader</span>
            <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider font-mono">
              Balance Linked
            </span>
          </div>

          {/* AVATAR TOGGLE ELEMENT */}
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="h-10 w-10 bg-gradient-to-tr from-[#4F8EF7] to-[#34D399] rounded-xl p-0.5 shadow-sm hover:shadow transition-all focus:outline-none relative"
          >
            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-xs font-extrabold text-[#4F8EF7]">
              SB
            </div>
          </button>

          {/* DROP DOWN LAYOUT DESK */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-[52px] bg-white border border-slate-100 w-56 rounded-2xl shadow-xl py-2 z-50 font-sans text-xs animate-scaleUp">
              <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                <p className="font-extrabold text-slate-800">Trader Sandbox Account</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID: 9324459446@stockbazaar</p>
              </div>

              <Link
                href="/simulator"
                onClick={() => setProfileDropdownOpen(false)}
                className="w-full text-left px-4 py-2.5 block text-slate-700 hover:bg-slate-50 font-semibold"
              >
                📊 Trading Console
              </Link>
              <Link
                href="/pricing"
                onClick={() => setProfileDropdownOpen(false)}
                className="w-full text-left px-4 py-2.5 block text-slate-700 hover:bg-slate-50 font-semibold"
              >
                💰 Top-Up Wallet Cash
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  alert('Session clearance requested. Initializing workspace reset.');
                }}
                className="w-full text-left px-4 py-2.5 block text-rose-600 hover:bg-rose-50 font-semibold"
              >
                🔒 Clear Active Session
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}