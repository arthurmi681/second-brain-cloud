import { supabase } from './supabase.js';

/**
 * Salva uma memória no Supabase
 */
export async function saveMemory(content, category = 'general', source = 'api') {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      content,
      category,
      source,
      importance: 3
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Busca todas as memórias
 */
export async function getMemories(limit = 20) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}