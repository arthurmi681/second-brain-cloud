import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Criar cliente Supabase
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const runtime = 'edge';

export async function GET() {
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('memories')
    .select('id, content, category, importance, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ memories: data || [] });
}

export async function POST(request) {
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { message, category = 'general' } = await request.json();
    
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({ content: message, category, source: 'api', importance: 3 })
      .select()
      .single();

    if (error) throw error;

    return Response.json({
      success: true,
      id: data.id,
      message: 'Memória salva!'
    });
    
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}