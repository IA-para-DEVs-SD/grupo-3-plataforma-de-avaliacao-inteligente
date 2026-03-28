import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchProducts, getProduct, createProduct } from './product-service.js';
import api from './api.js';

// Mock da instância axios para isolar testes do backend real
vi.mock('./api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('product-service.js — chamadas à API de produtos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchProducts', () => {
    it('deve enviar GET /products com parâmetro de busca e retornar array de produtos', async () => {
      const mockProducts = [
        { id: '1', name: 'Teclado Mecânico', category: 'Periféricos' },
        { id: '2', name: 'Mouse Gamer', category: 'Periféricos' },
      ];
      api.get.mockResolvedValueOnce({ data: { products: mockProducts } });

      const result = await searchProducts('Periféricos');

      expect(api.get).toHaveBeenCalledWith('/products', { params: { q: 'Periféricos' } });
      expect(result).toEqual(mockProducts);
    });

    it('deve retornar array vazio quando nenhum produto corresponde à busca', async () => {
      api.get.mockResolvedValueOnce({ data: { products: [] } });

      const result = await searchProducts('inexistente');

      expect(result).toEqual([]);
    });

    it('deve propagar erro quando a API falha', async () => {
      const error = new Error('Erro de rede');
      api.get.mockRejectedValueOnce(error);

      await expect(searchProducts('teste')).rejects.toThrow('Erro de rede');
    });
  });

  describe('getProduct', () => {
    it('deve enviar GET /products/:id e retornar dados do produto', async () => {
      const mockProduct = {
        id: '1',
        name: 'Teclado Mecânico',
        description: 'Teclado com switches blue',
        category: 'Periféricos',
        imageUrl: 'https://exemplo.com/teclado.jpg',
      };
      api.get.mockResolvedValueOnce({ data: mockProduct });

      const result = await getProduct('1');

      expect(api.get).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockProduct);
    });

    it('deve propagar erro quando produto não é encontrado', async () => {
      const error = new Error('Produto não encontrado');
      api.get.mockRejectedValueOnce(error);

      await expect(getProduct('999')).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('createProduct', () => {
    it('deve enviar POST /products com dados do produto e retornar produto criado', async () => {
      const productData = {
        name: 'Monitor 4K',
        description: 'Monitor UHD de 27 polegadas',
        category: 'Monitores',
        imageUrl: 'https://exemplo.com/monitor.jpg',
      };
      const mockResponse = { id: '3', ...productData, createdBy: 'user-1' };
      api.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await createProduct(productData);

      expect(api.post).toHaveBeenCalledWith('/products', productData);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar erro quando a API rejeita a criação', async () => {
      const error = new Error('Dados inválidos');
      api.post.mockRejectedValueOnce(error);

      await expect(
        createProduct({ name: '', description: '', category: '', imageUrl: '' })
      ).rejects.toThrow('Dados inválidos');
    });
  });
});
