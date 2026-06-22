import Link from 'next/link';

export default function Navbar() {
  return (
    <nav class="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex-shrink-0">
                <Link href="/" class="font-poppins font-extrabold text-2xl text-[#4F8EF7] tracking-tight select-none">
                    Stock<span class="text-[#34D399]">bazaar</span>
                </Link>
            </div>
            <div class="hidden md:flex items-center justify-center gap-8 flex-1">
                <Link href="/" class="text-slate-600 hover:text-[#4F8EF7] font-medium text-sm tracking-wide">Home</Link>
                <Link href="/simulator" class="text-slate-600 hover:text-[#4F8EF7] font-medium text-sm tracking-wide">Simulator</Link>
                <Link href="/courses" class="text-[#4F8EF7] font-bold border-b-2 border-[#4F8EF7] pb-1 text-sm tracking-wide">Courses</Link>
                <Link href="/pricing" class="text-slate-600 hover:text-[#4F8EF7] font-medium text-sm tracking-wide">Pricing</Link>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
                <div class="h-10 w-10 bg-gradient-to-tr from-[#4F8EF7] to-[#34D399] rounded-xl p-0.5 shadow-sm">
                    <div class="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-xs font-extrabold text-[#4F8EF7]">SB</div>
                </div>
            </div>
        </div>
    </nav>
  );
}