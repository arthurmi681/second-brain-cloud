import Groq from 'groq';

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

export const groq = new Groq({
  apiKey: groqApiKey
});

// Modelo de embed do Groq (sentence-transformers)
export const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

// Modelo de chat
export const CHAT_MODEL = 'llama-3.3-70b-versatile';