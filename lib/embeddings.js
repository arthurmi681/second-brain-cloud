/**
 * Funções para criar embeddings e buscar memórias similares
 * Usa o modelo text-embedding-3-small (1536 dimensões)
 */
import { openai } from './openai';
import { supabase } from './supabase';

/**
 * Cria um embedding para um texto usando OpenAI
 * @param {string} text - Texto para criar embedding
 * @returns {Promise<number[]>} Array de números (1536 dimensões)
 */
export async function createEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  
  return response.data[0].embedding;
}

/**
 * Busca memórias similares usando busca vetorial
 * @param {string} query - Query do usuário
 * @param {number} topK - Número de resultados (padrão: 5)
 * @returns {Promise<Array>} Array de memórias encontradas
 */
export async function searchMemories(query, topK = 5) {
  // Criar embedding da query
  const queryEmbedding = await createEmbedding(query);
  
  // Buscar usando RPC
  const { data, error } = await supabase.rpc('match_memories', {
    query_embedding: queryEmbedding,
    match_count: topK
  });
  
  if (error) {
    console.error('Error searching memories:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Salva uma nova memória no banco
 * @param {string} content - Texto da memória
 * @param {string} category - Categoria (decision, fact, preference, etc)
 * @param {number} importance - Importância 1-5
 * @returns {Promise<Object>} Memória criada
 */
export async function saveMemory(content, category = 'general', importance = 3) {
  const embedding = await createEmbedding(content);
  
  const { data, error } = await supabase
    .from('memories')
    .insert({
      content,
      embedding,
      category,
      source: 'api',
      importance
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
  
  return data;
}

/**
 * Salva memória apenas se for importante (mais de 20 caracteres)
 * @param {string} content - Texto da memória
 * @returns {Promise<Object|null>} Memória salva ou null
 */
export async function saveMemoryIfImportant(content) {
  if (!content || content.length < 20) {
    return null;
  }
  
  return saveMemory(content, 'chat', 3);
}