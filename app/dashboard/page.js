'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
  // Mock data representing the user's current account state
  const portfolio = {
    balance: "₹1,45,200",
    growth: "+14.5%",
    rank: "#42",
  };

  const currentHoldings = [
    { name: "Reliance Industries", symbol: "RELIANCE", shares: 12, avgPrice: "₹2,450", currentPrice: "₹2,610", change: "+6.5%" },
    { name: "Tata Motors", symbol: "TATAMOTORS", shares: 25, avgPrice: "₹610", currentPrice: "₹685", change: "+12.3%" },
  ];

  const badges = [
    { emoji: "👑", title: "Market King", desc: "First place in school tier standings" },
    { emoji: "🚀", title: "Bull Run", desc: "Achieved over 10% returns in a single day" },
    { emoji: "📚", title: "Smart Scholar", desc: "Completed Module 1 foundation test" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* Welcome Grid Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="font-poppins font-extrabold text-3xl text-slate-900">Welcome Back, Trader! 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here is how your virtual investment portfolio is moving today.</p>
          </div>
          <Link 
            href="/simulator" 
            className="bg-[#4F8EF7] hover:bg-[#3b7add] text-white font-poppins font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-100"
          >
            Launch Trading Terminal
          </Link>
        </div>

        {/* Portfolio Metric Overview Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Value</span>
            <h2 className="font-poppins font-extrabold text-3xl text-slate-800">{portfolio.balance}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">All-Time Growth</span>
            <h2 className="font-poppins font-extrabold text-3xl text-emerald-500">{portfolio.growth}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">National Rank Standing</span>
            <h2 className="font-poppins font-extrabold text-3xl text-blue-500">{portfolio.rank}</h2>
          </div>
        </div>

        {/* Bottom Section Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Investment Holdings Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-poppins font-bold text-lg text-slate-800">Your Active Asset Positions</h3>
            </div>
            <div className="divide-y divide-slate-100 px-6">
              {currentHoldings.map((stock) => (
                <div key={stock.symbol} className="py-4 flex justify-between items-center text-sm">
                  <div>
                    <h4 className="font-bold text-slate-800">{stock.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{stock.shares} Shares • Avg: {stock.avgPrice}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{stock.currentPrice}</span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {stock.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Accomplishment Badges Sidebar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-poppins font-bold text-lg text-slate-800">Unlocked Badges</h3>
            <div className="space-y-4">
              {badges.map((badge) => (
                <div key={badge.title} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xl" aria-hidden="true">{badge.emoji}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{badge.title}</h4>
                    <p className="text-xs text-slate-400">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}