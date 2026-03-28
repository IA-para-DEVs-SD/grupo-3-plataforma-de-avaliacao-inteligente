// Funções de validação reutilizáveis para formulários do InsightReview
// Cada função retorna uma string de erro (pt-BR) ou null se válido

/**
 * Valida formato de e-mail
 * @param {string} email
 * @returns {string|null} mensagem de erro ou null
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return 'O e-mail é obrigatório';
  }
  // Regex simples para formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Formato de e-mail inválido';
  }
  return null;
}

/**
 * Valida senha com mínimo de 8 caracteres
 * @param {string} password
 * @returns {string|null} mensagem de erro ou null
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'A senha é obrigatória';
  }
  if (password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres';
  }
  return null;
}

/**
 * Valida nome (não vazio)
 * @param {string} name
 * @returns {string|null} mensagem de erro ou null
 */
export function validateName(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'O nome é obrigatório';
  }
  return null;
}

/**
 * Valida texto de avaliação com mínimo de 20 caracteres
 * @param {string} text
 * @returns {string|null} mensagem de erro ou null
 */
export function validateReviewText(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'O texto da avaliação é obrigatório';
  }
  if (text.trim().length < 20) {
    return 'O texto da avaliação deve ter no mínimo 20 caracteres';
  }
  return null;
}

/**
 * Valida nota (inteiro entre 1 e 5)
 * @param {number} rating
 * @returns {string|null} mensagem de erro ou null
 */
export function validateRating(rating) {
  if (rating === null || rating === undefined || rating === '') {
    return 'A nota é obrigatória';
  }
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'A nota deve ser um número inteiro entre 1 e 5';
  }
  return null;
}

/**
 * Valida nome do produto (não vazio)
 * @param {string} name
 * @returns {string|null} mensagem de erro ou null
 */
export function validateProductName(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'O nome do produto é obrigatório';
  }
  return null;
}

/**
 * Valida descrição do produto (não vazia)
 * @param {string} description
 * @returns {string|null} mensagem de erro ou null
 */
export function validateProductDescription(description) {
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return 'A descrição do produto é obrigatória';
  }
  return null;
}

/**
 * Valida categoria do produto (não vazia)
 * @param {string} category
 * @returns {string|null} mensagem de erro ou null
 */
export function validateProductCategory(category) {
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return 'A categoria do produto é obrigatória';
  }
  return null;
}
