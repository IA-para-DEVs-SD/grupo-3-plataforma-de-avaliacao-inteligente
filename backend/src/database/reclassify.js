// Script de reclassificação — reanalisa sentimento de avaliações existentes com Ollama
// Uso: node src/database/reclassify.js
// Requer Ollama rodando: ollama pull llama3.2
import 'dotenv/config';
import { getDb, closeDb } from './connection.js';
import { analyzeSentiment } from '../ai-engine/sentiment-analyzer.js';
import { isOllamaAvailable } from '../ai-engine/ollama-client.js';
import {
  recalculateSentimentDistribution,
  recalculateScore,
  regenerateSummary,
  reanalyzePatterns,
} from '../services/insight-service.js';

const db = getDb();

async function main() {
  console.log('🔍 Verificando disponibilidade do Ollama...');
  const ollamaAvailable = await isOllamaAvailable();

  if (!ollamaAvailable) {
    console.warn('⚠️  Ollama não está disponível. Certifique-se de que está rodando e o modelo está baixado.');
    console.warn('   Execute: ollama pull llama3.2');
    console.warn('   Continuando com fallback heurístico...\n');
  } else {
    console.log('✅ Ollama disponível — usando LLM para reclassificação\n');
  }

  // Busca todas as avaliações com sentimento já classificado
  const reviews = db.prepare(
    `SELECT id, product_id AS productId, text, sentiment FROM reviews ORDER BY created_at ASC`
  ).all();

  console.log(`📋 ${reviews.length} avaliações encontradas para reclassificação\n`);

  let changed = 0;
  let unchanged = 0;
  let errors = 0;

  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    process.stdout.write(`[${i + 1}/${reviews.length}] Analisando: "${review.text.slice(0, 50)}..."  `);

    try {
      const newSentiment = await analyzeSentiment(review.text);

      if (newSentiment !== review.sentiment) {
        db.prepare(
          `UPDATE reviews SET sentiment = ?, sentiment_processed_at = datetime('now') WHERE id = ?`
        ).run(newSentiment, review.id);
        console.log(`${review.sentiment} → ${newSentiment} ✏️`);
        changed++;
      } else {
        console.log(`${newSentiment} (sem alteração)`);
        unchanged++;
      }
    } catch (err) {
      console.log(`ERRO: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Alteradas: ${changed}`);
  console.log(`   Sem alteração: ${unchanged}`);
  console.log(`   Erros: ${errors}`);

  // Recalcula insights para todos os produtos afetados
  if (changed > 0) {
    console.log('\n🔄 Recalculando insights dos produtos afetados...');
    const productIds = [...new Set(reviews.map((r) => r.productId))];

    for (const productId of productIds) {
      try {
        await recalculateSentimentDistribution(productId);
        await recalculateScore(productId);
        await regenerateSummary(productId);
        await reanalyzePatterns(productId);
        console.log(`   ✅ Produto ${productId.slice(0, 8)}... atualizado`);
      } catch (err) {
        console.log(`   ❌ Erro ao atualizar produto ${productId.slice(0, 8)}...: ${err.message}`);
      }
    }
  }

  closeDb();
  console.log('\n✅ Reclassificação concluída!');
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  closeDb();
  process.exit(1);
});
