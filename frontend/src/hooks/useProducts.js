import { useState, useCallback } from 'react';
import { searchProducts, getProduct as fetchProduct } from '../services/product-service.js';

/**
 * Hook customizado para gerenciar busca e consulta de produtos.
 * Encapsula estados de loading, erro e lista de produtos,
 * expondo funções para buscar e obter detalhes de um produto.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca produtos pelo termo informado.
   * Atualiza automaticamente os estados de loading, erro e lista de produtos.
   * @param {string} query — termo de busca
   */
  const search = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchProducts(query);
      setProducts(results);
    } catch (err) {
      setError(err.message || 'Erro ao buscar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtém os detalhes de um produto pelo ID.
   * Atualiza automaticamente os estados de loading e erro.
   * @param {string} id — identificador do produto
   * @returns {Promise<object|null>} dados do produto ou null em caso de erro
   */
  const getProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const product = await fetchProduct(id);
      return product;
    } catch (err) {
      setError(err.message || 'Erro ao obter produto');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, search, getProduct };
}
