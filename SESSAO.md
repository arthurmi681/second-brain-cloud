# 🔄 PRÓXIMA SESSÃO — FLUXO COMPLETO

## 📋 O QUE ACONTECE AO INICIAR

### 1. CLONE DO GITHUB
```bash
git clone https://github.com/arthurmi681/second-brain-cloud.git /mnt/hdd/zaki
```

### 2. CARREGA MEMÓRIAS DO CLOUD
```bash
curl https://second-brain-cloud.vercel.app/api/memories
```
→ Tudo que foi salvo na sessão anterior está aqui!

### 3. VERIFICA SUPABASE
→ Conexão automática via variáveis de ambiente

---

## 🎯 NA SESSÃO

- Trabalha em `/mnt/hdd/zaki/`
- Tudo importante → salva no Supabase (cloud)
- Código → push para GitHub

---

## 🔚 FINAL DA SESSÃO

```bash
# 1. Push código
cd /mnt/hdd/zaki/second-brain-cloud
git add . && git commit -m "Descrição" && git push

# 2. Limpar local (opcional)
rm -rf /mnt/hdd/zaki/*
```

---

## ⚡ RESUMO

| Passo | Ação |
|-------|------|
| Início | `git clone` |
| Durante | Trabalhar + salvar no cloud |
| Fim | `git push` + limpar |

---

## 🎓 LEMBRETE

> **Cloud = BASE**
> **Local = temporário**

Cada sessão começa do zero (clone) e termina com push.
Nenhuma perda de dados — tudo está no cloud!