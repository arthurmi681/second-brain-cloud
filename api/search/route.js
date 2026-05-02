/**
 * API Route: GET /api/search
 * 
 * Busca memórias sem enviar para IA
 * Útil para debug ou para listar memórias por categoria
 */
import { searchMemories } from '../../lib/embeddings';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query) {
      return Response.json({ memories: [] });
    }
    
    const memories = await searchMemories(query, limit);
    
    // Filtrar por categoria se especificado
    const filtered = category 
      ? memories.filter(m => m.category === category)
      : memories;
    
    return Response.json({
      memories: filtered.map(m => ({
        id: m.id,
        content: m.content,
        category: m.category,
        importance: m.importance,
        similarity: m.similarity,
        created_at: m.created_at
      }))
    });
    
  } catch (error) {
    console.error('Error in GET /api/search:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}