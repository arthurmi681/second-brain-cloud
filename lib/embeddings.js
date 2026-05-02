import { groq } from './groq.js';

export async function getEmbedding(text) {
  // HuggingFace Inference API (gratuita)
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  
  if (!hfToken) {
    throw new Error('Missing HUGGINGFACE_TOKEN');
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ inputs: text })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get embedding');
  }

  const embedding = await response.json();
  return embedding;
}

export async function getChatCompletion(messages, model = 'llama-3.3-70b-versatile') {
  const completion = await groq.chat.completions.create({
    messages,
    model,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}