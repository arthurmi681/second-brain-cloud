#!/usr/bin/env node
/**
 * OmniMind Migration CLI
 * Migra os arquivos do OmniMind local para o Second Brain Cloud
 * 
 * Uso: node migrate.js [comando] [opções]
 * 
 * Comandos:
 *   migrate [pasta]    - Migra todos os arquivos de uma pasta
 *   status             - Mostra status da migração
 *   import [arquivo]  - Importa um arquivo específico
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { createClient } from '@supabase/supabase-js';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xxxx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJxxxx...';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-xxxx...';

// =====================================================
// CLIENTS
// =====================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// FUNÇÕES
// =====================================================

/**
 * Lista todos os arquivos em uma pasta (recursivamente)
 */
function listFiles(dir, extensions = ['.md', '.claim', '.txt']) {
  const files = [];
  
  function walk(currentDir) {
    const items = readdirSync(currentDir);
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorar pastas starts com _
        if (!item.startsWith('_')) {
          walk(fullPath);
        }
      } else if (extensions.includes(extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Lê arquivo e retorna conteúdo
 */
function readFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch (e) {
    console.error(`Erro lendo ${path}:`, e.message);
    return null;
  }
}

/**
 * Detecta categoria pelo caminho
 */
function detectCategory(filePath) {
  const path = filePath.toLowerCase();
  
  if (path.includes('decision')) return 'decision';
  if (path.includes('knowledge')) return 'knowledge';
  if (path.includes('learning')) return 'learning';
  if (path.includes('skill')) return 'skill';
  if (path.includes('system')) return 'system';
  if (path.includes('memory')) return 'memory';
  if (path.includes('daily')) return 'daily';
  if (path.includes('project')) return 'project';
  if (path.includes('config')) return 'config';
  
  return 'general';
}

/**
 * Cria embedding para um texto (via API local simulada)
 * Na verdade, vamos usar a API do Supabase ou OpenAI
 */
async function createEmbedding(text) {
  // Esta função será chamada pela API quando estiver deployada
  // Por agora, vamos só retornar o texto normal
  // O embedding será criado automaticamente pela API
  return text;
}

/**
 * Migra um único arquivo
 */
async function migrateFile(filePath, dryRun = false) {
  const content = readFile(filePath);
  if (!content) return null;
  
  const category = detectCategory(filePath);
  const fileName = basename(filePath);
  
  console.log(`  📄 ${fileName} [${category}]`);
  
  if (dryRun) {
    return { content, category, source: fileName };
  }
  
  // Enviar para API
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/insert_memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        content,
        category,
        source: fileName,
        importance: 3
      })
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error(`  ❌ Erro: ${response.status}`);
      return null;
    }
  } catch (e) {
    console.error(`  ❌ Erro: ${e.message}`);
    return null;
  }
}

/**
 * Migra todos os arquivos de uma pasta
 */
async function migrateFolder(folderPath, options = {}) {
  const { dryRun = false, category = null } = options;
  
  console.log(`\n🔄 Migrando de: ${folderPath}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'REAL'}\n`);
  
  const files = listFiles(folderPath);
  console.log(`   Encontrados: ${files.length} arquivos\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const file of files) {
    const result = await migrateFile(file, dryRun);
    if (result) success++;
    else failed++;
  }
  
  console.log(`\n✅ Resultado: ${success} sucesso, ${failed} failed`);
  
  return { success, failed, total: files.length };
}

/**
 * Status da migração
 */
async function status() {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('category', { count: 'exact', head: true });
    
    console.log('\n📊 Status da Migração:');
    console.log('   Total de memórias: ??? (count não suportado)');
    
    // Listar por categoria
    const { data: categories } = await supabase
      .from('memories')
      .select('category, count');
    
    console.log('\n   Por categoria:');
    if (categories) {
      const counts = {};
      for (const c of categories) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
      for (const [cat, count] of Object.entries(counts)) {
        console.log(`     - ${cat}: ${count}`);
      }
    }
    
  } catch (e) {
    console.error('Erro:', e.message);
  }
}

// =====================================================
// CLI
// =====================================================

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'migrate': {
      const folder = args[1] || './omnimind';
      const dryRun = args.includes('--dry-run');
      await migrateFolder(folder, { dryRun });
      break;
    }
    
    case 'status': {
      await status();
      break;
    }
    
    case 'import': {
      const file = args[1];
      if (!file) {
        console.error('Uso: migrate.js import [arquivo]');
        process.exit(1);
      }
      await migrateFile(file);
      break;
    }
    
    case 'help':
    default: {
      console.log(`
🧠 OmniMind Migration CLI

Uso: node migrate.js [comando] [opções]

Comandos:
  migrate [pasta]    Migra todos os arquivos de uma pasta
  status             Mostra status da migração
  import [arquivo]   Importa um arquivo específico
  help               Mostra esta ajuda

Opções:
  --dry-run         Simula sem enviar para o banco

Exemplos:
  node migrate.js migrate ./omnimind          # Migra pasta inteira
  node migrate.js migrate ./omnimind --dry-run  # Simula
  node migrate.js status                     # Ver status
      `);
    }
  }
}

main().catch(console.error);