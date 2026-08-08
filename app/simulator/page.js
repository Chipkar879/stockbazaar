'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';

// Static company registry configuration
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
  { msg: 'Tech sector crash! TECH -20%', sym: 'TECH', pct: -0.20, col: 'text-rose-400 bg-rose-950/40 border-rose-900/60' },
  { msg: 'Green energy boom! GRN +25%', sym: 'GRN', pct: 0.25, col: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' },
  { msg: 'Moon mission funded! MOON +28%', sym: 'MOON', pct: 0.28, col: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' },
  { msg: 'Chip shortage! CHIP -15%', sym: 'CHIP', pct: -0.15, col: 'text-rose-400 bg-rose-950/40 border-rose-900/60' }
];

export default function CombinedSimulator() {
  const [activeTab, setActiveTab] = useState('real'); 

  // =========================================================================
  // ── 1. REAL PORTFOLIO SIMULATOR STATE ────────────────────────────────────
  // =========================================================================
  const START_REAL = 50000; 
  const [realBalance, setRealBalance] = useState(START_REAL);
  const [realHoldings, setRealHoldings] = useState({});
  const [selectedRealStock, setSelectedRealStock] = useState('RELIANCE');
  const [realQtyInput, setRealQtyInput] = useState('1');
  const [isChartSyncing, setIsChartSyncing] = useState(false);
  const [marketStatusMessage, setMarketStatusMessage] = useState('');

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

  const activeStaticContext = STATIC_COMPANY_REGISTRY.find(x => x.sym === selectedRealStock) || STATIC_COMPANY_REGISTRY[0];
  const activeStatePriceObj = realStocks.find(x => x.sym === selectedRealStock) || realStocks[0];
  
  const mergedActiveRealStock = {
    ...activeStaticContext,
    price: activeStatePriceObj.price,
    changePct: activeStatePriceObj.changePct
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
    <main className="min-h-screen bg-black text-slate-100 antialiased font-sans relative max-w-full overflow-x-hidden pt-16 pb-16">
      <Navbar />

      {/* STICKY SELECTOR TAB BAR (Pins directly at top-16 beneath Navbar) */}
      <div className="bg-[#0f0505] border-b border-[#2b0808] sticky top-16 z-40 shadow-xl backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-4 flex gap-6">
          <button 
            onClick={() => setActiveTab('real')}
            className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'real' ? 'border-[#ff3333] text-[#ff3333]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            📈 Real Indian Equity Simulator
          </button>
          <button 
            onClick={() => setActiveTab('game')}
            className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'game' ? 'border-[#ff3333] text-[#ff3333]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            🏆 30-Day Volatility Challenge
          </button>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 pt-6 space-y-6">

        {/* ── INTERFACE PANEL A: REAL SIMULATOR MODE ── */}
        {activeTab === 'real' && (
          <div className="space-y-6 animate-fadeInFast">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-[#2b0808] pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Real Equity Portfolio Simulator</h1>
                <p className="text-slate-400 text-xs mt-1 font-medium">Live streaming tickers via internal proxy networks (.NS indices) • Initial Capital: ₹50,000</p>
              </div>
              <div className="flex items-center gap-2 bg-[#1a0808] border border-[#2b0808] px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 font-mono shadow-sm w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> NSE / BSE Market Session Sync
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
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Available Cash</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{Math.round(realBalance).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Holdings Portfolio Value</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{Math.round(getRealHoldingsValue()).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Total Account Net Worth</span>
                <div className="text-lg font-black mt-1 font-mono text-white">₹{Math.round(realBalance + getRealHoldingsValue()).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl p-4 shadow-xl">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Net Margin Return</span>
                <div className={`text-lg font-black mt-1 font-mono ${(realBalance + getRealHoldingsValue() - START_REAL) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ₹{Math.round(realBalance + getRealHoldingsValue() - START_REAL).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* STOCKS MATRIX WATCHLIST */}
              <div className="bg-[#0f0505] border border-[#2b0808] rounded-2xl overflow-hidden shadow-xl h-fit">
                <div className="p-4 bg-[#1a0808] border-b border-[#2b0808] font-black text-xs uppercase tracking-wider text-slate-300">
                  NSE Watchlist Matrix
                </div>
                <div className="divide-y divide-[#2b0808] max-h-[500px] overflow-y-auto">
                  {realStocks.map(st => {
                    const registryInfo = STATIC_COMPANY_REGISTRY.find(r => r.sym === st.sym) || {};
                    const hold = realHoldings[st.sym];
                    return (
                      <button 
                        key={st.sym}
                        onClick={() => setSelectedRealStock(st.sym)}
                        className={`w-full p-3.5 text-left flex justify-between items-center transition-colors hover:bg-[#1a0808] ${selectedRealStock === st.sym ? 'bg-[#1a0808] border-l-4 border-l-[#ff3333]' : ''}`}
                      >
                        <div>
                          <div className="font-black text-sm text-white">{st.sym}</div>
                          <div className="text-[11px] text-slate-400 font-medium max-w-[140px] truncate">{registryInfo.name || st.sym}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-white">₹{st.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className={`text-[11px] font-bold ${st.changePct.startsWith('-') ? 'text-rose-500' : 'text-emerald-400'}`}>
                            {st.changePct}
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
                        ₹{mergedActiveRealStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

                {/* ADVANCED TRADINGVIEW CORE ENGINE PLATFORM CONTAINER */}
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
                        <div className="text-xs text-[#94a3b8] font-medium">{st.name}</div>
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

              {/* ARENA RUNTIME SCORE BOARD STANDINGS */}
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