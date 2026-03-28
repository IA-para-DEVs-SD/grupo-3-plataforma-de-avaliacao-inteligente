import { useState, useCallback, useEffect, useRef } from 'react';
import { getInsights } from '../services/insight-service.js';

/**
 * Hook customizado para gerenciar insights de IA de um produto.
 * Encapsula estados de loading, erro e dados de insights,
 * com polling opcional enquanto os insights estão sendo processados.
 */

// Intervalo de polling em milissegundos (5 segundos)
const POLL_INTERVAL = 5000;

export function useInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Referências para controle de polling
  const pollingRef = useRef(null);
  const lastUpdatedAtRef = useRef(null);

  /**
   * Busca insights de um produto pelo ID.
   * Atualiza automaticamente os estados de loading, erro e insights.
   * @param {string} productId — identificador do produto
   */
  const fetchInsights = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInsights(productId);
      setInsights(data);

      // Verifica se updatedAt mudou para decidir se continua polling
      if (lastUpdatedAtRef.current && data?.updatedAt !== lastUpdatedAtRef.current) {
        // Insights foram atualizados — para o polling
        stopPolling();
      }
      lastUpdatedAtRef.current = data?.updatedAt || null;

      return data;
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Erro ao buscar insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicia polling para aguardar processamento de insights.
   * Consulta a cada 5 segundos até que updatedAt mude.
   * @param {string} productId — identificador do produto
   */
  const startPolling = useCallback((productId) => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      fetchInsights(productId);
    }, POLL_INTERVAL);
  }, [fetchInsights]);

  /**
   * Para o polling de insights.
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Limpa o polling ao desmontar o componente
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { insights, loading, error, fetchInsights, startPolling, stopPolling };
}
