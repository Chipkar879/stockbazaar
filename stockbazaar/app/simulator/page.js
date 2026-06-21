'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';

// Static configurations placed outside the render tree to ensure zero reference leakage or state dependency loop cycles
const STATIC_COMPANY_REGISTRY = [
  { sym: 'RELIANCE', name: 'Reliance Industries Ltd.', tv: 'BSE:RELIANCE', yahoo: 'RELIANCE.NS', sector: 'Energy & Retail', cap: '₹17.9L Cr', pe: 37.7, eps: 35.2, div: '0.61%' },
  { sym: 'TCS', name: 'Tata Consultancy Services', tv: 'BSE:TCS', yahoo: 'TCS.NS', sector: 'Information Technology', cap: '₹7.8L Cr', pe: 15.8, eps: 136.0, div: '2.33%' },
  { sym: 'INFY', name: 'Infosys Ltd.', tv: 'BSE:INFY', yahoo: 'INFY.NS', sector: 'Information Technology', cap: '₹4.3L Cr', pe: 14.7, eps: 71.4, div: '4.55%' },
  { sym: 'HDFCBANK', name: 'HDFC Bank Ltd.', tv: 'BSE:HDFCBANK', yahoo: 'HDFCBANK.NS', sector: 'Banking & Finance', cap: '₹5.9L Cr', pe: 15.8, eps: 49.2, div: '1.66%' },
  { sym: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', tv: 'BSE:BAJFINANCE', yahoo: 'BAJFINANCE.NS', sector: 'NBFC', cap: '₹3.9L Cr', pe: 26.4, eps: 210.5, div: '0.35%' },
  { sym: 'WIPRO', name: 'Wipro Ltd.', tv: 'BSE:WIPRO', yahoo: 'WIPRO.NS', sector: 'Information Technology', cap: '₹2.1L Cr', pe: 20.1, eps: 18.5, div: '0.25%' },
  { sym: 'SUNPHARMA', name: 'Sun Pharmaceutical Ind.', tv: 'BSE:SUNPHARMA', yahoo: 'SUNPHARMA.NS', sector: 'Pharmaceuticals', cap: '₹3.6L Cr', pe: 34.2, eps: 41.0, div: '0.80%' },
  { sym: 'ICICIBANK', name: 'ICICI Bank Ltd.', tv: 'BSE:ICICIBANK', yahoo: 'ICICIBANK.NS', sector: 'Banking & Finance', cap: '₹7.8L Cr', pe: 16.1, eps: 68.2, div: '0.85%' },
  { sym: 'ASIANPAINT', name: 'Asian Paints Ltd.', tv: 'BSE:ASIANPAINT', yahoo: 'ASIANPAINT.NS', sector: 'Consumer Goods', cap: '₹2.1L Cr', pe: 48.2, eps: 44.1, div: '1.20%' },
  { sym: 'TATAMOTORS', name: 'Tata Motors Ltd.', tv: 'BSE:TATAMOTORS', yahoo: 'TATAMOTORS.NS', sector: 'Automobiles', cap: '₹2.4L Cr', pe: 8.5, eps: 78.4, div: '0.00%' }
];

const UNIFIED_SYMBOLS_QUERY = STATIC_COMPANY_REGISTRY.map(s => s.yahoo).join(',');

const CHALLENGE_EVENTS_REGISTRY = [
  { msg: 'Tech sector crash! TECH -20%', sym: 'TECH', pct: -0.20, col: 'text-red-500 bg-red-50 border-red-200' },
  { msg: 'Green energy boom! GRN +25%', sym: 'GRN', pct: 0.25, col: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { msg: 'Moon mission funded! MOON +28%', sym: 'MOON', pct: 0.28, col: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { msg: 'Chip shortage! CHIP -15%', sym: 'CHIP', pct: -0.15, col: 'text-red-500 bg-red-50 border-red-200' }
];

export default function CombinedSimulator() {
  // Navigation State between Core Simulator Modules
  const [activeTab, setActiveTab] = useState('real'); 

  // =========================================================================
  // ── 1. REAL PORTFOLIO SIMULATOR STATE & DATA (Yahoo Finance Live Proxy) ──
  // =========================================================================
  const START_REAL = 50000; 
  const [realBalance, setRealBalance] = useState(START_REAL);
  const [realHoldings, setRealHoldings] = useState({});
  const [selectedRealStock, setSelectedRealStock] = useState('RELIANCE');
  const [realQtyInput, setRealQtyInput] = useState('1');
  const [isChartSyncing, setIsChartSyncing] = useState(false);
  const [marketStatusMessage, setMarketStatusMessage] = useState('');

  // CORRECTED STATE ARRAYS: Synchronized base prices directly matching live split metrics
  const [realStocks, setRealStocks] = useState([
    { sym: 'RELIANCE', price: 1309.35, changePct: '+0.15%' },
    { sym: 'TCS', price: 2199.00, changePct: '-0.32%' },
    { sym: 'INFY', price: 1143.60, changePct: '+0.70%' },
    { sym: 'HDFCBANK', price: 779.80, changePct: '-0.15%' },
    { sym: 'BAJFINANCE', price: 6350.00, changePct: '+1.05%' },
    { sym: 'WIPRO', price: 410.00, changePct: '+0.45%' },
    { sym: 'SUNPHARMA', price: 1540.00, changePct: '+0.60%' },
    { sym: 'ICICIBANK', price: 1120.00, changePct: '-0.25%' },
    { sym: 'ASIANPAINT', price: 2280.00, changePct: '-0.85%' },
    { sym: 'TATAMOTORS', price: 715.00, changePct: '+2.12%' }
  ]); 

  const chartContainerRef = useRef(null);

  // Parse structural detail references efficiently
  const activeStaticContext = STATIC_COMPANY_REGISTRY.find(x => x.sym === selectedRealStock) || STATIC_COMPANY_REGISTRY[0];
  const activeStatePriceObj = realStocks.find(x => x.sym === selectedRealStock) || realStocks[0];
  
  const mergedActiveRealStock = {
    ...activeStaticContext,
    price: activeStatePriceObj.price,
    changePct: activeStatePriceObj.changePct
  };

  // 🏛️ REAL-TIME MARKET HOUR VALIDATION GATE (IST: Mon-Fri, 9:15 AM to 3:30 PM)
  const verifyMarketIsActive = () => {
    const indianTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(indianTimeStr);
    
    const dayOfWeek = istDate.getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = istDate.getHours();
    const currentMinute = istDate.getMinutes();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    const absoluteMinutes = (currentHour * 60) + currentMinute;
    const sessionOpenMinutes = (9 * 60) + 15;  // 09:15 AM IST
    const sessionCloseMinutes = (15 * 60) + 30; // 03:30 PM IST
    
    return absoluteMinutes >= sessionOpenMinutes && absoluteMinutes <= sessionCloseMinutes;
  };

  // Multi-Ticker Price Sync Hook matching real.txt proxy standard
  useEffect(() => {
    if (activeTab !== 'real') return;

    async function fetchLiveProxyPrices() {
      try {
        const response = await fetch(`/api/prices?symbols=${encodeURIComponent(UNIFIED_SYMBOLS_QUERY)}`);
        const json = await response.json();
        const prices = json.prices || {};

        setRealStocks(prevStocks => prevStocks.map(st => {
          const registryMatch = STATIC_COMPANY_REGISTRY.find(r => r.sym === st.sym);
          const matchData = registryMatch ? prices[registryMatch.yahoo] : null;
          
          if (matchData && matchData.price > 0) {
            const currentPrice = matchData.price;
            const baseClose = matchData.prevClose || currentPrice;
            const pct = (((currentPrice - baseClose) / baseClose) * 100).toFixed(2);
            return {
              ...st,
              price: parseFloat(currentPrice.toFixed(2)),
              changePct: `${currentPrice >= baseClose ? '+' : ''}${pct}%`
            };
          }
          return st;
        }));
      } catch (err) {
        // Safe continuous simulation loop drifting from the corrected baseline values if backend is initializing
        setRealStocks(prevStocks => prevStocks.map(st => {
          if (st.sym === selectedRealStock) {
            const drift = (Math.random() * 0.0012) - 0.0006;
            const updatedPrice = st.price * (1 + drift);
            return {
              ...st,
              price: parseFloat(updatedPrice.toFixed(2)),
              changePct: `${drift >= 0 ? '+' : ''}${(drift * 100).toFixed(2)}%`
            };
          }
          return st;
        }));
      }
    }

    fetchLiveProxyPrices();
    const syncToken = setInterval(fetchLiveProxyPrices, 10000); 
    return () => clearInterval(syncToken);
  }, [activeTab, selectedRealStock]);

  // OFFICIAL TRADINGVIEW CLIENT WIDGET ENGINE MOUNT
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
      scriptTag.onload = () => {
        setTimeout(initializeAdvancedChart, 200);
      };
      document.head.appendChild(scriptTag);
    } else {
      initializeAdvancedChart();
    }
  }, [selectedRealStock, activeTab, mergedActiveRealStock.tv]);

  const getRealHoldingsValue = () => {
    return Object.values(realHoldings).reduce((sum, h) => {
      const match = realStocks.find(x => x.sym === h.sym);
      return sum + (match ? match.price * h.shares : 0);
    }, 0);
  };

  const handleRealTrade = (sym, type) => {
    // Market session parameter constraint check
    if (!verifyMarketIsActive()) {
      setMarketStatusMessage("🚨 Order Rejected: Indian Stock Exchanges (NSE/BSE) are currently closed. Live trading is only permitted Monday to Friday, 9:15 AM – 3:30 PM IST.");
      setTimeout(() => setMarketStatusMessage(''), 8000);
      return;
    }

    const qty = parseInt(realQtyInput);
    if (isNaN(qty) || qty <= 0) return;

    const targetStock = realStocks.find(s => s.sym === sym);
    if (!targetStock) return;

    const transactionTotal = targetStock.price * qty;

    if (type === 'BUY') {
      if (realBalance < transactionTotal) {
        alert('Insufficient funds in Real Simulator account!');
        return;
      }
      setRealBalance(p => p - transactionTotal);
      setRealHoldings(prev => {
        const existing = prev[sym];
        if (existing) {
          const newShares = existing.shares + qty;
          const newAvg = ((existing.avgPrice * existing.shares) + (targetStock.price * qty)) / newShares;
          return { ...prev, [sym]: { sym, shares: newShares, avgPrice: newAvg } };
        }
        return { ...prev, [sym]: { sym, shares: qty, avgPrice: targetStock.price } };
      });
    } else {
      const existing = realHoldings[sym];
      if (!existing || existing.shares < qty) {
        alert('Not enough shares to execute this transaction!');
        return;
      }
      setRealBalance(p => p + transactionTotal);
      setRealHoldings(prev => {
        const currentHold = prev[sym];
        if (currentHold.shares === qty) {
          const updated = { ...prev };
          delete updated[sym];
          return updated;
        }
        return { ...prev, [sym]: { ...currentHold, shares: currentHold.shares - qty } };
      });
    }
  };

  // =========================================================================
  // ── 2. GAMIFIED CHALLENGE ARENA STATE & DATA (From game.txt) ─────────────
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
    <main className="min-h-screen bg-[#f5f7ff] text-[#1e1b4b] antialiased font-sans pb-12">
      <Navbar />

      {/* DYNAMIC TOP NAVIGATION SELECTOR TAB SYSTEM */}
      <div className="bg-white border-b border-[#e0e5f2] sticky top-[65px] z-40 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 flex gap-4">
          <button 
            onClick={() => setActiveTab('real')}
            className={`py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'real' ? 'border-[#0891b2] text-[#0891b2]' : 'border-transparent text-[#64748b] hover:text-[#1e1b4b]'}`}
          >
            📈 Real Indian Portfolio Simulator
          </button>
          <button 
            onClick={() => setActiveTab('game')}
            className={`py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'game' ? 'border-[#7c3aed] text-[#7c3aed]' : 'border-transparent text-[#64748b] hover:text-[#1e1b4b]'}`}
          >
            🏆 30-Day Game Arena Challenge
          </button>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 mt-8 space-y-6">

        {/* ── INTERFACE PANEL A: REAL SIMULATOR MODE ── */}
        {activeTab === 'real' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">Real Equity Portfolio Simulator</h1>
                <p className="text-[#64748b] text-xs mt-1">Live streaming tickers via internal proxy networks (.NS indices) • Starting allocation: ₹50,000</p>
              </div>
              <div className="flex items-center bg-white border border-[#e0e5f2] px-4 py-2 rounded-xl shadow-sm text-sm font-extrabold font-mono">
                🇮🇳 Market Session Synchronized
              </div>
            </div>

            {/* MARKET REGULATION STATUS TOAST POPUP */}
            {marketStatusMessage && (
              <div className="p-4 rounded-xl font-bold text-xs bg-rose-50 border border-rose-200 text-rose-700 animate-fadeIn shadow-sm">
                {marketStatusMessage}
              </div>
            )}

            {/* PORTFOLIO METRICS SHEET */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Available Cash</span>
                <div className="text-lg font-black mt-1 font-mono">₹{Math.round(realBalance).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Securities Holdings Value</span>
                <div className="text-lg font-black mt-1 font-mono">₹{Math.round(getRealHoldingsValue()).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Total Account Value</span>
                <div className="text-lg font-black mt-1 font-mono">₹{Math.round(realBalance + getRealHoldingsValue()).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Net Margin Return</span>
                <div className={`text-lg font-black mt-1 font-mono ${(realBalance + getRealHoldingsValue() - START_REAL) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{Math.round(realBalance + getRealHoldingsValue() - START_REAL).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* STOCKS MATRIX WATCHLIST */}
              <div className="bg-white border border-[#e0e5f2] rounded-xl overflow-hidden shadow-sm h-fit">
                <div className="p-4 bg-[#f8fafc] border-b border-[#e0e5f2] font-black text-xs uppercase tracking-wider text-[#1e1b4b]">
                  NSE Stocks Watchlist Matrix
                </div>
                <div className="divide-y divide-[#e0e5f2] max-h-[500px] overflow-y-auto">
                  {realStocks.map(st => {
                    const registryInfo = STATIC_COMPANY_REGISTRY.find(r => r.sym === st.sym) || {};
                    const hold = realHoldings[st.sym];
                    return (
                      <button 
                        key={st.sym}
                        onClick={() => setSelectedRealStock(st.sym)}
                        className={`w-full p-4 text-left flex justify-between items-center transition-colors hover:bg-slate-50 ${selectedRealStock === st.sym ? 'bg-cyan-50/40 border-l-4 border-l-[#0891b2]' : ''}`}
                      >
                        <div>
                          <div className="font-black text-sm text-[#1e1b4b]">{st.sym}</div>
                          <div className="text-[11px] text-[#64748b] font-medium max-w-[150px] truncate">{registryInfo.name || st.sym}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs">₹{st.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className={`text-[11px] font-bold ${st.changePct.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {st.changePct}
                          </div>
                          {hold && <div className="text-[10px] text-[#0891b2] font-extrabold mt-0.5">{hold.shares} Shares</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE ORDER WORK DESK */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-[#e0e5f2] p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#0891b2] tracking-wider bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                        {mergedActiveRealStock.sector}
                      </span>
                      <h2 className="text-xl font-black text-[#1e1b4b] mt-2">{mergedActiveRealStock.name}</h2>
                      <div className="text-2xl font-black font-mono text-[#1e1b4b] mt-1">
                        ₹{mergedActiveRealStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Order Quantity Size</label>
                      <input 
                        type="number"
                        min="1"
                        value={realQtyInput}
                        onChange={e => setRealQtyInput(e.target.value)}
                        className="w-full border-2 border-[#e0e5f2] rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-[#1e1b4b] focus:outline-none focus:border-[#0891b2] bg-[#f5f7ff]"
                      />
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button 
                        onClick={() => handleRealTrade(selectedRealStock, 'BUY')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase font-black tracking-wider py-3 rounded-xl shadow-sm transition-all"
                      >
                        Buy Asset
                      </button>
                      <button 
                        onClick={() => handleRealTrade(selectedRealStock, 'SELL')}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase font-black tracking-wider py-3 rounded-xl shadow-sm transition-all"
                      >
                        Sell Asset
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2.5 text-xs">
                    <h3 className="font-black uppercase text-[#64748b] tracking-wider text-[11px]">Asset Valuation Profile</h3>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-[#64748b]">Market Cap:</span>
                      <span className="font-bold text-[#1e1b4b]">{mergedActiveRealStock.cap}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-[#64748b]">P/E Margin:</span>
                      <span className="font-bold font-mono text-[#1e1b4b]">{mergedActiveRealStock.pe}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-[#64748b]">EPS Yield:</span>
                      <span className="font-bold font-mono text-[#1e1b4b]">₹{mergedActiveRealStock.eps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Yield Div:</span>
                      <span className="font-bold text-[#1e1b4b]">{mergedActiveRealStock.div}</span>
                    </div>
                  </div>
                </div>

                {/* ADVANCED TRADINGVIEW CORE ENGINE PLATFORM CONTAINER */}
                <div className="bg-[#131722] border border-[#e0e5f2] rounded-xl overflow-hidden shadow-md relative h-[420px] w-full">
                  {isChartSyncing && (
                    <div className="absolute inset-0 bg-[#131722]/80 z-20 flex items-center justify-center text-xs font-bold text-cyan-400 animate-pulse">
                      ⚡ Syncing Exchange Data Arrays...
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
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">30-Day Volatility Challenge</h1>
                <p className="text-[#64748b] text-xs mt-1">10 simulated high-beta assets • Automatic progress loop mechanics • Starting capital allocation: ₹10,000</p>
              </div>
              <div className="flex items-center gap-4 bg-white border border-[#e0e5f2] px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold">
                <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Engine Live
                </div>
                <div className="text-[#64748b]">Next Day Auto-Advance: <span className="font-mono font-black text-[#7c3aed]">{autoSecsLeft}s</span></div>
              </div>
            </div>

            <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-sm">
              <div>
                <div className="text-lg font-black text-[#7c3aed]">Challenge Timeline: Day {day} / 30</div>
                <div className="text-xs text-[#64748b]">Prices update systematically every 5 seconds.</div>
              </div>
              <div className="w-full sm:max-w-xs h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#0891b2] transition-all" style={{ width: `${(day / 30) * 100}%` }} />
              </div>
            </div>

            {activeEvent && (
              <div className={`p-4 rounded-xl border text-sm font-bold ${activeEvent.col}`}>
                📢 Broadcast Alert: {activeEvent.msg}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Game Cash Balance</span>
                <div className="text-lg font-black mt-1 font-mono">₹{gameBalance.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Asset Positions Net</span>
                <div className="text-lg font-black mt-1 font-mono">₹{getGameHoldingsValue().toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Total Worth</span>
                <div className="text-lg font-black mt-1 font-mono text-[#7c3aed]">₹{currentTotalGameVal.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">Total Arena Net P&L</span>
                <div className={`text-lg font-black mt-1 font-mono ${(currentTotalGameVal - START_GAME) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{(currentTotalGameVal - START_GAME).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {gameStocks.map(st => {
                  const hold = gameHoldings[st.sym];
                  return (
                    <div key={st.sym} className="bg-white border border-[#e0e5f2] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div>
                        <div className="font-black text-[#1e1b4b] text-base">{st.sym}</div>
                        <div className="text-xs text-[#64748b] font-medium">{st.name}</div>
                      </div>
                      
                      <div className="flex gap-6 items-center">
                        <div>
                          <div className="font-mono font-black text-sm">₹{st.price.toLocaleString('en-IN')}</div>
                          <div className={`text-xs font-bold ${st.changePct.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {st.changePct}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-[#64748b] bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg">
                          Position: <span className="font-bold text-[#1e1b4b]">{hold ? hold.shares : 0} Sh</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          id={`gq-${st.sym}`}
                          type="number"
                          min="1"
                          defaultValue="1"
                          className="w-14 border border-slate-200 bg-[#f5f7ff] rounded-lg p-2 font-mono font-bold text-center text-xs text-[#1e1b4b] focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            const inputVal = parseInt(document.getElementById(`gq-${st.sym}`)?.value || '1');
                            handleGameTrade(st.sym, 'BUY', inputVal);
                          }}
                          disabled={gameOver}
                          className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 px-3 py-2 text-xs font-bold rounded-lg transition-all"
                        >
                          Buy
                        </button>
                        <button 
                          onClick={() => {
                            const inputVal = parseInt(document.getElementById(`gq-${st.sym}`)?.value || '1');
                            handleGameTrade(st.sym, 'SELL', inputVal);
                          }}
                          disabled={gameOver || !hold}
                          className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 px-3 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-40"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ARENA RUNTIME SCORE BOARD STANDINGS */}
              <div className="space-y-4">
                <div className="bg-white border border-[#e0e5f2] rounded-xl p-4 shadow-sm space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-[#64748b] border-b border-slate-100 pb-2">Arena Leaderboard</h3>
                  <div className="space-y-2">
                    {sortedLeaderboard.map((player, idx) => (
                      <div 
                        key={player.name}
                        className={`flex justify-between items-center text-xs p-2.5 rounded-lg border ${player.name.includes('You') ? 'bg-purple-50 border-purple-200 font-extrabold text-[#7c3aed]' : 'border-transparent bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-400">#{idx + 1}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="font-mono font-bold">₹{Math.round(player.score).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={resetChallengeArena}
                    className="w-full text-center py-2.5 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs font-bold bg-[#f5f7ff] rounded-xl transition-all"
                  >
                    Reset Challenge Session
                  </button>
                </div>

                {gameOver && (
                  <div className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white p-6 rounded-xl shadow-lg space-y-4 transform transition-all duration-300">
                    <div className="text-4xl text-center">🏁</div>
                    <div className="text-center">
                      <h2 className="font-black text-lg">Challenge Concluded!</h2>
                      <p className="text-purple-100 text-xs mt-1">Your trading strategies captured a total balance standing metric valuation of:</p>
                    </div>
                    <div className="text-2xl font-black font-mono text-center bg-white/10 p-3 rounded-lg border border-white/10">
                      ₹{Math.round(currentTotalGameVal).toLocaleString('en-IN')}
                    </div>
                    <button 
                      onClick={resetChallengeArena}
                      className="w-full py-3 bg-white text-[#7c3aed] font-black uppercase text-xs tracking-wider rounded-xl hover:bg-purple-50 shadow-md transition-all"
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