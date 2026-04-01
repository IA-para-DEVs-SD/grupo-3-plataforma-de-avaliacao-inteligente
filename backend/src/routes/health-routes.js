// Rota de health check — expõe estado do servidor, banco e fila de IA
import { Router } from 'express';
import { getDb } from '../database/connection.js';
import { getQueueLength } from '../ai-engine/ai-queue.js';
import { getCacheSize } from '../services/insight-cache.js';

const router = Router();

/**
 * GET /health
 * Retorna o estado operacional do sistema.
 * Verifica conectividade com o banco e estado da fila de IA.
 */
router.get('/', (_req, res) => {
  const startTime = Date.now();

  // Verifica banco de dados
  let dbStatus = 'ok';
  let dbError = null;
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
  } catch (err) {
    dbStatus = 'error';
    dbError = err.message;
  }

  const queueLength = getQueueLength();
  const cacheSize = getCacheSize();
  const responseTimeMs = Date.now() - startTime;

  const isHealthy = dbStatus === 'ok';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTimeMs,
    services: {
      database: {
        status: dbStatus,
        ...(dbError && { error: dbError }),
      },
      aiQueue: {
        status: 'ok',
        pendingTasks: queueLength,
      },
      insightCache: {
        status: 'ok',
        cachedProducts: cacheSize,
      },
    },
  });
});

export default router;
