import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        // This forces Gemini to follow this exact data structure structurally
        responseSchema: {
          type: SchemaType.ARRAY,
          description: "List of exactly 15 unique financial multiple choice questions.",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.INTEGER },
              question_text: { type: SchemaType.STRING },
              option_a: { type: SchemaType.STRING },
              option_b: { type: SchemaType.STRING },
              option_c: { type: SchemaType.STRING },
              option_d: { type: SchemaType.STRING },
              correct_option: { 
                type: SchemaType.STRING, 
                description: "The genuine correct answer key letter. Must be evenly distributed across A, B, C, and D for all 15 questions." 
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
    const quizData = JSON.parse(responseText);

    return NextResponse.json(quizData);
  } catch (error) {
    console.error("Gemini runtime API failure:", error);
    return NextResponse.json({ error: "Failed to generate AI quiz data stream" }, { status: 500 });
  }
}