import { useState, useCallback } from 'react';
import { getReviews as fetchReviewsApi, createReview as createReviewApi } from '../services/review-service.js';

/**
 * Hook customizado para gerenciar avaliações de um produto.
 * Encapsula estados de loading, erro, lista de avaliações,
 * filtros, paginação e funções de busca e submissão.
 */
export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ sentiment: '', sort: '', pattern: '', rating: '' });

  // Referência interna do productId para re-fetches automáticos
  const [currentProductId, setCurrentProductId] = useState(null);

  /**
   * Busca avaliações de um produto com opções de filtro e paginação.
   * Atualiza automaticamente todos os estados relacionados.
   */
  const fetchReviews = useCallback(async (productId, options = {}) => {
    setLoading(true);
    setError(null);
    setCurrentProductId(productId);
    try {
      const data = await fetchReviewsApi(productId, options);
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPageState(data.page || 1);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Erro ao buscar avaliações');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submete uma nova avaliação e recarrega a lista.
   */
  const submitReview = useCallback(async (productId, { text, rating }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createReviewApi(productId, { text, rating });
      // Recarrega a lista após submissão bem-sucedida
      await fetchReviews(productId, { ...filters, page: 1 });
      return result;
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Erro ao enviar avaliação';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews, filters]);

  /**
   * Atualiza um filtro e recarrega as avaliações.
   */
  const setFilter = useCallback((filterName, value) => {
    setFilters(prev => {
      const updated = { ...prev, [filterName]: value };
      if (currentProductId) {
        fetchReviews(currentProductId, { ...updated, page: 1 });
      }
      return updated;
    });
    setPageState(1);
  }, [currentProductId, fetchReviews]);

  /**
   * Navega para uma página específica e recarrega as avaliações.
   */
  const setPage = useCallback((newPage) => {
    setPageState(newPage);
    if (currentProductId) {
      fetchReviews(currentProductId, { ...filters, page: newPage });
    }
  }, [currentProductId, fetchReviews, filters]);

  return {
    reviews,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    fetchReviews,
    submitReview,
    setFilter,
    setPage,
  };
}
