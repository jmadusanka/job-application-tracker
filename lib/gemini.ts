// lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Gemini API key missing! Check .env.local → NEXT_PUBLIC_GEMINI_API_KEY');
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Strict schema with VERY SMALL maxItems to guarantee completion
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallMatch: { type: SchemaType.NUMBER },
    subScores: {
      type: SchemaType.OBJECT,
      properties: {
        skillsMatch: { type: SchemaType.NUMBER },
        experienceMatch: { type: SchemaType.NUMBER },
        languageLocationMatch: { type: SchemaType.NUMBER },
      },
      required: ['skillsMatch', 'experienceMatch', 'languageLocationMatch'],
    },
    atsScore: { type: SchemaType.NUMBER },
    matchedSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 6 },
    missingSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 6 },
    suggestions: {
      type: SchemaType.ARRAY,
      maxItems: 3,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING },
          text: { type: SchemaType.STRING },
          priority: { type: SchemaType.STRING, enum: ['low', 'medium', 'high'] },
        },
        required: ['category', 'text', 'priority'],
      },
    },
    jdKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 10 },
    cvKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 10 },
  },
  required: [
    'overallMatch',
    'subScores',
    'atsScore',
    'matchedSkills',
    'missingSkills',
    'suggestions',
    'jdKeywords',
    'cvKeywords',
  ],
};

export const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',

  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema,                        // Enforces perfect structure
    temperature: 0,
    topP: 0.9,
    topK: 1,
    maxOutputTokens: 8192,                 // MAX safe value - should now finish
  },

  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});