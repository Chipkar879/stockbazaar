import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'RELIANCE';

  // Map symbols to exact Yahoo Finance tickers (.NS is National Stock Exchange of India)
  const tickerMap = {
    'RELIANCE': 'RELIANCE.NS',
    'TATAMOTORS': 'TATAMOTORS.NS',
    'INFY': 'INFY.NS',
    'HDFCBANK': 'HDFCBANK.NS'
  };

  const targetTicker = tickerMap[symbol] || `${symbol}.NS`;
  
  // Connect to the public live query endpoint used by financial apps
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${targetTicker}?interval=1m&range=1d`;

  try {
    const res = await fetch(url, { cache: 'no-store' }); // Disable Next.js caching loop
    const data = await res.json();
    
    const result = data.chart.result[0];
    const meta = result.meta;
    
    const livePrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;
    
    // Calculate precise percentage movement
    const rawChange = livePrice - previousClose;
    const percentChange = ((rawChange / previousClose) * 100).toFixed(2);
    const formattedChange = rawChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;

    return NextResponse.json({
      price: parseFloat(livePrice.toFixed(2)),
      change: formattedChange,
      high: parseFloat(meta.regularMarketDayHigh?.toFixed(2) || livePrice),
      low: parseFloat(meta.regularMarketDayLow?.toFixed(2) || livePrice),
      isSimulatedStream: false
    });
  } catch (error) {
    console.error("Live scrap breakdown:", error);
    return NextResponse.json({ error: "Failed fetching real-time market array" }, { status: 500 });
  }
}