// Cache em memória para resultados de insights de IA
// Evita recalcular insights a cada requisição quando não houve novas avaliações

/** TTL padrão do cache em milissegundos (2 minutos) */
const DEFAULT_TTL_MS = 2 * 60 * 1000;

/** Mapa interno: productId → { data, expiresAt } */
const cache = new Map();

/**
 * Retorna o insight em cache para um produto, ou null se expirado/ausente.
 * @param {string} productId
 * @returns {object | null}
 */
export function getCached(productId) {
  const entry = cache.get(productId);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(productId);
    return null;
  }

  return entry.data;
}

/**
 * Armazena o insight de um produto no cache.
 * @param {string} productId
 * @param {object} data — dados do insight
 * @param {number} [ttl] — tempo de vida em ms (padrão: 2 minutos)
 */
export function setCached(productId, data, ttl = DEFAULT_TTL_MS) {
  cache.set(productId, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

/**
 * Invalida o cache de um produto específico.
 * Deve ser chamado sempre que um novo insight for calculado.
 * @param {string} productId
 */
export function invalidate(productId) {
  cache.delete(productId);
}

/**
 * Retorna o número de entradas ativas no cache (para testes/monitoramento).
 * @returns {number}
 */
export function getCacheSize() {
  return cache.size;
}
