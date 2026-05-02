/**
 * API Route: POST /api/health
 * 
 * Health check para verificar se o banco e API estão funcionando
 */
import { supabase } from '../../lib/supabase';

export async function GET() {
  try {
    // Testar conexão com banco
    const { data, error } = await supabase
      .from('memories')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    const dbStatus = error ? 'error' : 'connected';
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      error: error?.message
    });
    
  } catch (error) {
    return Response.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}