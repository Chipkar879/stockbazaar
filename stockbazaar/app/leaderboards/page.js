'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Leaderboards() {
  const [filter, setFilter] = useState('All India');

  const leaderData = {
    'All India': [
      { rank: 1, name: "Aarav Sharma", school: "Delhi Public School", returns: "+34.2%", badge: "👑 Market King", bg: "bg-amber-50/60 border-amber-100", text: "text-amber-700" },
      { rank: 2, name: "Ananya Iyer", school: "National Public School", returns: "+28.7%", badge: "🚀 Bull Run", bg: "bg-slate-50 border-slate-200", text: "text-slate-700" },
      { rank: 3, name: "Kabir Mehta", school: "St. Xavier's High", returns: "+25.1%", badge: "💎 Steady Hands", bg: "bg-orange-50/40 border-orange-100", text: "text-orange-700" },
    ],
    'My School': [
      { rank: 1, name: "Kabir Mehta", school: "St. Xavier's High", returns: "+25.1%", badge: "💎 Steady Hands", bg: "bg-amber-50/60 border-amber-100", text: "text-amber-700" },
      { rank: 2, name: "Rohan Malhotra", school: "St. Xavier's High", returns: "+14.8%", badge: "🌱 Learner", bg: "bg-slate-50 border-slate-100", text: "text-slate-600" },
      { rank: 3, name: "Sanya Desai", school: "St. Xavier's High", returns: "+12.2%", badge: "🌱 Learner", bg: "bg-slate-50 border-slate-100", text: "text-slate-600" },
    ]
  };

  const currentLeaders = leaderData[filter];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Live Rankings Leaderboard
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Real-time visual index tracking student investment portfolios and active growth performance metrics.
          </p>
        </div>

        {/* Tab Selection Filter Controls */}
        <div className="flex justify-center p-1.5 bg-slate-100 border border-slate-200/60 rounded-2xl max-w-xs mx-auto shadow-inner">
          <button 
            onClick={() => setFilter('All India')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-poppins transition-all duration-200 ${filter === 'All India' ? 'bg-white text-[#4F8EF7] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All India
          </button>
          <button 
            onClick={() => setFilter('My School')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-poppins transition-all duration-200 ${filter === 'My School' ? 'bg-white text-[#4F8EF7] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            My School
          </button>
        </div>

        {/* Main Board Container */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/40 overflow-hidden">
          
          {/* Status Subheader banner */}
          <div className="px-6 py-5 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
            <h3 className="font-poppins font-bold text-lg text-slate-800">
              {filter === 'All India' ? 'National Tier Rankings' : 'St. Xavier\'s Division'}
            </h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Tracking Stream
            </span>
          </div>

          {/* Leaderboard Listings Ladder Grid */}
          <div className="divide-y divide-slate-100 px-2 sm:px-4">
            {currentLeaders.map((user) => (
              <div 
                key={user.name} 
                className="flex items-center justify-between p-4 sm:p-5 my-1.5 rounded-2xl transition-all duration-200 hover:bg-slate-50/80 group"
              >
                {/* Profile Identity Blocks */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Styled Numeric Placement Rings */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-poppins font-extrabold text-sm sm:text-base border transition-transform group-hover:scale-105 ${user.bg} ${user.text}`}>
                    #{user.rank}
                  </div>
                  
                  <div className="space-y-0.5">
                    <h4 className="font-poppins font-bold text-base sm:text-lg text-slate-800 flex flex-wrap items-center gap-2">
                      {user.name}
                      <span className="inline-block text-[11px] sm:text-xs bg-slate-50 text-slate-500 font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200/40 shadow-sm">
                        {user.badge}
                      </span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      {user.school}
                    </p>
                  </div>
                </div>

                {/* Return Gains Percent Counter Metrics */}
                <div className="text-right pl-2">
                  <span className="font-poppins font-extrabold text-base sm:text-lg text-emerald-500 bg-emerald-50/40 px-3.5 py-1.5 rounded-xl border border-emerald-100/30">
                    {user.returns}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </main>
  );
}