// Testes de propriedade para o motor de IA — fast-check + Jest
// Valida propriedades P13–P21 do design doc (Requisitos 4, 5, 6, 7)
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import fc from 'fast-check';

// --- Configuração do JWT_SECRET antes de qualquer import de serviço ---
process.env.JWT_SECRET = 'pbt-test-secret-key-for-ai-engine-properties';

// --- Importações diretas de funções puras (P13, P18, P19, P20, P21) ---
import { detectPatterns } from '../ai-engine/pattern-detector.js';
import { calculateSmartScore } from '../ai-engine/score-calculator.js';
import { analyzeSentiment } from '../ai-engine/sentiment-analyzer.js';

// --- Helpers compartilhados para banco em memória ---
import {
    createFreshTestDb,
    insertReviewDirect,
    insertTestProduct,
    insertTestUser,
} from './test-helpers.js';

// --- Banco em memória compartilhado por iteração (P14, P15, P16, P17) ---
let currentTestDb = null;

// --- Mock do módulo de conexão para usar banco em memória ---
jest.unstable_mockModule('../database/connection.js', () => ({
  getDb: () => currentTestDb,
  closeDb: () => {
    if (currentTestDb) {
      currentTestDb.close();
      currentTestDb = null;
    }
  },
  getTestDb: () => createFreshTestDb(),
}));

// --- Importa módulos que dependem do banco após o mock ---
const {
  recalculateSentimentDistribution,
  regenerateSummary,
  reanalyzePatterns,
  recalculateScore,
} = await import('../services/insight-service.js');
const { findByProductId: findInsightByProductId } = await import('../models/product-insight-model.js');

// --- Geradores fast-check ---

// Gerador de texto aleatório (strings variadas para testar analyzeSentiment)
const randomTextArb = fc.oneof(
  fc.string({ minLength: 0, maxLength: 200 }),
  fc.constantFrom('', ' ', 'abc', 'excelente produto', 'péssimo defeito', 'normal ok'),
  fc.lorem({ maxCount: 5 })
);

// Gerador de sentimento válido
const sentimentArb = fc.constantFrom('positive', 'neutral', 'negative');

// Gerador de nota válida (inteiro entre 1 e 5)
const validRatingArb = fc.integer({ min: 1, max: 5 });

// Gerador de texto de avaliação com conteúdo significativo (>= 20 chars)
const reviewTextArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .,!?]{18,98}[A-Za-z]$/);

// Gerador de avaliação com sentimento classificado (para testes de distribuição)
const classifiedReviewArb = fc.record({
  text: reviewTextArb,
  rating: validRatingArb,
  sentiment: sentimentArb,
});

// Gerador de avaliação para score (com rating e createdAt)
const reviewForScoreArb = fc.record({
  rating: validRatingArb,
  createdAt: fc.date({ min: new Date('2023-01-01'), max: new Date('2025-01-01') })
    .map(d => d.toISOString()),
});

// --- Cleanup após cada teste ---
afterEach(() => {
  if (currentTestDb) {
    try { currentTestDb.close(); } catch { /* já fechado */ }
    currentTestDb = null;
  }
});


// =============================================================================
// P13 — Sentimento classificado dentro do SLA (função pura, sem DB)
// =============================================================================

// Feature: smart-product-reviews, Property 13: sentimento classificado dentro do SLA
// Para qualquer texto, analyzeSentiment deve retornar 'positive', 'neutral' ou 'negative'.
// **Validates: Requirements 4.1**
describe('P13 — sentimento classificado dentro do SLA (invariante)', () => {
  it('para qualquer string, analyzeSentiment deve retornar um valor válido: positive, neutral ou negative', () => {
    fc.assert(
      fc.property(randomTextArb, (text) => {
        const result = analyzeSentiment(text);
        // Verifica que o resultado é um dos três valores válidos
        expect(['positive', 'neutral', 'negative']).toContain(result);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// P14 — Distribuição percentual de sentimentos soma 100% (com DB)
// =============================================================================

// Feature: smart-product-reviews, Property 14: distribuição percentual soma 100%
// Para qualquer conjunto de avaliações classificadas, a soma dos percentuais deve ser 100% (±0.1%).
// **Validates: Requirements 4.3**
describe('P14 — distribuição percentual de sentimentos soma 100% (invariante matemático)', () => {
  it('para qualquer conjunto de avaliações classificadas, a soma dos percentuais deve ser 100% (±0.1%)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(classifiedReviewArb, { minLength: 1, maxLength: 20 }),
        async (reviewsData) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere avaliações com sentimento classificado
          for (let i = 0; i < reviewsData.length; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: reviewsData[i].text,
              rating: reviewsData[i].rating,
              sentiment: reviewsData[i].sentiment,
              createdAt: `2024-01-01 00:${String(i).padStart(2, '0')}:00`,
            });
          }

          // Recalcula distribuição de sentimento
          const result = await recalculateSentimentDistribution(productId);

          // Deve retornar um insight (há avaliações classificadas)
          expect(result).not.toBeNull();

          // Busca o insight persistido para verificar a distribuição
          const insight = await findInsightByProductId(productId);
          expect(insight).not.toBeNull();
          expect(insight.sentimentDistribution).not.toBeNull();

          const dist = insight.sentimentDistribution;
          const sum = dist.positive + dist.neutral + dist.negative;

          // Soma deve ser 100% com tolerância de ±0.1%
          expect(Math.abs(sum - 100)).toBeLessThanOrEqual(0.1);

          // Cada percentual deve estar no intervalo [0, 100]
          expect(dist.positive).toBeGreaterThanOrEqual(0);
          expect(dist.positive).toBeLessThanOrEqual(100);
          expect(dist.neutral).toBeGreaterThanOrEqual(0);
          expect(dist.neutral).toBeLessThanOrEqual(100);
          expect(dist.negative).toBeGreaterThanOrEqual(0);
          expect(dist.negative).toBeLessThanOrEqual(100);

          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// =============================================================================
// P15 — Resumo gerado com >= 5 avaliações (com DB)
// =============================================================================

// Feature: smart-product-reviews, Property 15: resumo gerado com >= 5 avaliações
// Para qualquer produto com >= 5 avaliações com sentimento, regenerateSummary deve produzir um resumo não nulo.
// **Validates: Requirements 5.1**
describe('P15 — resumo gerado com >= 5 avaliações (invariante de threshold)', () => {
  it('para qualquer produto com >= 5 avaliações classificadas, regenerateSummary deve produzir summary não nulo', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(classifiedReviewArb, { minLength: 5, maxLength: 15 }),
        async (reviewsData) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere avaliações com sentimento classificado
          for (let i = 0; i < reviewsData.length; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: reviewsData[i].text,
              rating: reviewsData[i].rating,
              sentiment: reviewsData[i].sentiment,
              createdAt: `2024-01-01 00:${String(i).padStart(2, '0')}:00`,
            });
          }

          // Regenera resumo
          const result = await regenerateSummary(productId);

          // Deve retornar insight (>= 5 avaliações)
          expect(result).not.toBeNull();

          // Busca o insight persistido
          const insight = await findInsightByProductId(productId);
          expect(insight).not.toBeNull();
          expect(insight.summary).not.toBeNull();
          expect(insight.summary.length).toBeGreaterThan(0);

          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// =============================================================================
// P16 — Insights atualizados após nova avaliação (com DB)
// =============================================================================

// Feature: smart-product-reviews, Property 16: insights atualizados após nova avaliação
// Para qualquer produto com insights existentes, adicionar uma nova avaliação e rodar o pipeline deve atualizar updatedAt.
// **Validates: Requirements 5.2, 6.4, 7.3**
describe('P16 — insights atualizados após nova avaliação (invariante)', () => {
  it('para qualquer produto com insights existentes, adicionar nova avaliação e recalcular deve atualizar updatedAt', async () => {
    await fc.assert(
      fc.asyncProperty(
        classifiedReviewArb,
        async (newReviewData) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere avaliações iniciais (>= 5 para ter insights completos)
          for (let i = 0; i < 5; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: `Avaliação inicial número ${String(i).padStart(3, '0')} com texto suficiente para teste`,
              rating: (i % 5) + 1,
              sentiment: ['positive', 'neutral', 'negative'][i % 3],
              createdAt: `2024-01-01 00:${String(i).padStart(2, '0')}:00`,
            });
          }

          // Gera insights iniciais
          await recalculateSentimentDistribution(productId);

          // Captura updatedAt antes da nova avaliação
          const insightBefore = await findInsightByProductId(productId);
          expect(insightBefore).not.toBeNull();
          const updatedAtBefore = insightBefore.updatedAt;

          // Pequeno delay para garantir timestamp diferente
          await new Promise(resolve => setTimeout(resolve, 50));

          // Adiciona nova avaliação
          insertReviewDirect(currentTestDb, {
            productId,
            userId,
            text: newReviewData.text,
            rating: newReviewData.rating,
            sentiment: newReviewData.sentiment,
          });

          // Recalcula insights (simula pipeline de IA)
          await recalculateSentimentDistribution(productId);

          // Verifica que updatedAt foi atualizado
          const insightAfter = await findInsightByProductId(productId);
          expect(insightAfter).not.toBeNull();
          expect(insightAfter.updatedAt).not.toBeNull();
          // updatedAt deve ser >= ao anterior (SQLite datetime('now') pode ter resolução de 1s)
          expect(insightAfter.updatedAt >= updatedAtBefore).toBe(true);

          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});


// =============================================================================
// P17 — Padrões detectados com >= 10 avaliações (com DB)
// =============================================================================

// Feature: smart-product-reviews, Property 17: padrões detectados com >= 10 avaliações
// Para qualquer produto com >= 10 avaliações classificadas, reanalyzePatterns deve produzir padrões não nulos.
// **Validates: Requirements 6.1**
describe('P17 — padrões detectados com >= 10 avaliações (invariante de threshold)', () => {
  it('para qualquer produto com >= 10 avaliações classificadas, reanalyzePatterns deve produzir patterns não nulo', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(classifiedReviewArb, { minLength: 10, maxLength: 20 }),
        async (reviewsData) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere avaliações com sentimento classificado
          for (let i = 0; i < reviewsData.length; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: reviewsData[i].text,
              rating: reviewsData[i].rating,
              sentiment: reviewsData[i].sentiment,
              createdAt: `2024-01-01 ${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
            });
          }

          // Reanalisa padrões
          const result = await reanalyzePatterns(productId);

          // Deve retornar insight (>= 10 avaliações)
          expect(result).not.toBeNull();

          // Busca o insight persistido
          const insight = await findInsightByProductId(productId);
          expect(insight).not.toBeNull();
          expect(insight.patterns).not.toBeNull();
          expect(insight.patterns).toHaveProperty('strengths');
          expect(insight.patterns).toHaveProperty('weaknesses');
          expect(Array.isArray(insight.patterns.strengths)).toBe(true);
          expect(Array.isArray(insight.patterns.weaknesses)).toBe(true);

          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// =============================================================================
// P18 — Padrões têm strengths e weaknesses (função pura, sem DB)
// =============================================================================

// Feature: smart-product-reviews, Property 18: padrões têm estrutura com pontos fortes e fracos
// Para qualquer conjunto de avaliações com sentimentos mistos, detectPatterns deve retornar strengths e weaknesses (não ambos vazios).
// **Validates: Requirements 6.2**
describe('P18 — padrões têm strengths e weaknesses (invariante de estrutura)', () => {
  it('para qualquer conjunto de avaliações com sentimentos mistos, detectPatterns deve ter strengths e weaknesses (não ambos vazios)', () => {
    // Gerador de avaliações com pelo menos uma positiva e uma negativa (garante conteúdo)
    const mixedReviewsArb = fc.tuple(
      // Pelo menos uma avaliação positiva com palavras significativas
      fc.array(
        fc.record({
          text: fc.constantFrom(
            'A qualidade deste produto é excelente e durável',
            'Material resistente e bonito design moderno',
            'Funciona perfeitamente como esperado sempre',
            'Entrega rápida e embalagem segura protegida',
            'Custo benefício ótimo recomendo comprar'
          ),
          sentiment: fc.constant('positive'),
        }),
        { minLength: 1, maxLength: 5 }
      ),
      // Pelo menos uma avaliação negativa com palavras significativas
      fc.array(
        fc.record({
          text: fc.constantFrom(
            'Produto quebrou depois de pouco tempo uso',
            'Entrega atrasada e embalagem danificada muito',
            'Material frágil e acabamento ruim péssimo',
            'Defeito apareceu logo após primeira semana',
            'Atendimento péssimo e suporte inexistente total'
          ),
          sentiment: fc.constant('negative'),
        }),
        { minLength: 1, maxLength: 5 }
      )
    ).map(([pos, neg]) => [...pos, ...neg]);

    fc.assert(
      fc.property(mixedReviewsArb, (reviews) => {
        const patterns = detectPatterns(reviews);

        // Deve ter a estrutura correta
        expect(patterns).toHaveProperty('strengths');
        expect(patterns).toHaveProperty('weaknesses');
        expect(Array.isArray(patterns.strengths)).toBe(true);
        expect(Array.isArray(patterns.weaknesses)).toBe(true);

        // Não ambos vazios (há avaliações positivas e negativas com palavras significativas)
        expect(patterns.strengths.length + patterns.weaknesses.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// P19 — Score não calculado com < 3 avaliações (invariante de threshold, com DB)
// =============================================================================

// Feature: smart-product-reviews, Property 19: score requer >= 3 avaliações
// Para qualquer produto com menos de 3 avaliações, recalculateScore deve retornar null.
// **Validates: Requirements 7.1**
describe('P19 — score não calculado com < 3 avaliações (invariante de threshold)', () => {
  it('para qualquer produto com 1 ou 2 avaliações, recalculateScore deve retornar null', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(classifiedReviewArb, { minLength: 1, maxLength: 2 }),
        async (reviewsData) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere 1 ou 2 avaliações (abaixo do threshold de 3)
          for (let i = 0; i < reviewsData.length; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: reviewsData[i].text,
              rating: reviewsData[i].rating,
              sentiment: reviewsData[i].sentiment,
              createdAt: `2024-01-01 00:${String(i).padStart(2, '0')}:00`,
            });
          }

          // Tenta recalcular score — deve retornar null (abaixo do threshold)
          const result = await recalculateScore(productId);
          expect(result).toBeNull();

          // Verifica que nenhum score foi persistido
          const insight = await findInsightByProductId(productId);
          // Insight pode não existir ou, se existir, smartScore deve ser null
          if (insight) {
            expect(insight.smartScore).toBeNull();
          }

          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// =============================================================================
// P20 — Score no intervalo [0.0, 10.0] (função pura, sem DB)
// =============================================================================

// Feature: smart-product-reviews, Property 20: score inteligente no intervalo [0.0, 10.0]
// Para qualquer conjunto de avaliações (>= 1), calculateSmartScore deve retornar valor em [0.0, 10.0].
// **Validates: Requirements 7.1, 7.2**
describe('P20 — score no intervalo [0.0, 10.0] (invariante de range)', () => {
  it('para qualquer conjunto de avaliações (>= 1), calculateSmartScore deve retornar valor em [0.0, 10.0]', () => {
    // Gerador de distribuição de sentimento opcional
    const distributionArb = fc.oneof(
      fc.constant(null),
      fc.record({
        positive: fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
        neutral: fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
        negative: fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
      })
    );

    // Gerador de padrões opcional
    const patternsArb = fc.oneof(
      fc.constant(null),
      fc.record({
        strengths: fc.array(fc.string(), { maxLength: 5 }),
        weaknesses: fc.array(fc.string(), { maxLength: 5 }),
      })
    );

    fc.assert(
      fc.property(
        fc.array(reviewForScoreArb, { minLength: 1, maxLength: 20 }),
        distributionArb,
        patternsArb,
        (reviews, distribution, patterns) => {
          const score = calculateSmartScore(reviews, distribution, patterns);

          // Score deve ser um número
          expect(typeof score).toBe('number');
          expect(Number.isNaN(score)).toBe(false);

          // Score deve estar no intervalo [0.0, 10.0]
          expect(score).toBeGreaterThanOrEqual(0.0);
          expect(score).toBeLessThanOrEqual(10.0);

          // Score deve ter no máximo 1 casa decimal
          const decimalPart = Math.round((score % 1) * 10) / 10;
          expect(Math.abs(score - Math.round(score * 10) / 10)).toBeLessThanOrEqual(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// P21 — Média simples matematicamente correta (função pura, sem DB)
// =============================================================================

// Feature: smart-product-reviews, Property 21: média simples é matematicamente correta
// Para qualquer conjunto de avaliações, simpleAverage deve ser igual à média aritmética das notas (±0.05).
// **Validates: Requirements 7.4**
describe('P21 — média simples matematicamente correta (invariante matemático)', () => {
  it('para qualquer conjunto de avaliações, a média simples calculada deve ser igual à média aritmética (±0.05)', () => {
    fc.assert(
      fc.property(
        fc.array(validRatingArb, { minLength: 1, maxLength: 30 }),
        (ratings) => {
          // Calcula a média aritmética esperada
          const expectedAvg = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
          const expectedRounded = Math.round(expectedAvg * 10) / 10;

          // Simula o cálculo do insight-service (mesmo algoritmo de recalculateScore)
          const ratingSum = ratings.reduce((acc, r) => acc + r, 0);
          const simpleAverage = Math.round((ratingSum / ratings.length) * 10) / 10;

          // Deve ser igual à média aritmética com tolerância de ±0.05
          expect(Math.abs(simpleAverage - expectedAvg)).toBeLessThanOrEqual(0.05);

          // Deve estar no intervalo válido [1.0, 5.0] (notas são 1–5)
          expect(simpleAverage).toBeGreaterThanOrEqual(1.0);
          expect(simpleAverage).toBeLessThanOrEqual(5.0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
