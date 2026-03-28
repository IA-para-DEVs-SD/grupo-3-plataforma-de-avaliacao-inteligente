// Testes unitários para o middleware de rate limiting
import { describe, test, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { reviewRateLimit, insightRateLimit } from './rate-limit-middleware.js';

/**
 * Cria um app Express mínimo para testar o middleware de rate limiting.
 * @param {Function} rateLimitMiddleware - Middleware de rate limiting a ser testado
 * @param {boolean} injectUser - Se deve injetar req.user antes do rate limit
 */
function createTestApp(rateLimitMiddleware, { injectUser = false, userId = 'user-1' } = {}) {
  const app = express();

  if (injectUser) {
    app.use((req, _res, next) => {
      req.user = { id: userId };
      next();
    });
  }

  app.post('/test', rateLimitMiddleware, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/test', rateLimitMiddleware, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('reviewRateLimit', () => {
  test('deve permitir requisições dentro do limite', async () => {
    const app = createTestApp(reviewRateLimit, { injectUser: true });

    const res = await request(app).post('/test');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('deve retornar 429 com formato padrão ao exceder o limite de 10 req/min', async () => {
    const app = createTestApp(reviewRateLimit, { injectUser: true });

    // Envia 10 requisições válidas
    for (let i = 0; i < 10; i++) {
      await request(app).post('/test');
    }

    // A 11ª requisição deve ser bloqueada
    const res = await request(app).post('/test');

    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: expect.any(String),
        details: [],
      },
    });
  });

  test('deve usar req.user.id como chave de rate limiting (limites independentes por usuário)', async () => {
    // Usuário 1 esgota o limite
    const app1 = createTestApp(reviewRateLimit, { injectUser: true, userId: 'user-1' });
    for (let i = 0; i < 10; i++) {
      await request(app1).post('/test');
    }
    const blocked = await request(app1).post('/test');
    expect(blocked.status).toBe(429);

    // Usuário 2 em outro app (store separado) ainda pode fazer requisições
    const app2 = createTestApp(reviewRateLimit, { injectUser: true, userId: 'user-2' });
    const res = await request(app2).post('/test');
    expect(res.status).toBe(200);
  });
});

describe('insightRateLimit', () => {
  test('deve permitir requisições dentro do limite', async () => {
    const app = createTestApp(insightRateLimit);

    const res = await request(app).get('/test');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('deve retornar 429 com formato padrão ao exceder o limite de 30 req/min', async () => {
    const app = createTestApp(insightRateLimit);

    // Envia 30 requisições válidas
    for (let i = 0; i < 30; i++) {
      await request(app).get('/test');
    }

    // A 31ª requisição deve ser bloqueada
    const res = await request(app).get('/test');

    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: expect.any(String),
        details: [],
      },
    });
  });
});
