-- =====================================================
-- PARTE 2: Funções RPC
-- =====================================================

-- 1. match_memories - Busca similaridade de cosseno
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
        1 - (m.embedding <=> query_embedding) AS similarity,
        m.created_at
    FROM memories m
    WHERE (category_filter IS NULL OR m.category = category_filter)
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 2. insert_memory - Insere memória
CREATE OR REPLACE FUNCTION insert_memory(
    p_content TEXT,
    p_category VARCHAR(100) DEFAULT 'general',
    p_source VARCHAR(100) DEFAULT 'api',
    p_importance INTEGER DEFAULT 3,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_id UUID;
BEGIN
    v_id := gen_random_uuid();
    
    INSERT INTO memories (id, content, category, source, importance, metadata)
    VALUES (v_id, p_content, p_category, p_source, p_importance, p_metadata);
    
    RETURN v_id;
END;
$$;

-- 3. categorize_auto - Detecta categoria
CREATE OR REPLACE FUNCTION categorize_auto(p_content TEXT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_lower TEXT;
BEGIN
    v_lower := LOWER(p_content);
    
    IF v_lower LIKE '%decisão%' OR v_lower LIKE '%decidi%' THEN
        RETURN 'decision';
    ELSIF v_lower LIKE '%gostar%' OR v_lower LIKE '%prefiro%' OR v_lower LIKE '%amo%' THEN
        RETURN 'preference';
    ELSIF v_lower LIKE '%meta%' OR v_lower LIKE '%objetivo%' THEN
        RETURN 'goal';
    ELSIF v_lower LIKE '%projeto%' OR v_lower LIKE '%trabalho%' THEN
        RETURN 'project';
    ELSIF v_lower LIKE '%nome%' OR v_lower LIKE '%sou%' THEN
        RETURN 'fact';
    ELSE
        RETURN 'general';
    END IF;
END;
$$;