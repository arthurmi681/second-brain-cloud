-- =====================================================
-- PARTE 1: Tabelas e Extensões (Executar primeiro)
-- =====================================================

-- 1. Ativar extensão vector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabela de memórias
CREATE TABLE IF NOT EXISTS memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536),
    category VARCHAR(100) DEFAULT 'general',
    source VARCHAR(100) DEFAULT 'api',
    importance INTEGER DEFAULT 3,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255),
    summary TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de config
CREATE TABLE IF NOT EXISTS user_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices
-- Para pgvector, usamos HNSW (mais novo e rápido) ou IVFFlat
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);

-- 6. RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for memories" ON memories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for user_config" ON user_config FOR ALL USING (true) WITH CHECK (true);