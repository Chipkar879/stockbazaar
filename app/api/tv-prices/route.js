import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tickers } = body;

    const response = await fetch('https://scanner.tradingview.com/india/scan', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({
        symbols: { tickers: tickers || [] },
        columns: ['close', 'change']
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'TradingView fetch failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}