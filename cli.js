#!/usr/bin/env node
/**
 * OmniMind CLI - Second Brain Cloud
 * 
 * Uso: node cli.js [comando] [opções]
 * 
 * Comandos:
 *   ask <pergunta>        - Pergunta ao Second Brain
 *   remember <texto>    - Salva uma memória
 *   search <query>       - Busca memórias
 *   sessions            - Lista sessões
 *   memories            - Lista todas as memórias
 *   export              - Exporta memórias (JSON)
 *   import <arquivo>   - Importa memórias
 *   config              - Mostra configuração
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const configPath = process.env.HOME + '/.omnimind/config.json';

// =====================================================
// CLIENT
// =====================================================

function getClient() {
  const config = loadConfig();
  
  const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY
  );
  
  return { supabase, config };
}

function loadConfig() {
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config;
  } catch (e) {
    console.error('❌ Configuração não encontrada.');
    console.error('   Execute: node cli.js config');
    process.exit(1);
  }
}

function saveConfig(config) {
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Configuração salva!');
  } catch (e) {
    console.error('❌ Erro salvando config:', e.message);
  }
}

// =====================================================
// COMANDOS
// =====================================================

/**
 * Configurar CLI
 */
async function config(args) {
  if (args.length === 0) {
    // Mostrar config atual
    try {
      const config = loadConfig();
      console.log('\n📋 Configuração atual:\n');
      console.log(`   SUPABASE_URL: ${config.SUPABASE_URL}`);
      console.log(`   SUPABASE_KEY: ${config.SUPABASE_KEY?.substring(0, 20)}...`);
      console.log(`   API_URL:     ${config.API_URL}`);
      console.log('');
    } catch (e) {
      console.log('   Nenhuma configuração encontrada.\n');
    }
    return;
  }
  
  // Configurar
  const newConfig = loadConfig();
  
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (key && value) {
      newConfig[key] = value;
    }
  }
  
  saveConfig(newConfig);
}

/**
 * Ask - Pergunta ao Second Brain
 */
async function ask(args) {
  const { supabase, config } = getClient();
  const message = args.join(' ');
  
  if (!message) {
    console.error('❌ Usage: omnimind ask <pergunta>');
    return;
  }
  
  console.log(`\n👤 Você: ${message}\n`);
  
  try {
    const response = await fetch(`${config.API_URL || config.SUPABASE_URL}/api/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    if (data.response) {
      console.log(`🧠 OmniMind: ${data.response}\n`);
      
      if (data.memories?.length > 0) {
        console.log('   📚 Memórias encontradas:');
        for (const m of data.memories) {
          console.log(`   - ${m.content.substring(0, 80)}...`);
        }
        console.log('');
      }
    } else {
      console.error('❌ Erro:', data.error || 'Unknown error');
    }
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Remember - Salva uma memória
 */
async function remember(args) {
  const { supabase, config } = getClient();
  const content = args.join(' ');
  
  if (!content) {
    console.error('❌ Usage: omnimind remember <texto>');
    return;
  }
  
  console.log(`\n💾 Salvando: ${content.substring(0, 50)}...\n`);
  
  try {
    // Usar API para criar embedding e salvar
    const response = await fetch(`${config.API_URL || config.SUPABASE_URL}/api/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: content,
        saveMemory: true
      })
    });
    
    const data = await response.json();
    
    if (data.response) {
      console.log(`✅ Memória salva!\n`);
    } else {
      console.error('❌ Erro:', data.error);
    }
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Search - Busca memórias
 */
async function search(args) {
  const { supabase, config } = getClient();
  const query = args.join(' ');
  
  if (!query) {
    console.error('❌ Usage: omnimind search <query>');
    return;
  }
  
  try {
    const response = await fetch(
      `${config.API_URL || config.SUPABASE_URL}/api/search?q=${encodeURIComponent(query)}`
    );
    
    const data = await response.json();
    
    console.log(`\n🔍 Resultados para "${query}":\n`);
    
    if (data.memories?.length > 0) {
      for (const m of data.memories) {
        console.log(`   [${m.category}] ${m.content.substring(0, 100)}`);
        console.log(`   Similaridade: ${(m.similarity * 100).toFixed(1)}%`);
        console.log('');
      }
    } else {
      console.log('   Nenhum resultado encontrado.\n');
    }
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Memories - Lista todas as memórias
 */
async function memories(args) {
  const { supabase, config } = getClient();
  
  try {
    const response = await fetch(
      `${config.API_URL || config.SUPABASE_URL}/api/memories`
    );
    
    const data = await response.json();
    
    console.log(`\n📚 Total de memórias: ${data.memories?.length || 0}\n`);
    
    for (const m of data.memories || []) {
      console.log(`   [${m.category}] ${m.content.substring(0, 80)}`);
    }
    
    console.log('');
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Sessions - Lista sessões
 */
async function sessions(args) {
  const { supabase, config } = getClient();
  
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    console.log(`\n📅 Sessões: ${data?.length || 0}\n`);
    
    for (const s of data || []) {
      console.log(`   ${s.id.substring(0, 8)} - ${s.title || 'Sem título'}`);
      console.log(`   ${s.created_at}`);
      console.log('');
    }
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Export - Exporta memórias
 */
async function exportMemories(args) {
  const { supabase, config } = getClient();
  const format = args[0] || 'json';
  const output = args[1] || 'omnimind-export.json';
  
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (format === 'json') {
      writeFileSync(output, JSON.stringify(data, null, 2));
      console.log(`✅ Exportado para ${output} (${data?.length || 0} memórias)`);
    }
    
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Import - Importa memórias
 */
async function importMemories(args) {
  const file = args[0];
  
  if (!file) {
    console.error('❌ Usage: omnimind import <arquivo>');
    return;
  }
  
  try {
    const content = readFileSync(file, 'utf-8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      console.error('❌ Arquivo deve ser um array de memórias');
      return;
    }
    
    console.log(`📥 Importando ${data.length} memórias...`);
    
    const { supabase } = getClient();
    
    let success = 0;
    for (const item of data) {
      const { error } = await supabase.from('memories').insert({
        content: item.content,
        category: item.category || 'imported',
        importance: item.importance || 3,
        source: 'import'
      });
      
      if (!error) success++;
    }
    
    console.log(`✅ Importado ${success} de ${data.length} memórias`);
    
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

/**
 * Health - Verifica se o sistema está online
 */
async function health() {
  const { config } = getClient();
  
  try {
    const response = await fetch(
      `${config.API_URL || config.SUPABASE_URL}/api/health`
    );
    
    const data = await response.json();
    
    console.log('\n📊 Status:\n');
    console.log(`   Servidor: ${data.status === 'ok' ? '✅ ONLINE' : '❌ OFFLINE'}`);
    console.log(`   Banco: ${data.database === 'connected' ? '✅ CONNECTED' : '❌ ERROR'}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    console.log('');
    
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

// =====================================================
// CLI PRINCIPAL
// =====================================================

const commands = {
  config,
  ask,
  remember,
  search,
  memories,
  sessions,
  export: exportMemories,
  import: importMemories,
  health,
  help
};

function main() {
  const command = process.argv[2] || 'help';
  const args = process.argv.slice(3);
  
  if (commands[command]) {
    commands[command](args);
  } else {
    console.log(`
🧠 OmniMind CLI - Second Brain Cloud

Uso: omnimind [comando] [opções]

Comandos:
  ask <pergunta>        Pergunta ao Second Brain
  remember <texto>     Salva uma memória
  search <query>       Busca memórias similares
  memories             Lista todas as memórias
  sessions             Lista sessões
  export [formato]     Exporta memórias
  import <arquivo>     Importa memórias
  health              Verifica status
  config              Mostra/configura
  help                Esta ajuda
`);
    process.exit(1);
  }
}

main();