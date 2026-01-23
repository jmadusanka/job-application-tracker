// lib/gemini.ts  ← change this file

import { GoogleGenerativeAI } from '@google/generative-ai';

// Change from GEMINI_API_KEY → NEXT_PUBLIC_GEMINI_API_KEY
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini key missing! Check .env.local → NEXT_PUBLIC_GEMINI_API_KEY");
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });