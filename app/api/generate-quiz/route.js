import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY environment variable setup.");
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // STRENGTHEN SYSTEM INSTRUCTIONS: Force the model identity into an expert stock broker anchor
      systemInstruction: "You are a specialized stock market analyst and professional trading instructor. Your sole function is to design technical, fundamental, and market structure multiple-choice questions focusing exclusively on stock trading, equity investments, chart patterns, and stock exchange rules.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          description: "List of exactly 15 unique stock market and financial equity trading multiple choice questions.",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "INTEGER" },
              question_text: { type: "STRING" },
              option_a: { type: "STRING" },
              option_b: { type: "STRING" },
              option_c: { type: "STRING" },
              option_d: { type: "STRING" },
              correct_option: { 
                type: "STRING", 
                description: "The calculated correct answer key option letter. Must be randomly balanced between A, B, C, and D across the list." 
              },
            },
            required: ["id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"],
          },
        },
      }
    });

    // RESTRUCTURED PROMPT: Explicitly bans generic math/corporate finance, focuses strictly on the stock arena
    const prompt = `
      Generate a list of exactly 15 unique multiple-choice questions focusing exclusively on Stock Market Mechanics, Equity Trading, Derivatives (Options/Futures), Portfolio Allocation, Technical Chart Analysis, and Indian Stock Exchanges (NSE, BSE, SEBI guidelines).
      
      Strict Topic Scope Matrix:
      - Equity definitions, price action metrics, stock split mechanics, order types (Limit, Market, Stop-loss).
      - Technical analysis (RSI, Moving Averages, MACD, Candlestick structures, Support/Resistance ceilings).
      - Fundamental analysis ratios specifically tracking stocks (P/E ratio, EPS, Debt-to-Equity, Dividend Yields).
      - Indian Capital Markets rules, circuit breakers, Nifty 50 and Sensex indexing tracking layouts, T+1 settlement rules.
      
      Banned Topics: Do not include general corporate management, accounting bookkeeping bookkeeping, basic economics, math puzzles, or generic banking trivia.
      
      Requirements:
      1. Every single question must have completely different, high-quality stock market question text.
      2. The correct_option field must be dynamically evaluated based on the question.
      3. The correct answers must be naturally distributed across A, B, C, and D throughout the array.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
    const quizData = JSON.parse(cleanJsonString);

    return NextResponse.json(quizData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Gemini runtime API failure:", error);
    return NextResponse.json({ error: "Failed to generate dynamic context pool" }, { status: 500 });
  }
}