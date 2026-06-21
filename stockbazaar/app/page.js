'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

// Re-usable animated asset component to rain down 10 unique asset categories cleanly in the background
const RainingAsset = ({ icon }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    setStyle({
      left: `${Math.random() * 95}%`,
      animationDuration: `${Math.random() * 5 + 4}s`, // Float speed between 4s and 9s
      animationDelay: `${Math.random() * 6}s`,        // Varied spawn delay
      fontSize: `${Math.random() * 18 + 14}px`,       // Size range from 14px to 32px
    });
  }, []);

  return (
    <div
      className="absolute top-[-5vh] text-slate-300/40 pointer-events-none select-none animate-rainDown"
      style={style}
    >
      {icon}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('stocks'); 

  // The 10 distinct stock and financial assets to populate our raining background matrix
  const ASSET_TYPES = ['₹', '$', '🚀', '📈', '📉', '₿', '📊', '💼', '💳', '💎'];

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased font-sans pb-20 overflow-x-hidden relative">
      <Navbar />

      {/* BACKGROUND FLOATING RAIN LAYER - RENDERING 10 COPIES FOR EACH OF THE 10 ASSET TYPES */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {ASSET_TYPES.map((asset, typeIdx) => (
          [...Array(10)].map((_, itemIdx) => (
            <RainingAsset key={`asset-${typeIdx}-${itemIdx}`} icon={asset} />
          ))
        ))}
      </div>

      {/* MAIN HERO LANDING BLOCK */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 text-center space-y-8 relative z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#4F8EF7]/15 to-[#34D399]/15 blur-[100px] rounded-full -z-10 animate-pulse duration-5000" />

        <div className="space-y-4 max-w-3xl mx-auto select-none animate-fadeIn">
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#4F8EF7] text-[10px] sm:text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-inner animate-bounce">
            🚀 The Ultimate Classroom Sandbox Arena
          </span>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-none text-slate-950">
            Master Money <br className="hidden sm:inline" />
            Before{' '}
            <span className="bg-gradient-to-r from-[#4F8EF7] to-[#34D399] bg-clip-text text-transparent drop-shadow-sm animate-gradientFlow">
              Owning it
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto leading-relaxed pt-3">
            Risk-free paper trading powered by high-frequency market simulations. Practice with live data feeds, candlestick tracking layers, and competitive campus leaderboards.
          </p>
        </div>

        {/* INTERACTIVE ACTIONS HUB */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4 animate-scaleUp">
          <Link
            href="/simulator"
            className="bg-[#4F8EF7] text-white font-poppins font-black px-10 py-4 rounded-2xl text-sm shadow-xl shadow-blue-200 hover:bg-[#3b7add] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-[-20deg]" />
            Claim Your Sandbox Wallet
          </Link>
          <Link
            href="/pricing"
            className="bg-white border-2 border-slate-200 text-slate-700 font-poppins font-black px-10 py-4 rounded-2xl text-sm hover:border-slate-400 hover:text-slate-950 hover:-translate-y-1 transition-all"
          >
            Free 7-Day Trial
          </Link>
        </div>
      </section>

      {/* LIVE MARKET SIMULATOR TERMINAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 pt-28 relative z-10 flex flex-col items-center justify-center animate-fadeIn">
        <div className="border-b border-slate-200/60 pb-6 mb-12 text-center max-w-xl w-full">
          <h2 className="text-2xl font-black text-slate-950">Terminal Engine Simulator</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time exchange tracking interfaces driven by high-accuracy pipeline proxies.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm w-full max-w-4xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Ticker Nav Selection controls */}
          <div className="col-span-1 space-y-3">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-1">Select Live Stream Desk:</div>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`w-full flex justify-between items-center px-4 py-3.5 rounded-2xl border text-left text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'stocks' ? 'bg-[#4F8EF7]/10 border-[#4F8EF7] text-[#4F8EF7] shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
            >
              📈 Live NSE Indian Stocks
              <span className={`h-2 w-2 rounded-full ${activeTab === 'stocks' ? 'bg-[#4F8EF7] animate-pulse' : 'bg-slate-300'}`} />
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`w-full flex justify-between items-center px-4 py-3.5 rounded-2xl border text-left text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'crypto' ? 'bg-[#7c3aed]/10 border-[#7c3aed] text-[#7c3aed] shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
            >
              🚀 Beta Challenge Equities
              <span className={`h-2 w-2 rounded-full ${activeTab === 'crypto' ? 'bg-[#7c3aed] animate-pulse' : 'bg-slate-300'}`} />
            </button>
          </div>

          {/* Visual Terminal Workspace Container */}
          <div className="col-span-2 bg-[#0f111a] border border-slate-900 rounded-2xl p-6 font-sans text-slate-200 relative overflow-hidden group min-h-[250px] flex flex-col justify-between shadow-inner">
            
            {activeTab === 'stocks' && (
              <div className="space-y-4 animate-fadeInFast w-full">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md tracking-wider">RELIANCE.NS • NSE LIVE</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">● Exchange Open</span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Market Price</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white">₹1,309.35</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">+₹12.40 (+0.95%)</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <div>Prev Close: <span className="text-white font-bold">₹1,296.95</span></div>
                  <div>Day Volume: <span className="text-white font-bold">4.2M Shares</span></div>
                </div>
              </div>
            )}

            {activeTab === 'crypto' && (
              <div className="space-y-4 animate-fadeInFast w-full">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black bg-purple-950/40 text-purple-300 px-2.5 py-1 rounded-md tracking-wider border border-purple-900/40">TECH.CHALLENGE • HIGH-BETA</span>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">⚡ Arena Ticking</span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulated Price Scale</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white">₹12,500.00</div>
                  <div className="text-xs font-bold text-rose-500 font-mono">-₹2,500.00 (-20.00%)</div>
                </div>

                <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[11px] text-rose-400 leading-relaxed font-semibold">
                  📢 System Event Broadcast: Tech sector crash initiated! TECH drops 20% over current challenge lifecycle step.
                </div>
              </div>
            )}

            {/* Micro background design curve vectors */}
            <div className="absolute bottom-0 inset-x-0 h-24 opacity-10 pointer-events-none -z-10">
              <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full fill-none stroke-current text-slate-400">
                <path d="M0,120 L20,90 L50,110 L100,20 L150,80 L200,10 L250,90 L300,40 L350,110 L400,10" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CAMPUS DEPLOYMENT METRICS BANNER */}
      <section className="max-w-7xl mx-auto px-6 pt-32 relative z-10 animate-fadeIn">
        <div className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group border border-white/5">
          <div className="absolute right-0 bottom-0 text-white/5 font-mono font-black text-9xl tracking-tighter pointer-events-none select-none translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-700">
            SB
          </div>

          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="bg-white/10 text-[#34D399] font-mono font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded border border-white/5">
              Campus Classroom Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">Launch Custom Classroom Tournaments</h2>
            <p className="text-slate-300 text-xs leading-relaxed max-w-lg mx-auto md:mx-0">
              Deploy programmatic classroom sandboxes, initiate specific challenge milestones, and monitor student metrics through clean analytical reporting tables.
            </p>
          </div>

          <div className="w-full md:w-auto z-10 flex justify-center">
            <Link
              href="/pricing"
              className="px-6 py-4 bg-white text-slate-900 hover:bg-slate-50 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
            >
              Setup Institutional Trial Token
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}