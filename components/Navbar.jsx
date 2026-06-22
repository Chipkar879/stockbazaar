"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Helper function to check if a link is active
  const getLinkClass = (path) => {
    const baseClass = "font-medium text-sm tracking-wide transition-colors pb-1";
    const activeClass = "text-[#4F8EF7] font-bold border-b-2 border-[#4F8EF7]";
    const inactiveClass = "text-slate-600 hover:text-[#4F8EF7]";
    
    return `${baseClass} ${pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-shrink-0">
                <Link href="/" className="font-poppins font-extrabold text-2xl text-[#4F8EF7] tracking-tight select-none">
                    Stock<span className="text-[#34D399]">bazaar</span>
                </Link>
            </div>
            <div className="hidden md:flex items-center justify-center gap-8 flex-1">
                <Link href="/" className={getLinkClass('/')}>Home</Link>
                <Link href="/simulator" className={getLinkClass('/simulator')}>Simulator</Link>
                <Link href="/courses" className={getLinkClass('/courses')}>Courses</Link>
                <Link href="/pricing" className={getLinkClass('/pricing')}>Pricing</Link>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-tr from-[#4F8EF7] to-[#34D399] rounded-xl p-0.5 shadow-sm">
                    <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-xs font-extrabold text-[#4F8EF7]">SB</div>
                </div>
            </div>
        </div>
    </nav>
  );
}