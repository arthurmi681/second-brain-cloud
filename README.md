# 🧠 Second Brain Cloud - Guia de Configuração

## Visão Geral

Arquitetura cloud-native para um Second Brain eficiente:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuário   │────▶│  Vercel    │────▶│  Supabase   │
│             │     │  API API   │     │ (PGVector) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   OpenAI    │
                    │ (_embeddings)│
                    └─────────────┘
```

| step | o que acontece |
|------|----------------|
| 1 | Você envia mensagem |
| 2 | API cria embedding |
| 3 | Busca memórias similares no banco |
| 4 | Envia para IA com contexto |
| 5 | Salva nova memória |

---

## 📋 Checklist de Configuração

### Step 1: Criar Contas (ordem recomendada)

- [ ] **[Supabase](https://supabase.com)** - Cadastre-se gratuitamente
- [ ] **[Vercel](https://vercel.com)** - Cadastre-se com GitHub
- [ ] **[OpenAI](https://platform.openai.com/settings/api-keys)** - Gere uma API key

### Step 2: Configurar Supabase

1. Novo Projeto → Nome: `second-brain`
2. Vá para **SQL Editor**
3. Copie todo o conteúdo de `schema.sql`
4. Execute (Run)
5. Verify em **Table Editor**: tabelas `memories`, `sessions`, `user_config`

### Step 3: Obter chaves

Em **Settings → API**:
- **Project URL**: `https://xxxx.supabase.co`
- **anon key**: `eyJxxxx...`

### Step 4: Criar repo GitHub

```bash
# No seu PC:
git clone seu-repo
cd second-brain-cloud
# Copie os arquivos desta pasta
git add .
git commit -m "Initial: Second Brain Cloud"
git push
```

### Step 5: Deploy Vercel

1. Vercel → Add New → Project
2. Import from GitHub
3. Em **Environment Variables** adicione:
   - `SUPABASE_URL` = sua URL
   - `SUPABASE_ANON_KEY` = sua key
   - `OPENAI_API_KEY` = sua key
4. Deploy!

### Step 6: Testar

```bash
# Teste 1: Saludar
curl -X POST https://SEU-PROJETO.vercel.app/api/memories \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, meu nome é Zaki"}'

# Teste 2: Debe lembrar
curl -X POST https://SEU-PROJETO.vercel.app/api/memories \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual é o meu nome?"}'

# Teste 3: Health check
curl https://SEU-PROJETO.vercel.app/api/health
```

---

## 📁 Estrutura de Arquivos

```
second-brain-cloud/
├── api/
│   ├── health/route.js      # Health check
│   ├── memories/route.js   # MAIN: POST /api/memories
│   └── search/route.js     # Busca sem IA (debug)
├── lib/
│   ├── supabase.js         # Cliente Supabase
│   ├── openai.js           # Cliente OpenAI
│   ├── embeddings.js      # Funções de embedding
│   └── prompts.js         # Prompts do sistema
├── .env.example            # Variáveis exemplo
├── schema.sql             # Schema do banco
├── package.json
└── vercel.json
```

---

## 💰 Custos (Plano Grátis)

| Serviço | Plano Grátis | custo |
|---------|------------|-------|
| Supabase | 500MB | €0 |
| Vercel | 100GB | €0 |
| OpenAI | $5 credits | ~$1-2/mês |
| **Total** | | **~$1/mês** |

---

## 🔧 Troubleshooting

### "Error: Missing SUPABASE_URL"
→ Verifique as environment variables no Vercel

### "Error: relation memories does not exist"
→ Execute o schema.sql no SQL Editor

### "Error: vector extension not found"
→ Execute: `CREATE EXTENSION IF NOT EXISTS vector;`

---

## 📚 Mais Informações

- [Supabase docs](https://supabase.com/docs)
- [Vercel docs](https://vercel.com/docs)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

**Criado**: 2026-05-02
**Versão**: 1.0.0