# 🧠 Second Brain Cloud - Setup Simplificado

##一步一步

### Passo 1: Criar Conta Supabase

1. Acesse: https://supabase.com
2. Crie conta gratuita
3. New Project → `second-brain`
4. Senha DB: anote em algum lugar seguro
5. Region: US East (mais rápido)

**Anote estas informações da aba Settings → API:**
- `Project URL`: https://xxxx.supabase.co
- `anon key`: eyJxxxx...

---

### Passo 2: Criar Banco

1. No Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo de `schema.sql`
3. Clique **Run**
4. Verifique em **Table Editor** se criou:
   - `memories` ✓
   - `sessions` ✓
   - `user_config` ✓

---

### Passo 3: Deployment Vercel

1. Crie um repo no GitHub: `second-brain-cloud`
2. Clone no seu PC
3. Copie todos os arquivos desta pasta
4. git add . && git commit && git push

5. Acesse: https://vercel.com
6. Add New → Project
7. Import from GitHub
8. Em **Environment Variables** adicione:
   | Variável | Valor |
   |---------|-------|
   | SUPABASE_URL | https://xxxx.supabase.co |
   | SUPABASE_ANON_KEY | eyJxxxx... |
   | OPENAI_API_KEY | sk-xxxx... |

9. Deploy!

**Anote a URL gerada**: `https://second-brain-xxxx.vercel.app`

---

### Passo 4: Configurar CLI

```bash
# No seu PC:
mkdir -p ~/.omnimind
cd ~/.omnimind

# Criar config.json:
cat > config.json << EOF
{
  "SUPABASE_URL": "https://xxxx.supabase.co",
  "SUPABASE_KEY": "eyJxxxx...",
  "API_URL": "https://second-brain-xxxx.vercel.app"
}
EOF

# Tornar CLI executável:
chmod +x /caminho/para/cli.js
```

---

### Passo 5: Testar

```bash
# Health check
curl https://second-brain-xxxx.vercel.app/api/health

# Primeira pergunta
curl -X POST https://second-brain-xxxx.vercel.app/api/memories \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, meu nome é Zaki"}'
```

---

## 🖥️ Comandos CLI

```bash
# Fazer pergunta
node cli.js ask Qual é o meu nome?

# Salvar memória
node cli.js remember Eu gosto de pizza de calabresa

# Buscar
node cli.js search python

# Ver status
node cli.js health

# Listar memórias
node cli.js memories

# Exportar
node cli.js export json backup.json
```

---

## 📂 Estrutura Final

```
second-brain-cloud/
├── api/
│   ├── health/route.js
│   ├── memories/route.js   ← PRINCIPAL
│   └── search/route.js
├── lib/
│   ├── supabase.js
│   ├── openai.js
│   ├── embeddings.js
│   └── prompts.js
├── scripts/
│   └── migrate.js
├── cli.js                 ← CLI
├── schema.sql            ← RODAR NO SUPABASE
├── README.md
└── .env.example
```

---

## 💰 Custo

| Serviço | Grátis | Após |
|---------|-------|------|
| Supabase | 500MB | €0-25/mês |
| Vercel | 100GB | €0-20/mês |
| OpenAI | $5 créditos | ~R$10/mês |

**Média com uso normal: ~R$10-20/mês**

---

## 🔧 Troubleshooting

| Erro | Solução |
|------|--------|
| `SUPABASE_URL missing` | Adicionar env vars no Vercel |
| `relation does not exist` | Executar schema.sql |
| `vector extension` | Executar schema.sql novamente |

---

**Pronto!** Qualquer dúvida, é só perguntar. 🚀