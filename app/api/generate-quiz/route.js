import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CRITICAL: Force Next.js and Vercel to treat this route as completely dynamic on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Basic verification to fail early if Vercel drops the environment variables configuration
    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY environment variable setup.");
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          description: "List of exactly 15 unique financial multiple choice questions.",
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

    const prompt = `
      Generate a list of exactly 15 unique multiple-choice questions about corporate finance, the stock market, trading metrics, and Indian capital markets (NSE/BSE).
      
      Requirements:
      1. Every single question must have completely different question text.
      2. The correct_option field must be dynamically evaluated based on the question (do not hardcode the same letter).
      3. The correct answers must be naturally distributed across A, B, C, and D throughout the array.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up response string if markdown tags wrapped the JSON payload array
    const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
    const quizData = JSON.parse(cleanJsonString);

    // Explicitly add cache-busting headers so the browser doesn't save previous failures
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