/**
 * API Route: POST /api/memories
 * 
 * Fluxo:
 * 1. Recebe mensagem do usuário
 * 2. Cria embedding da mensagem
 * 3. Busca memórias similares no banco
 * 4. Envia para OpenAI com contexto
 * 5. Salva nova memória se importante
 */
import { searchMemories, saveMemoryIfImportant } from '../../lib/embeddings';
import { openai } from '../../lib/openai';
import { MEMORY_SYSTEM_PROMPT } from '../../lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { message, sessionId, saveMemory = true } = await request.json();
    
    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // 1. Buscar memórias similares
    const memories = await searchMemories(message, 5);
    
    // 2. Preparar prompt com contexto
    const systemPrompt = MEMORY_SYSTEM_PROMPT(memories);
    
    // 3. Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const response = completion.choices[0].message.content;
    
    // 4. Salvar nova memória (se.enabled e for importante)
    if (saveMemory && message.length > 20) {
      await saveMemoryIfImportant(message);
    }
    
    return Response.json({
      response,
      memories: memories.map(m => ({
        id: m.id,
        content: m.content,
        category: m.category,
        similarity: m.similarity
      }))
    });
    
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Retorna todas as memórias (para debug)
 */
export async function GET() {
  try {
    const { supabase } = await import('../../lib/supabase');
    
    const { data, error } = await supabase
      .from('memories')
      .select('id, content, category, importance, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    return Response.json({ memories: data || [] });
    
  } catch (error) {
    console.error('Error in GET /api/memories:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}