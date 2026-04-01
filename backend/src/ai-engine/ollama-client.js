// Cliente Ollama — comunicação com a API local do Ollama
// Documentação: https://github.com/ollama/ollama/blob/main/docs/api.md

/** URL base da API do Ollama (configurável via variável de ambiente) */
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/** Modelo padrão a ser usado (configurável via variável de ambiente) */
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/** Timeout para requisições ao Ollama em ms (25 segundos — dentro do SLA de 30s) */
const OLLAMA_TIMEOUT_MS = 25000;

/**
 * Verifica se o Ollama está disponível e o modelo está carregado.
 * Faz uma requisição leve à API de tags para checar conectividade.
 * @returns {Promise<boolean>}
 */
export async function isOllamaAvailable() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return false;

    const data = await response.json();
    // Verifica se o modelo configurado está disponível
    const models = data.models || [];
    return models.some((m) => m.name.startsWith(OLLAMA_MODEL));
  } catch {
    return false;
  }
}

/**
 * Envia um prompt ao Ollama e retorna a resposta como texto.
 * Usa a API de geração sem streaming para simplicidade.
 * @param {string} prompt — prompt completo a enviar
 * @param {object} [options] — opções adicionais
 * @param {number} [options.temperature=0.1] — temperatura (baixa = mais determinístico)
 * @returns {Promise<string>} resposta do modelo
 * @throws {Error} se o Ollama não responder dentro do timeout
 */
export async function generate(prompt, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.1,
          num_predict: options.maxTokens ?? 50,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama retornou status ${response.status}`);
    }

    const data = await response.json();
    return data.response?.trim() || '';
  } finally {
    clearTimeout(timeout);
  }
}
