// Testes unitários para product-service.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock do product-model antes de importar o service
const mockCreateProduct = jest.fn();
const mockFindById = jest.fn();
const mockSearch = jest.fn();

jest.unstable_mockModule('../models/product-model.js', () => ({
  createProduct: mockCreateProduct,
  findById: mockFindById,
  search: mockSearch,
}));

// Importa product-service após configurar o mock
const {
  createProductService,
  getProductById,
  searchProducts,
} = await import('./product-service.js');

beforeEach(() => {
  mockCreateProduct.mockReset();
  mockFindById.mockReset();
  mockSearch.mockReset();
});

describe('createProductService', () => {
  const validData = {
    name: 'Teclado Mecânico',
    description: 'Teclado com switches Cherry MX',
    category: 'Periféricos',
    imageUrl: 'https://example.com/teclado.jpg',
    createdBy: 'user-123',
  };

  it('deve criar um produto com dados válidos', async () => {
    const fakeProduct = { id: 'prod-1', ...validData, createdAt: '2024-01-01' };
    mockCreateProduct.mockResolvedValue(fakeProduct);

    const result = await createProductService(validData);

    expect(result).toEqual(fakeProduct);
    expect(mockCreateProduct).toHaveBeenCalledWith({
      name: 'Teclado Mecânico',
      description: 'Teclado com switches Cherry MX',
      category: 'Periféricos',
      imageUrl: 'https://example.com/teclado.jpg',
      createdBy: 'user-123',
    });
  });

  it('deve fazer trim nos campos de texto', async () => {
    const dataWithSpaces = {
      ...validData,
      name: '  Teclado  ',
      description: '  Descrição  ',
      category: '  Periféricos  ',
    };
    mockCreateProduct.mockResolvedValue({ id: 'prod-2' });

    await createProductService(dataWithSpaces);

    expect(mockCreateProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Teclado',
        description: 'Descrição',
        category: 'Periféricos',
      })
    );
  });

  it('deve usar null para imageUrl quando não fornecido', async () => {
    const dataWithoutImage = { ...validData, imageUrl: undefined };
    mockCreateProduct.mockResolvedValue({ id: 'prod-3' });

    await createProductService(dataWithoutImage);

    expect(mockCreateProduct).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: null })
    );
  });

  it('deve lançar VALIDATION_ERROR quando nome está vazio', async () => {
    await expect(
      createProductService({ ...validData, name: '' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    });

    expect(mockCreateProduct).not.toHaveBeenCalled();
  });

  it('deve lançar VALIDATION_ERROR quando nome é apenas espaços', async () => {
    await expect(
      createProductService({ ...validData, name: '   ' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    });
  });

  it('deve lançar VALIDATION_ERROR quando descrição está ausente', async () => {
    await expect(
      createProductService({ ...validData, description: null })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    });
  });

  it('deve lançar VALIDATION_ERROR quando categoria está vazia', async () => {
    await expect(
      createProductService({ ...validData, category: '' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    });
  });

  it('deve incluir detalhes dos campos inválidos no erro', async () => {
    try {
      await createProductService({ ...validData, name: '', description: '', category: '' });
    } catch (err) {
      expect(err.details).toHaveLength(3);
      expect(err.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
          expect.objectContaining({ field: 'category' }),
        ])
      );
    }
  });
});

describe('getProductById', () => {
  it('deve retornar o produto quando encontrado', async () => {
    const fakeProduct = { id: 'prod-1', name: 'Mouse', category: 'Periféricos' };
    mockFindById.mockResolvedValue(fakeProduct);

    const result = await getProductById('prod-1');

    expect(result).toEqual(fakeProduct);
    expect(mockFindById).toHaveBeenCalledWith('prod-1');
  });

  it('deve lançar NOT_FOUND quando produto não existe', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(
      getProductById('inexistente')
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  });
});

describe('searchProducts', () => {
  it('deve retornar resultados da busca', async () => {
    const fakeResults = [
      { id: 'prod-1', name: 'Teclado', category: 'Periféricos' },
      { id: 'prod-2', name: 'Teclado Gamer', category: 'Periféricos' },
    ];
    mockSearch.mockResolvedValue(fakeResults);

    const result = await searchProducts('Teclado');

    expect(result).toEqual(fakeResults);
    expect(mockSearch).toHaveBeenCalledWith('Teclado');
  });

  it('deve retornar array vazio quando nenhum resultado encontrado', async () => {
    mockSearch.mockResolvedValue([]);

    const result = await searchProducts('inexistente');

    expect(result).toEqual([]);
  });

  it('deve passar termo undefined quando não fornecido', async () => {
    mockSearch.mockResolvedValue([]);

    await searchProducts(undefined);

    expect(mockSearch).toHaveBeenCalledWith(undefined);
  });
});
