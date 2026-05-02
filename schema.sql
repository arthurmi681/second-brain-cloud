-- =====================================================
-- SCHEMA SQL: Second Brain Cloud (Supabase + pgvector)
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- 1. Ativar extensão vector (necessária para embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Criar tabela de memórias
CREATE TABLE IF NOT EXISTS memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,                    -- Texto da memória
    embedding vector(1536),             -- Embedding do text-embedding-3-small
    category VARCHAR(100) DEFAULT 'general',  -- Categoria: decision, fact, preference, goal, etc
    source VARCHAR(100) DEFAULT 'api',   -- De onde veio: api, manual, import, etc
    importance INTEGER DEFAULT 3,          -- Importância 1-5 (1=baixa, 5=crítica)
    metadata JSONB,                     -- Metadados extras (opcional)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de sessões (para contexto)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255),
    summary TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar índice para busca vetorial (OBRIGATÓRIO!)
-- Usando HNSW (mais rápido que IVFFlat)
CREATE INDEX IF NOT EXISTS idx_memories_embedding 
ON memories USING hnsw (embedding vector_cosine_ops);

-- 6. Criar índices para buscas comuns
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS (ajuste conforme necessário)
-- Permite acesso total (para desenvolvimento)
CREATE POLICY "Allow all for memories" ON memories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for user_config" ON user_config FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNÇÃO RPC: match_memories
-- =====================================================
-- Busca memórias similares usando similaridade de cosseno
-- =====================================================

CREATE OR REPLACE FUNCTION match_memories(
    query_embedding vector(1536),
    match_count INTEGER DEFAULT 5,
    category_filter VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    category VARCHAR(100),
    importance INTEGER,
    similarity FLOAT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.category,
        m.importance,
        1 - (m.embedding <=> query_embedding) AS similarity,  -- Similaridade de cosseno
        m.created_at
    FROM memories m
    WHERE (category_filter IS NULL OR m.category = category_filter)
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =====================================================
-- FUNÇÃO RPC: insert_memory
-- =====================================================
-- Insere uma nova memória com embedding automático
-- =====================================================

CREATE OR REPLACE FUNCTION insert_memory(
    content TEXT,
    category VARCHAR(100) DEFAULT 'general',
    source VARCHAR(100) DEFAULT 'api',
    importance INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $
DECLARE
    new_id UUID;
BEGIN
    new_id := gen_random_uuid();
    
    INSERT INTO memories (id, content, category, source, importance, metadata)
    VALUES (new_id, content, category, source, importance, metadata);
    
    RETURN new_id;
END;
$;

-- =====================================================
-- FUNÇÃO: categorize_auto
-- =====================================================
-- Detecta automaticamente a categoria da memória
-- =====================================================

CREATE OR REPLACE FUNCTION categorize_auto(content TEXT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    lower_content TEXT;
BEGIN
    lower_content := LOWER(content);
    
    -- Detectar categoria por palavras-chave
    IF lower_content LIKE '%decisão%' OR lower_content LIKE '%decidi%' OR lower_content LIKE '%vou fazer%' THEN
        RETURN 'decision';
    ELSIF lower_content LIKE '%gostar%' OR lower_content LIKE '%prefiro%' OR lower_content LIKE '%amo%' THEN
        RETURN 'preference';
    ELSIF lower_content LIKE '%meta%' OR lower_content LIKE '%objetivo%' OR lower_content LIKE '%vou conseguir%' THEN
        RETURN 'goal';
    ELSIF lower_content LIKE '%projeto%' OR lower_content LIKE '%trabalho%' OR lower_content LIKE '%código%' THEN
        RETURN 'project';
    ELSIF lower_content LIKE '%nome%' OR lower_content LIKE '%sou%' OR lower_content LIKE '%nasci%' THEN
        RETURN 'fact';
    ELSE
        RETURN 'general';
    END IF;
END;
$$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'memories table' as entity,
    (SELECT count(*) FROM information_schema.tables WHERE table_name = 'memories') as exists
UNION ALL
SELECT 
    'sessions table',
    (SELECT count(*) FROM information_schema.tables WHERE table_name = 'sessions')
UNION ALL
SELECT 
    'vector extension',
    (SELECT count(*) FROM pg_extension WHERE extname = 'vector')
UNION ALL
SELECT 
    'match_memories function',
    (SELECT count(*) FROM pg_proc WHERE proname = 'match_memories');