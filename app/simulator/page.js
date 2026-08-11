'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

// TOP 20 SENSEX HEAVYWEIGHTS REGISTRY (FIXED TATAMOTORS TRADINGVIEW SYMBOL)
const STATIC_COMPANY_REGISTRY = [
  { sym: 'RELIANCE', name: 'Reliance Industries Ltd.', tv: 'BSE:RELIANCE', sector: 'Energy & Retail', cap: '₹17.9L Cr', pe: 37.7, eps: 35.2, div: '0.61%' },
  { sym: 'TCS', name: 'Tata Consultancy Services', tv: 'BSE:TCS', sector: 'Information Technology', cap: '₹7.8L Cr', pe: 15.8, eps: 136.0, div: '2.33%' },
  { sym: 'INFY', name: 'Infosys Ltd.', tv: 'BSE:INFY', sector: 'Information Technology', cap: '₹4.3L Cr', pe: 14.7, eps: 71.4, div: '4.55%' },
  { sym: 'HDFCBANK', name: 'HDFC Bank Ltd.', tv: 'BSE:HDFCBANK', sector: 'Banking & Finance', cap: '₹5.9L Cr', pe: 15.8, eps: 49.2, div: '1.66%' },
  { sym: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', tv: 'BSE:BAJFINANCE', sector: 'NBFC', cap: '₹3.9L Cr', pe: 26.4, eps: 210.5, div: '0.35%' },
  { sym: 'WIPRO', name: 'Wipro Ltd.', tv: 'BSE:WIPRO', sector: 'Information Technology', cap: '₹2.1L Cr', pe: 20.1, eps: 18.5, div: '0.25%' },
  { sym: 'SUNPHARMA', name: 'Sun Pharmaceutical Ind.', tv: 'BSE:SUNPHARMA', sector: 'Pharmaceuticals', cap: '₹3.6L Cr', pe: 34.2, eps: 41.0, div: '0.80%' },
  { sym: 'ICICIBANK', name: 'ICICI Bank Ltd.', tv: 'BSE:ICICIBANK', sector: 'Banking & Finance', cap: '₹7.8L Cr', pe: 16.1, eps: 68.2, div: '0.85%' },
  { sym: 'ASIANPAINT', name: 'Asian Paints Ltd.', tv: 'BSE:ASIANPAINT', sector: 'Consumer Goods', cap: '₹2.1L Cr', pe: 48.2, eps: 44.1, div: '1.20%' },
  { sym: 'TATAMOTORS', name: 'Tata Motors Ltd.', tv: 'NSE:TATAMOTORS', sector: 'Automobiles', cap: '₹2.4L Cr', pe: 8.5, eps: 78.4, div: '0.00%' },
  { sym: 'ITC', name: 'ITC Ltd.', tv: 'BSE:ITC', sector: 'FMCG', cap: '₹5.8L Cr', pe: 28.5, eps: 16.2, div: '3.10%' },
  { sym: 'LT', name: 'Larsen & Toubro Ltd.', tv: 'BSE:LT', sector: 'Engineering', cap: '₹4.9L Cr', pe: 31.2, eps: 92.0, div: '0.80%' },
  { sym: 'AXISBANK', name: 'Axis Bank Ltd.', tv: 'BSE:AXISBANK', sector: 'Banking & Finance', cap: '₹3.5L Cr', pe: 13.2, eps: 81.5, div: '0.10%' },
  { sym: 'KOTAKBANK', name: 'Kotak Mahindra Bank', tv: 'BSE:KOTAKBANK', sector: 'Banking & Finance', cap: '₹3.4L Cr', pe: 22.1, eps: 72.8, div: '0.11%' },
  { sym: 'SBIN', name: 'State Bank of India', tv: 'BSE:SBIN', sector: 'Banking & Finance', cap: '₹7.2L Cr', pe: 10.5, eps: 72.0, div: '1.70%' },
  { sym: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', tv: 'BSE:BHARTIARTL', sector: 'Telecommunications', cap: '₹8.1L Cr', pe: 54.0, eps: 24.1, div: '0.60%' },
  { sym: 'HINDUNILVR', name: 'Hindustan Unilever', tv: 'BSE:HINDUNILVR', sector: 'FMCG', cap: '₹5.9L Cr', pe: 58.2, eps: 43.1, div: '1.60%' },
  { sym: 'MM', name: 'Mahindra & Mahindra', tv: 'BSE:M_M', sector: 'Automobiles', cap: '₹3.2L Cr', pe: 28.1, eps: 98.4, div: '0.70%' },
  { sym: 'MARUTI', name: 'Maruti Suzuki India', tv: 'BSE:MARUTI', sector: 'Automobiles', cap: '₹3.8L Cr', pe: 28.4, eps: 412.0, div: '1.00%' },
  { sym: 'NTPC', name: 'NTPC Ltd.', tv: 'BSE:NTPC', sector: 'Utilities', cap: '₹3.7L Cr', pe: 18.2, eps: 21.0, div: '2.10%' }
];

const CHALLENGE_EVENTS_REGISTRY = [
  { msg: 'Tech sector crash! TECH -20%', sym: 'TECH', pct: -0.20, col: 'text-rose-400 bg-rose-950/40 border-rose-900/60' },
  { msg: 'Green energy boom! GRN +25%', sym: 'GRN', pct: 0.25, col: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' },
  { msg: 'Moon mission funded! MOON +28%', sym: 'MOON', pct: 0.28, col: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' },
  { msg: 'Chip shortage! CHIP -15%', sym: 'CHIP', pct: -0.15, col: 'text-rose-400 bg-rose-950/40 border-rose-900/60' }
];

export default function CombinedSimulator() {
  const [activeTab, setActiveTab] = useState('real'); 
  const [user, setUser] = useState(null);

  // REAL PORTFOLIO SIMULATOR STATE
  const START_REAL = 50000; 
  const [realBalance, setRealBalance] = useState(START_REAL);
  const [realHoldings, setRealHoldings] = useState({});
  const [selectedRealStock, setSelectedRealStock] = useState('RELIANCE');
  const [realQtyInput, setRealQtyInput] = useState('1');
  const [isChartSyncing, setIsChartSyncing] = useState(false);
  const [marketStatusMessage, setMarketStatusMessage] = useState('');

  // Stores live TradingView scanner prices
  const [tvPrices, setTvPrices] = useState({});

  const chartContainerRef = useRef(null);

  // Sync user session & profile wallet
  useEffect(() => {
    const syncUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: prof } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', session.user.id)
            .single();

          if (prof && prof.wallet_balance !== undefined && prof.wallet_balance !== null) {
            setRealBalance(prof.wallet_balance);
          }

          const savedHoldings = localStorage.getItem(`bullrun_holdings_${session.user.id}`);
          if (savedHoldings) {
            setRealHoldings(JSON.parse(savedHoldings));
          }
        }
      } catch (err) {
        console.error("Supabase user sync fault:", err);
      }
    };

    syncUserSession();
  }, []);

  // Fetch prices via server proxy (/api/tv-prices) to bypass CORS
  const fetchTradingViewPrices = useCallback(async () => {
    try {
      const tickers = STATIC_COMPANY_REGISTRY.map(s => s.tv);
      const response = await fetch('/api/tv-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers })
      });

      if (response.ok) {
        const json = await response.json();
        const dataRows = json.data || [];
        const updatedPrices = {};

        dataRows.forEach(item => {
          const tvSymbol = item.s;
          const closePrice = item.d?.[0];
          const changePct = item.d?.[1];

          const match = STATIC_COMPANY_REGISTRY.find(s => s.tv === tvSymbol);
          if (match && closePrice !== undefined) {
            const formattedPct = changePct !== undefined 
              ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%` 
              : '0.00%';
              
            updatedPrices[match.sym] = {
              price: parseFloat(closePrice.toFixed(2)),
              changePct: formattedPct
            };
          }
        });

        if (Object.keys(updatedPrices).length > 0) {
          setTvPrices(prev => ({ ...prev, ...updatedPrices }));
        }
      }
    } catch (err) {
      console.warn("TradingView price proxy sync error:", err);
    }
  }, []);

  // Poll TradingView scanner via API proxy every 3 seconds
  useEffect(() => {
    if (activeTab !== 'real') return;

    fetchTradingViewPrices();
    const interval = setInterval(fetchTradingViewPrices, 3000);
    return () => clearInterval(interval);
  }, [activeTab, fetchTradingViewPrices]);

  // Bind active company
  const activeStaticContext = STATIC_COMPANY_REGISTRY.find(x => x.sym === selectedRealStock) || STATIC_COMPANY_REGISTRY[0];
  const activeTvQuote = tvPrices[selectedRealStock] || { price: 0, changePct: 'Syncing...' };

  const mergedActiveRealStock = {
    ...activeStaticContext,
    price: activeTvQuote.price || 0,
    changePct: activeTvQuote.changePct
  };

  const verifyMarketIsActive = () => {
    const indianTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(indianTimeStr);
    
    const dayOfWeek = istDate.getDay(); 
    const currentHour = istDate.getHours();
    const currentMinute = istDate.getMinutes();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    const absoluteMinutes = (currentHour * 60) + currentMinute;
    const sessionOpenMinutes = (9 * 60) + 15;  
    const sessionCloseMinutes = (15 * 60) + 30; 
    
    return absoluteMinutes >= sessionOpenMinutes && absoluteMinutes <= sessionCloseMinutes;
  };

  // Embedded TradingView Interactive Chart
  useEffect(() => {
    if (activeTab !== 'real' || !chartContainerRef.current) return;

    setIsChartSyncing(true);
    const scriptId = 'tradingview-advanced-embedded-core';
    let scriptTag = document.getElementById(scriptId);

    const initializeAdvancedChart = () => {
      if (typeof window !== 'undefined' && window.TradingView && chartContainerRef.current) {
        chartContainerRef.current.innerHTML = ''; 

        const viewportId = `tv-view-wrapper-${selectedRealStock}`;
        const targetElement = document.createElement('div');
        targetElement.id = viewportId;
        targetElement.style.height = '100%';
        targetElement.style.width = '100%';
        chartContainerRef.current.appendChild(targetElement);

        new window.TradingView.widget({
          "autosize": true,
          "symbol": mergedActiveRealStock.tv, 
          "interval": "D",
          "timezone": "Asia/Kolkata",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": false,
          "container_id": viewportId,
          "studies": [],
          "showpopupbutton": false,
          "withdateranges": true,
          "hide_legend": false
        });
        setIsChartSyncing(false);
      }
    };

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.src = 'https://s3.tradingview.com/tv.js';
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.onload = () => setTimeout(initializeAdvancedChart, 200);
      document.head.appendChild(scriptTag);
    } else {
      initializeAdvancedChart();
    }
  }, [selectedRealStock, activeTab, mergedActiveRealStock.tv]);

  const getRealHoldingsValue = () => {
    return Object.values(realHoldings).reduce((sum, h) => {
      const matchPrice = tvPrices[h.sym]?.price || h.avgPrice;
      return sum + (matchPrice * h.shares);
    }, 0);
  };

  const handleRealTrade = async (sym, type) => {
    if (!verifyMarketIsActive()) {
      setMarketStatusMessage("🚨 Order Rejected: Indian Stock Exchanges (NSE/BSE) are currently closed. Live trading is permitted Monday to Friday, 9:15 AM – 3:30 PM IST.");
      setTimeout(() => setMarketStatusMessage(''), 8000);
      return;
    }

    const qty = parseInt(realQtyInput);
    if (isNaN(qty) || qty <= 0) return;

    const livePrice = tvPrices[sym]?.price || mergedActiveRealStock.price;
    if (!livePrice || livePrice <= 0) {
      alert("Fetching live TradingView price feed... Please try again in a second.");
      return;
    }

    const transactionTotal = livePrice * qty;

    if (type === 'BUY') {
      if (realBalance < transactionTotal) {
        alert('Insufficient funds in Real Simulator account!');
        return;
      }
      
      const newBalance = Number((realBalance - transactionTotal).toFixed(2));
      setRealBalance(newBalance);

      const updatedHoldings = { ...realHoldings };
      const existing = updatedHoldings[sym];
      if (existing) {
        const newShares = existing.shares + qty;
        const newAvg = ((existing.avgPrice * existing.shares) + (livePrice * qty)) / newShares;
        updatedHoldings[sym] = { sym, shares: newShares, avgPrice: newAvg };
      } else {
        updatedHoldings[sym] = { sym, shares: qty, avgPrice: livePrice };
      }

      setRealHoldings(updatedHoldings);

      if (user) {
        localStorage.setItem(`bullrun_holdings_${user.id}`, JSON.stringify(updatedHoldings));
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id);
      }

    } else {
      const existing = realHoldings[sym];
      if (!existing || existing.shares < qty) {
        alert('Not enough shares to execute this transaction!');
        return;
      }

      const newBalance = Number((realBalance + transactionTotal).toFixed(2));
      setRealBalance(newBalance);

      const updatedHoldings = { ...realHoldings };
      if (existing.shares === qty) {
        delete updatedHoldings[sym];
      } else {
        updatedHoldings[sym] = { ...existing, shares: existing.shares - qty };
      }

      setRealHoldings(updatedHoldings);

      if (user) {
        localStorage.setItem(`bullrun_holdings_${user.id}`, JSON.stringify(updatedHoldings));
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id);
      }
    }
  };

  // =========================================================================
  // ── 2. GAMIFIED CHALLENGE ARENA STATE ────────────────────────────────────
  // =========================================================================
  const START_GAME = 10000; 
  const [gameBalance, setGameBalance] = useState(START_GAME);
  const [gameHoldings, setGameHoldings] = useState({});
  const [day, setDay] = useState(1);
  const [autoSecsLeft, setAutoSecsLeft] = useState(60); 
  const [activeEvent, setActiveEvent] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [gameStocks, setGameStocks] = useState([
    { sym: 'TECH', name: 'TechCorp Inc.', price: 12500, prevClose: 12500, changePct: '0.00%', history: Array(10).fill(12500) },
    { sym: 'GRN', name: 'GreenEnergy Co.', price: 3780, prevClose: 3780, changePct: '0.00%', history: Array(10).fill(3780) },
    { sym: 'MOON', name: 'AeroSpace Ltd.', price: 23400, prevClose: 23400, changePct: '0.00%', history: Array(10).fill(23400) },
    { sym: 'CHIP', name: 'SemiconductorX', price: 7680, prevClose: 7680, changePct: '0.00%', history: Array(10).fill(7680) },
    { sym: 'ZOM', name: 'ZombieGames', price: 7100, prevClose: 7100, changePct: '0.00%', history: Array(10).fill(7100) },
    { sym: 'FOOD', name: 'FoodieHub', price: 4250, prevClose: 4250, changePct: '0.00%', history: Array(10).fill(4250) },
    { sym: 'BANK', name: 'DigitalBank Ltd.', price: 18600, prevClose: 18600, changePct: '0.00%', history: Array(10).fill(18600) },
    { sym: 'EDU', name: 'EduTech Corp.', price: 3120, prevClose: 3120, changePct: '0.00%', history: Array(10).fill(3120) },
    { sym: 'SPORT', name: 'SportXcel', price: 5840, prevClose: 5840, changePct: '0.00%', history: Array(10).fill(5840) },
    { sym: 'PHARMA', name: 'PharmaCorp', price: 11200, prevClose: 11200, changePct: '0.00%', history: Array(10).fill(11200) },
  ]); 

  const FAKE_LB = [
    { name: 'CryptoKing', score: 14200 },
    { name: 'DiamondHands', score: 12800 },
    { name: 'BearWhale', score: 11500 },
    { name: 'PaperHands', score: 9200 },
  ];

  useEffect(() => {
    if (activeTab !== 'game' || gameOver) return;

    const tickInterval = setInterval(() => {
      setGameStocks(prev => prev.map(st => {
        const randomChange = (Math.random() * 0.08) - 0.04;
        const newPrice = Math.max(10, st.price * (1 + randomChange));
        const computedPct = (((newPrice - st.prevClose) / st.prevClose) * 100).toFixed(2);
        return {
          ...st,
          price: Math.round(newPrice),
          changePct: `${newPrice >= st.prevClose ? '+' : ''}${computedPct}%`,
          history: [...st.history.slice(1), Math.round(newPrice)]
        };
      }));
    }, 5000);

    const secondsInterval = setInterval(() => {
      setAutoSecsLeft(s => {
        if (s <= 1) {
          setDay(d => {
            if (d >= 30) {
              setGameOver(true); 
              return 30;
            }
            return d + 1; 
          });
          setGameStocks(prev => prev.map(st => ({ ...st, prevClose: st.price }))); 
          return 60;
        }
        return s - 1;
      });
    }, 1000);

    const eventsInterval = setInterval(() => {
      if (Math.random() < 0.65) {
        const ev = CHALLENGE_EVENTS_REGISTRY[Math.floor(Math.random() * CHALLENGE_EVENTS_REGISTRY.length)];
        setActiveEvent(ev);
        setGameStocks(prev => prev.map(st => {
          if (st.sym === ev.sym) {
            const modPrice = Math.max(10, st.price * (1 + ev.pct));
            const computedPct = (((modPrice - st.prevClose) / st.prevClose) * 100).toFixed(2);
            return {
              ...st,
              price: Math.round(modPrice),
              changePct: `${modPrice >= st.prevClose ? '+' : ''}${computedPct}%`
            };
          }
          return st;
        }));
        setTimeout(() => setActiveEvent(null), 5000);
      }
    }, 25000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(secondsInterval);
      clearInterval(eventsInterval);
    };
  }, [day, gameOver, activeTab]);

  const getGameHoldingsValue = () => {
    return Object.values(gameHoldings).reduce((sum, h) => {
      const match = gameStocks.find(x => x.sym === h.sym);
      return sum + (match ? match.price * h.shares : 0);
    }, 0);
  };

  const handleGameTrade = (sym, type, qty) => {
    if (gameOver) return;
    const targetStock = gameStocks.find(s => s.sym === sym);
    if (!targetStock || isNaN(qty) || qty <= 0) return;

    const transactionTotal = targetStock.price * qty;

    if (type === 'BUY') {
      if (gameBalance < transactionTotal) {
        alert('Insufficient game credits!');
        return;
      }
      setGameBalance(p => p - transactionTotal);
      setGameHoldings(prev => {
        const existing = prev[sym];
        if (existing) {
          const newShares = existing.shares + qty;
          return { ...prev, [sym]: { sym, shares: newShares, avgPrice: ((existing.avgPrice * existing.shares) + (targetStock.price * qty)) / newShares } };
        }
        return { ...prev, [sym]: { sym, shares: qty, avgPrice: targetStock.price } };
      });
    } else {
      const existing = gameHoldings[sym];
      if (!existing || existing.shares < qty) {
        alert('Not enough assets to fulfill transaction!');
        return;
      }
      setGameBalance(p => p + transactionTotal);
      setGameHoldings(prev => {
        if (prev[sym].shares === qty) {
          const updated = { ...prev };
          delete updated[sym];
          return updated;
        }
        return { ...prev, [sym]: { ...prev[sym], shares: prev[sym].shares - qty } };
      });
    }
  };

  const resetChallengeArena = () => {
    setGameBalance(START_GAME);
    setGameHoldings({});
    setDay(1);
    setAutoSecsLeft(60);
    setGameOver(false);
    setActiveEvent(null);
  }; 

  const currentTotalGameVal = gameBalance + getGameHoldingsValue();
  const sortedLeaderboard = [...FAKE_LB, { name: 'You (Trader)', score: currentTotalGameVal }]
    .sort((a, b) => b.score - a.score); 

  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative max-w-full overflow-x-hidden pt-[112px] pb-16">
      <Navbar />

      {/* TAB NAVIGATION HEADER */}
      <div className="fixed top-16 left-0 right-0 h-12 z-40 bg-[#0f0505] border-b border-[#2b0808] shadow-xl">
        <div className="max-w-[1240px] mx-auto px-4 h-full flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('real')}
            className={`h-full text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center ${activeTab === 'real' ? 'border-[#ff3333] text-[#ff3333]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            📈 Top 20 Sensex Real Simulator
          </button>
          <button 
            onClick={() => setActiveTab('game')}
            className={`h-full text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center ${activeTab === 'game' ? 'border-[#ff3333] text-[#ff3333]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            🏆 30-Day Volatility Challenge
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-[1240px] mx-auto px-4 pt-4 space-y-6">

        {/* ── INTERFACE PANEL A: REAL SIMULATOR MODE ── */}
        {activeTab === 'real' && (
          <div className="space-y-6 animate-fadeInFast">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-[#2b0808] pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Sensex Blue-Chip Portfolio Simulator</h1>
                <p className="text-slate-400 text-xs mt-1 font-medium">Prices synced directly with TradingView BSE/NSE Exchange Data</p>
              </div>
              <div className="flex items-center gap-2 bg-[#1a0808] border border-[#2b0808] px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 font-mono shadow-sm w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> TradingView Direct Feed
              </div>
            </div>

            {/* MARKET REGULATION STATUS TOAST POPUP */}
            {marketStatusMessage && (
              <div className="p-4 rounded-xl font-bold text-xs bg-rose-950/40 border border-rose-900/60 text-rose-300 animate-fadeIn shadow-sm">
                {marketStatusMessage}
              </div>
            )}

            {/* PORTFOLIO METRICS SHEET */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Available Cash Balance</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{Math.round(realBalance).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Holdings Portfolio Value</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{Math.round(getRealHoldingsValue()).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Total Account Net Worth</span>
                <div className="text-lg font-black mt-1 font-mono text-emerald-400">₹{Math.round(realBalance + getRealHoldingsValue()).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Net Margin Return</span>
                <div className={`text-lg font-black mt-1 font-mono ${(realBalance + getRealHoldingsValue() - START_REAL) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ₹{Math.round(realBalance + getRealHoldingsValue() - START_REAL).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* WATCHLIST */}
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl overflow-hidden shadow-xl h-fit">
                <div className="p-4 bg-[#1a0808] border-b border-[#2b0808] font-black text-xs uppercase tracking-wider text-slate-300">
                  Top 20 Sensex Watchlist
                </div>
                <div className="divide-y divide-[#2b0808] max-h-[500px] overflow-y-auto">
                  {STATIC_COMPANY_REGISTRY.map(s => {
                    const priceObj = tvPrices[s.sym] || { price: 0, changePct: 'Syncing...' };
                    const hold = realHoldings[s.sym];
                    return (
                      <button 
                        key={s.sym}
                        onClick={() => setSelectedRealStock(s.sym)}
                        className={`w-full p-3.5 text-left flex justify-between items-center transition-colors hover:bg-[#1a0808] ${selectedRealStock === s.sym ? 'bg-[#1a0808] border-l-4 border-l-[#ff3333]' : ''}`}
                      >
                        <div>
                          <div className="font-black text-sm text-white">{s.sym}</div>
                          <div className="text-[11px] text-slate-400 font-medium max-w-[140px] truncate">{s.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-white">
                            {priceObj.price > 0 ? `₹${priceObj.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Syncing TV...'}
                          </div>
                          <div className={`text-[11px] font-bold ${priceObj.changePct.startsWith('-') ? 'text-rose-500' : 'text-emerald-400'}`}>
                            {priceObj.changePct}
                          </div>
                          {hold && <div className="text-[10px] text-[#ff3333] font-black mt-0.5">{hold.shares} Shares</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE ORDER WORK DESK */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0f0505] border border-[#2b0808] p-6 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-black text-[#ff3333] bg-[#1a0808] border border-[#2b0808] px-2.5 py-1 rounded-md tracking-wider">
                        {mergedActiveRealStock.sector}
                      </span>
                      <h2 className="text-xl font-black text-white mt-2.5">{mergedActiveRealStock.name}</h2>
                      <div className="text-2xl font-black font-mono text-white mt-1">
                        {mergedActiveRealStock.price > 0 
                          ? `₹${mergedActiveRealStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                          : 'Syncing Price...'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order Quantity Size</label>
                      <input 
                        type="number"
                        min="1"
                        value={realQtyInput}
                        onChange={e => setRealQtyInput(e.target.value)}
                        className="w-full border border-[#2b0808] rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#7a0000] bg-[#1a0808]"
                      />
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button 
                        onClick={() => handleRealTrade(selectedRealStock, 'BUY')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase font-black tracking-wider py-3 rounded-xl shadow-md transition-all"
                      >
                        Buy Asset
                      </button>
                      <button 
                        onClick={() => handleRealTrade(selectedRealStock, 'SELL')}
                        className="flex-1 bg-rose-700 hover:bg-rose-800 text-white text-xs uppercase font-black tracking-wider py-3 rounded-xl shadow-md transition-all"
                      >
                        Sell Asset
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#1a0808] border border-[#2b0808] p-4 rounded-xl space-y-2.5 text-xs">
                    <h3 className="font-black uppercase text-slate-400 tracking-wider text-[10px]">Asset Valuation Profile</h3>
                    <div className="flex justify-between border-b border-[#2b0808] pb-2">
                      <span className="text-slate-400">Market Cap:</span>
                      <span className="font-bold text-white">{mergedActiveRealStock.cap}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#2b0808] pb-2">
                      <span className="text-slate-400">P/E Margin:</span>
                      <span className="font-bold font-mono text-white">{mergedActiveRealStock.pe}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#2b0808] pb-2">
                      <span className="text-slate-400">EPS Yield:</span>
                      <span className="font-bold font-mono text-white">₹{mergedActiveRealStock.eps}</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-slate-400">Yield Div:</span>
                      <span className="font-bold text-white">{mergedActiveRealStock.div}</span>
                    </div>
                  </div>
                </div>

                {/* TRADINGVIEW CONTAINER */}
                <div className="bg-[#000000] border border-[#2b0808] rounded-2xl overflow-hidden shadow-xl relative h-[420px] w-full">
                  {isChartSyncing && (
                    <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center text-xs font-bold text-[#ff3333] animate-pulse">
                      ⚡ Syncing TradingView Data Feeds...
                    </div>
                  )}
                  <div ref={chartContainerRef} className="w-full h-full" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── INTERFACE PANEL B: GAMIFIED CHALLENGE ARENA ── */}
        {activeTab === 'game' && (
          <div className="space-y-6 animate-fadeInFast">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-[#2b0808] pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">30-Day Volatility Challenge</h1>
                <p className="text-slate-400 text-xs mt-1 font-medium">10 simulated high-beta assets • Dynamic event updates • Starting allocation: ₹10,000</p>
              </div>
              <div className="flex items-center gap-4 bg-[#0f0505] border border-[#2b0808] px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm w-fit">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Engine Active
                </div>
                <div className="text-slate-400">Next Step: <span className="font-mono font-black text-[#ff3333]">{autoSecsLeft}s</span></div>
              </div>
            </div>

            <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-xl">
              <div>
                <div className="text-base font-black text-white">Challenge Timeline: Day {day} / 30</div>
                <div className="text-xs text-slate-400 font-medium">Market prices shift every 5 seconds.</div>
              </div>
              <div className="w-full sm:max-w-xs h-3 bg-[#1a0808] rounded-full overflow-hidden border border-[#2b0808]">
                <div className="h-full bg-gradient-to-r from-[#7a0000] to-[#ff3333] transition-all" style={{ width: `${(day / 30) * 100}%` }} />
              </div>
            </div>

            {activeEvent && (
              <div className={`p-4 rounded-xl border text-xs font-black shadow-sm ${activeEvent.col}`}>
                📢 Broadcast Alert: {activeEvent.msg}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Game Cash Balance</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{gameBalance.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Positions Valuation</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{getGameHoldingsValue().toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Total Worth</span>
                <div className="text-lg font-black mt-1 font-mono text-[#ff3333]">₹{currentTotalGameVal.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Arena Net P&L</span>
                <div className={`text-lg font-black mt-1 font-mono ${(currentTotalGameVal - START_GAME) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ₹{(currentTotalGameVal - START_GAME).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {gameStocks.map(st => {
                  const hold = gameHoldings[st.sym];
                  return (
                    <div key={st.sym} className="bg-[#0f0505] border border-[#2b0808] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                      <div>
                        <div className="font-black text-white text-base">{st.sym}</div>
                        <div className="text-xs text-slate-400 font-medium">{st.name}</div>
                      </div>
                      
                      <div className="flex gap-6 items-center">
                        <div>
                          <div className="font-mono font-black text-sm text-white">₹{st.price.toLocaleString('en-IN')}</div>
                          <div className={`text-xs font-bold ${st.changePct.startsWith('-') ? 'text-rose-500' : 'text-emerald-400'}`}>
                            {st.changePct}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-slate-400 bg-[#1a0808] px-3 py-1.5 border border-[#2b0808] rounded-xl">
                          Position: <span className="font-black text-white">{hold ? hold.shares : 0} Sh</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          id={`gq-${st.sym}`}
                          type="number"
                          min="1"
                          defaultValue="1"
                          className="w-14 border border-[#2b0808] bg-[#1a0808] rounded-xl p-2 font-mono font-bold text-center text-xs text-white focus:outline-none focus:border-[#7a0000]"
                        />
                        <button 
                          onClick={() => {
                            const inputVal = parseInt(document.getElementById(`gq-${st.sym}`)?.value || '1');
                            handleGameTrade(st.sym, 'BUY', inputVal);
                          }}
                          disabled={gameOver}
                          className="bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/60 px-3.5 py-2 text-xs font-black rounded-xl transition-all"
                        >
                          Buy
                        </button>
                        <button 
                          onClick={() => {
                            const inputVal = parseInt(document.getElementById(`gq-${st.sym}`)?.value || '1');
                            handleGameTrade(st.sym, 'SELL', inputVal);
                          }}
                          disabled={gameOver || !hold}
                          className="bg-rose-950/40 hover:bg-rose-700 text-rose-400 hover:text-white border border-rose-900/60 px-3.5 py-2 text-xs font-black rounded-xl transition-all disabled:opacity-40"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ARENA LEADERBOARD STANDINGS */}
              <div className="space-y-4">
                <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 border-b border-[#2b0808] pb-2">Arena Leaderboard</h3>
                  <div className="space-y-2">
                    {sortedLeaderboard.map((player, idx) => (
                      <div 
                        key={player.name}
                        className={`flex justify-between items-center text-xs p-2.5 rounded-xl border ${player.name.includes('You') ? 'bg-[#1a0808] border-[#7a0000] font-black text-[#ff3333]' : 'border-[#2b0808] bg-[#0f0505] text-slate-300'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-500">#{idx + 1}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="font-mono font-bold">₹{Math.round(player.score).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={resetChallengeArena}
                    className="w-full text-center py-2.5 border border-[#2b0808] hover:border-rose-900/60 text-slate-400 hover:text-rose-400 text-xs font-bold bg-[#1a0808] rounded-xl transition-all"
                  >
                    Reset Challenge Session
                  </button>
                </div>

                {gameOver && (
                  <div className="bg-gradient-to-br from-[#7a0000] to-black border border-[#a30000] text-white p-6 rounded-2xl shadow-2xl space-y-4 animate-scaleUp">
                    <div className="text-4xl text-center">🏁</div>
                    <div className="text-center space-y-1">
                      <h2 className="font-black text-lg">Challenge Concluded!</h2>
                      <p className="text-rose-200/80 text-xs">Your portfolio generated a final standing valuation of:</p>
                    </div>
                    <div className="text-2xl font-black font-mono text-center bg-black/40 p-3 rounded-xl border border-white/10">
                      ₹{Math.round(currentTotalGameVal).toLocaleString('en-IN')}
                    </div>
                    <button 
                      onClick={resetChallengeArena}
                      className="w-full py-3 bg-[#ff3333] hover:bg-[#dc2626] text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition-all"
                    >
                      Initialize New Arena Setup
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}