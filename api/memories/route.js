/**
 * API Route: POST /api/memories
 * 
 * Fluxo:
 * 1. Recebe mensagem do usuário
 * 2. Salva no Supabase
 * 3. Retorna as memórias salvas
 * 
 * A conversa com IA acontece na CLI (Blackbox)
 */
import { saveMemory } from '../../lib/embeddings';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { message, category = 'general' } = await request.json();
    
    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Salvar memória no Supabase
    const saved = await saveMemory(message, category);
    
    return Response.json({
      success: true,
      id: saved.id,
      message: 'Memória salva!'
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
 * GET: Retorna todas as memórias
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