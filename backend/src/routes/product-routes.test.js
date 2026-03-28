// Testes de integração para as rotas de produtos
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// Mock do product-service para isolar os testes de rota
jest.unstable_mockModule('../services/product-service.js', () => ({
  searchProducts: jest.fn(),
  getProductById: jest.fn(),
  createProductService: jest.fn(),
}));

// Mock do auth-service para controlar autenticação nos testes
jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  verifyToken: jest.fn(),
  isTokenBlacklisted: jest.fn(),
}));

// Mock do user-model para o auth-middleware encontrar o usuário
jest.unstable_mockModule('../models/user-model.js', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn(),
}));

const { searchProducts, getProductById, createProductService } = await import('../services/product-service.js');
const { verifyToken, isTokenBlacklisted } = await import('../services/auth-service.js');
const { findById: findUserById } = await import('../models/user-model.js');
const { default: app } = await import('../server.js');

beforeEach(() => {
  jest.clearAllMocks();
});


/**
 * Função auxiliar para configurar mocks de autenticação.
 * Simula um usuário autenticado com token válido.
 */
function setupAuthenticatedUser(user = { id: 'user-1', name: 'Maria', email: 'maria@email.com' }) {
  verifyToken.mockReturnValue({ userId: user.id });
  isTokenBlacklisted.mockReturnValue(false);
  findUserById.mockResolvedValue(user);
  return user;
}

describe('GET /api/products', () => {
  test('deve retornar 200 com array de produtos', async () => {
    const mockProducts = [
      { id: '1', name: 'Teclado Mecânico', category: 'Periféricos' },
      { id: '2', name: 'Mouse Gamer', category: 'Periféricos' },
    ];
    searchProducts.mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ products: mockProducts });
    expect(searchProducts).toHaveBeenCalledWith(undefined);
  });

  test('deve retornar produtos filtrados quando query ?q= é fornecida', async () => {
    const mockFiltered = [
      { id: '1', name: 'Teclado Mecânico', category: 'Periféricos' },
    ];
    searchProducts.mockResolvedValue(mockFiltered);

    const res = await request(app).get('/api/products?q=teclado');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ products: mockFiltered });
    expect(searchProducts).toHaveBeenCalledWith('teclado');
  });
});

describe('GET /api/products/:id', () => {
  test('deve retornar 200 com detalhes do produto existente', async () => {
    const mockProduct = {
      id: '1',
      name: 'Teclado Mecânico',
      description: 'Teclado com switches blue',
      category: 'Periféricos',
      imageUrl: 'https://example.com/teclado.jpg',
    };
    getProductById.mockResolvedValue(mockProduct);

    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProduct);
    expect(getProductById).toHaveBeenCalledWith('1');
  });

  test('deve retornar 404 para produto inexistente', async () => {
    const { AppError } = await import('../middleware/error-middleware.js');
    getProductById.mockRejectedValue(new AppError('NOT_FOUND', 'Produto não encontrado'));

    const res = await request(app).get('/api/products/inexistente');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/products', () => {
  const validProduct = {
    name: 'Monitor Ultrawide',
    description: 'Monitor 34 polegadas curvo',
    category: 'Monitores',
    imageUrl: 'https://example.com/monitor.jpg',
  };

  test('deve retornar 201 com produto criado quando autenticado', async () => {
    const user = setupAuthenticatedUser();
    const mockCreated = { id: 'prod-1', ...validProduct, createdBy: user.id };
    createProductService.mockResolvedValue(mockCreated);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer token-valido')
      .send(validProduct);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockCreated);
    expect(createProductService).toHaveBeenCalledWith({
      name: validProduct.name,
      description: validProduct.description,
      category: validProduct.category,
      imageUrl: validProduct.imageUrl,
      createdBy: user.id,
    });
  });

  test('deve retornar 401 sem token de autenticação', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(validProduct);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(createProductService).not.toHaveBeenCalled();
  });

  test('deve retornar 422 com erros de validação para campos obrigatórios ausentes', async () => {
    setupAuthenticatedUser();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer token-valido')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'description' }),
        expect.objectContaining({ field: 'category' }),
      ])
    );
    expect(createProductService).not.toHaveBeenCalled();
  });
});
