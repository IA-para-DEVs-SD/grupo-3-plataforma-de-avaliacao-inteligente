import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts.js';
import * as productService from '../services/product-service.js';

// Mock do serviço de produtos para isolar testes do backend
vi.mock('../services/product-service.js', () => ({
  searchProducts: vi.fn(),
  getProduct: vi.fn(),
}));

describe('useProducts — hook de busca e consulta de produtos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com estado padrão: lista vazia, sem loading e sem erro', () => {
    const { result } = renderHook(() => useProducts());

    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.search).toBe('function');
    expect(typeof result.current.getProduct).toBe('function');
  });

  describe('search', () => {
    it('deve atualizar produtos após busca bem-sucedida', async () => {
      const mockProducts = [
        { id: '1', name: 'Teclado Mecânico', category: 'Periféricos' },
      ];
      productService.searchProducts.mockResolvedValueOnce(mockProducts);

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await result.current.search('Teclado');
      });

      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(productService.searchProducts).toHaveBeenCalledWith('Teclado');
    });

    it('deve definir loading como true durante a busca', async () => {
      let resolvePromise;
      productService.searchProducts.mockReturnValueOnce(
        new Promise((resolve) => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useProducts());

      act(() => {
        result.current.search('teste');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise([]);
      });

      expect(result.current.loading).toBe(false);
    });

    it('deve definir erro e limpar produtos quando a busca falha', async () => {
      productService.searchProducts.mockRejectedValueOnce(new Error('Erro de rede'));

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await result.current.search('falha');
      });

      expect(result.current.error).toBe('Erro de rede');
      expect(result.current.products).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('deve usar mensagem padrão quando erro não tem message', async () => {
      productService.searchProducts.mockRejectedValueOnce({});

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await result.current.search('falha');
      });

      expect(result.current.error).toBe('Erro ao buscar produtos');
    });

    it('deve limpar erro anterior ao iniciar nova busca', async () => {
      productService.searchProducts.mockRejectedValueOnce(new Error('Erro'));
      productService.searchProducts.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await result.current.search('falha');
      });
      expect(result.current.error).toBe('Erro');

      await act(async () => {
        await result.current.search('sucesso');
      });
      expect(result.current.error).toBeNull();
      expect(result.current.products).toEqual([]);
    });
  });

  describe('getProduct', () => {
    it('deve retornar dados do produto após consulta bem-sucedida', async () => {
      const mockProduct = { id: '1', name: 'Monitor 4K', category: 'Monitores' };
      productService.getProduct.mockResolvedValueOnce(mockProduct);

      const { result } = renderHook(() => useProducts());

      let product;
      await act(async () => {
        product = await result.current.getProduct('1');
      });

      expect(product).toEqual(mockProduct);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(productService.getProduct).toHaveBeenCalledWith('1');
    });

    it('deve retornar null e definir erro quando consulta falha', async () => {
      productService.getProduct.mockRejectedValueOnce(new Error('Produto não encontrado'));

      const { result } = renderHook(() => useProducts());

      let product;
      await act(async () => {
        product = await result.current.getProduct('999');
      });

      expect(product).toBeNull();
      expect(result.current.error).toBe('Produto não encontrado');
      expect(result.current.loading).toBe(false);
    });

    it('deve usar mensagem padrão quando erro não tem message', async () => {
      productService.getProduct.mockRejectedValueOnce({});

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await result.current.getProduct('1');
      });

      expect(result.current.error).toBe('Erro ao obter produto');
    });
  });
});
