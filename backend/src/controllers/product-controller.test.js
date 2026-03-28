// Testes unitários para o controller de produtos
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock do product-service — deve ser declarado ANTES de importar o controller
jest.unstable_mockModule('../services/product-service.js', () => ({
  searchProducts: jest.fn(),
  getProductById: jest.fn(),
  createProductService: jest.fn(),
}));

// Importa o controller e o serviço mockado após declarar o mock
const { searchProducts, getProductById, createProduct } = await import('./product-controller.js');
const { searchProducts: searchProductsSvc, getProductById: getProductByIdSvc, createProductService } = await import('../services/product-service.js');

/**
 * Cria um mock de requisição Express com body, query, params e user.
 */
function createMockReq({ body = {}, query = {}, params = {}, user = null } = {}) {
  return { body, query, params, user };
}

/**
 * Cria um mock de resposta Express para capturar status e JSON.
 */
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res.body = data;
      return res;
    },
  };
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('searchProducts', () => {
  test('deve retornar 200 com lista de produtos ao buscar com termo', async () => {
    const mockProducts = [
      { id: '1', name: 'Teclado Mecânico', category: 'Periféricos' },
      { id: '2', name: 'Teclado Sem Fio', category: 'Periféricos' },
    ];
    searchProductsSvc.mockResolvedValue(mockProducts);

    const req = createMockReq({ query: { q: 'teclado' } });
    const res = createMockRes();
    const next = jest.fn();

    await searchProducts(req, res, next);

    expect(searchProductsSvc).toHaveBeenCalledWith('teclado');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ products: mockProducts });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 200 com lista vazia quando nenhum produto corresponde', async () => {
    searchProductsSvc.mockResolvedValue([]);

    const req = createMockReq({ query: { q: 'inexistente' } });
    const res = createMockRes();
    const next = jest.fn();

    await searchProducts(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ products: [] });
  });

  test('deve passar q como undefined quando query param não é fornecido', async () => {
    searchProductsSvc.mockResolvedValue([]);

    const req = createMockReq({ query: {} });
    const res = createMockRes();
    const next = jest.fn();

    await searchProducts(req, res, next);

    expect(searchProductsSvc).toHaveBeenCalledWith(undefined);
    expect(res.statusCode).toBe(200);
  });

  test('deve chamar next com erro quando searchProducts lança exceção', async () => {
    const error = new Error('Falha no banco');
    searchProductsSvc.mockRejectedValue(error);

    const req = createMockReq({ query: { q: 'teste' } });
    const res = createMockRes();
    const next = jest.fn();

    await searchProducts(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });
});

describe('getProductById', () => {
  test('deve retornar 200 com produto ao buscar por ID válido', async () => {
    const mockProduct = { id: 'abc-123', name: 'Mouse Gamer', description: 'Mouse RGB', category: 'Periféricos', imageUrl: 'http://img.com/mouse.jpg' };
    getProductByIdSvc.mockResolvedValue(mockProduct);

    const req = createMockReq({ params: { id: 'abc-123' } });
    const res = createMockRes();
    const next = jest.fn();

    await getProductById(req, res, next);

    expect(getProductByIdSvc).toHaveBeenCalledWith('abc-123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockProduct);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next com erro quando produto não é encontrado', async () => {
    const error = new Error('Produto não encontrado');
    error.code = 'NOT_FOUND';
    getProductByIdSvc.mockRejectedValue(error);

    const req = createMockReq({ params: { id: 'nao-existe' } });
    const res = createMockRes();
    const next = jest.fn();

    await getProductById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });
});

describe('createProduct', () => {
  test('deve retornar 201 com produto criado ao submeter dados válidos', async () => {
    const mockProduct = { id: 'new-1', name: 'Monitor 4K', description: 'Monitor UHD', category: 'Monitores', imageUrl: 'http://img.com/monitor.jpg', createdBy: 'user-1' };
    createProductService.mockResolvedValue(mockProduct);

    const req = createMockReq({
      body: { name: 'Monitor 4K', description: 'Monitor UHD', category: 'Monitores', imageUrl: 'http://img.com/monitor.jpg' },
      user: { id: 'user-1' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createProduct(req, res, next);

    expect(createProductService).toHaveBeenCalledWith({
      name: 'Monitor 4K',
      description: 'Monitor UHD',
      category: 'Monitores',
      imageUrl: 'http://img.com/monitor.jpg',
      createdBy: 'user-1',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockProduct);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next com erro quando createProductService lança exceção de validação', async () => {
    const error = new Error('Dados do produto inválidos');
    error.code = 'VALIDATION_ERROR';
    createProductService.mockRejectedValue(error);

    const req = createMockReq({
      body: { name: '', description: '', category: '' },
      user: { id: 'user-1' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createProduct(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });

  test('deve usar req.user.id como createdBy', async () => {
    createProductService.mockResolvedValue({ id: 'p1' });

    const req = createMockReq({
      body: { name: 'Produto', description: 'Desc', category: 'Cat' },
      user: { id: 'user-42' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createProduct(req, res, next);

    expect(createProductService).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'user-42' })
    );
  });
});
