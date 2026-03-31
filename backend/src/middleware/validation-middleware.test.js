// Testes unitários para o middleware de validação de entrada (registro e login)
import { describe, expect, test } from '@jest/globals';
import express from 'express';
import { errorMiddleware } from './error-middleware.js';
import { validateCreateProduct, validateLogin, validateRegister } from './validation-middleware.js';

/**
 * Cria uma mini app Express para testar os middlewares de validação isoladamente.
 * Registra a rota com os middlewares e o error handler centralizado.
 */
function createTestApp(path, middlewares) {
  const app = express();
  app.use(express.json());
  app.post(path, ...middlewares, (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use(errorMiddleware);
  return app;
}

/**
 * Helper para fazer requisições POST na mini app de teste.
 */
async function postJSON(app, path, body) {
  // Importação dinâmica do supertest para evitar problemas com ESM
  const { default: request } = await import('supertest');
  return request(app).post(path).send(body);
}

describe('validateRegister', () => {
  const app = createTestApp('/register', validateRegister);

  test('deve aceitar dados válidos de registro', async () => {
    const res = await postJSON(app, '/register', {
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('deve rejeitar nome vazio com erro 422', async () => {
    const res = await postJSON(app, '/register', {
      name: '',
      email: 'joao@example.com',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name', message: 'Nome é obrigatório' }),
      ])
    );
  });

  test('deve rejeitar nome ausente com erro 422', async () => {
    const res = await postJSON(app, '/register', {
      email: 'joao@example.com',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
      ])
    );
  });

  test('deve rejeitar e-mail com formato inválido', async () => {
    const res = await postJSON(app, '/register', {
      name: 'João',
      email: 'nao-eh-email',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Formato de e-mail inválido' }),
      ])
    );
  });

  test('deve rejeitar senha com menos de 8 caracteres', async () => {
    const res = await postJSON(app, '/register', {
      name: 'João',
      email: 'joao@example.com',
      password: '1234567',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password', message: 'Senha deve ter no mínimo 8 caracteres' }),
      ])
    );
  });

  test('deve aceitar senha com exatamente 8 caracteres', async () => {
    const res = await postJSON(app, '/register', {
      name: 'João',
      email: 'joao@example.com',
      password: '12345678',
    });

    expect(res.status).toBe(200);
  });

  test('deve retornar múltiplos erros quando vários campos são inválidos', async () => {
    const res = await postJSON(app, '/register', {
      name: '',
      email: 'invalido',
      password: '123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveLength(3);
  });

  test('deve fazer trim do nome antes de validar', async () => {
    const res = await postJSON(app, '/register', {
      name: '   ',
      email: 'joao@example.com',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
      ])
    );
  });
});

describe('validateLogin', () => {
  const app = createTestApp('/login', validateLogin);

  test('deve aceitar dados válidos de login', async () => {
    const res = await postJSON(app, '/login', {
      email: 'joao@example.com',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('deve rejeitar e-mail com formato inválido', async () => {
    const res = await postJSON(app, '/login', {
      email: 'nao-eh-email',
      password: 'senhaforte123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Formato de e-mail inválido' }),
      ])
    );
  });

  test('deve rejeitar senha vazia', async () => {
    const res = await postJSON(app, '/login', {
      email: 'joao@example.com',
      password: '',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password', message: 'Senha é obrigatória' }),
      ])
    );
  });

  test('deve rejeitar senha ausente', async () => {
    const res = await postJSON(app, '/login', {
      email: 'joao@example.com',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  test('deve retornar mensagem padrão de validação', async () => {
    const res = await postJSON(app, '/login', {
      email: 'invalido',
      password: '',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toBe('Dados de entrada inválidos');
  });
});

describe('validateCreateProduct', () => {
  const app = createTestApp('/products', validateCreateProduct);

  test('deve aceitar dados válidos de produto', async () => {
    const res = await postJSON(app, '/products', {
      name: 'Notebook Dell',
      description: 'Notebook com 16GB RAM',
      category: 'Eletrônicos',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('deve rejeitar nome vazio com erro 422', async () => {
    const res = await postJSON(app, '/products', {
      name: '',
      description: 'Descrição válida',
      category: 'Eletrônicos',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name', message: 'Nome do produto é obrigatório' }),
      ])
    );
  });

  test('deve rejeitar descrição vazia com erro 422', async () => {
    const res = await postJSON(app, '/products', {
      name: 'Notebook Dell',
      description: '',
      category: 'Eletrônicos',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'description', message: 'Descrição do produto é obrigatória' }),
      ])
    );
  });

  test('deve rejeitar categoria vazia com erro 422', async () => {
    const res = await postJSON(app, '/products', {
      name: 'Notebook Dell',
      description: 'Descrição válida',
      category: '',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'category', message: 'Categoria do produto é obrigatória' }),
      ])
    );
  });

  test('deve rejeitar campos ausentes com erro 422', async () => {
    const res = await postJSON(app, '/products', {});

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveLength(3);
  });

  test('deve fazer trim dos campos antes de validar', async () => {
    const res = await postJSON(app, '/products', {
      name: '   ',
      description: '   ',
      category: '   ',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveLength(3);
  });
});

describe('validateCreateReview', () => {
  const app = createTestApp('/reviews', validateCreateReview);

  test('deve aceitar dados válidos de avaliação', async () => {
    const res = await postJSON(app, '/reviews', {
      text: 'Produto excelente, recomendo para todos os interessados!',
      rating: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('deve rejeitar texto vazio com erro 422', async () => {
    const res = await postJSON(app, '/reviews', {
      text: '',
      rating: 4,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'text', message: 'Texto da avaliação é obrigatório' }),
      ])
    );
  });

  test('deve rejeitar texto com menos de 20 caracteres', async () => {
    const res = await postJSON(app, '/reviews', {
      text: 'Texto curto demais',
      rating: 3,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'text', message: 'Texto da avaliação deve ter no mínimo 20 caracteres' }),
      ])
    );
  });

  test('deve aceitar texto com exatamente 20 caracteres', async () => {
    const res = await postJSON(app, '/reviews', {
      text: 'a'.repeat(20),
      rating: 3,
    });

    expect(res.status).toBe(200);
  });

  test('deve rejeitar nota menor que 1', async () => {
    const res = await postJSON(app, '/reviews', {
      text: 'Texto com mais de vinte caracteres para validar',
      rating: 0,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'rating', message: 'Nota deve ser um número inteiro entre 1 e 5' }),
      ])
    );
  });

  test('deve rejeitar nota maior que 5', async () => {
    const res = await postJSON(app, '/reviews', {
      text: 'Texto com mais de vinte caracteres para validar',
      rating: 6,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'rating', message: 'Nota deve ser um número inteiro entre 1 e 5' }),
      ])
    );
  });

  test('deve rejeitar nota decimal', async () => {
    const res = await postJSON(app, '/reviews', {
      text: 'Texto com mais de vinte caracteres para validar',
      rating: 3.5,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'rating' }),
      ])
    );
  });

  test('deve rejeitar campos ausentes com erro 422', async () => {
    const res = await postJSON(app, '/reviews', {});

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveLength(2);
  });

  test('deve fazer trim do texto antes de validar comprimento', async () => {
    const res = await postJSON(app, '/reviews', {
      text: '   curto   ',
      rating: 3,
    });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'text' }),
      ])
    );
  });
});
