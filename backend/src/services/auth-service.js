// Serviço de autenticação — hash de senha, JWT, registro, login e logout
//
// ADR: Proteção CSRF
// A API utiliza autenticação via JWT enviado no header Authorization (Bearer scheme).
// Tokens JWT em headers não são enviados automaticamente pelo navegador (diferente de cookies),
// portanto a aplicação não é vulnerável a ataques CSRF tradicionais.
// Caso a estratégia de autenticação mude para cookies, CSRF protection deve ser adicionada.
//
// ADR: Blacklist de tokens em memória
// Para o POC, a blacklist é mantida em memória com expiração automática baseada no TTL do JWT.
// Em produção, migrar para Redis ou banco de dados para persistência entre restarts.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findByEmail } from '../models/user-model.js';
import { AppError } from '../middleware/error-middleware.js';

/** Número de rounds para o salt do bcrypt */
const SALT_ROUNDS = 10;

/** Tempo de expiração do token JWT */
const TOKEN_EXPIRATION = '24h';

/** Tempo de expiração da blacklist em ms (24h) — alinhado com TOKEN_EXPIRATION */
const BLACKLIST_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Blacklist de tokens com expiração automática.
 * Armazena tokens invalidados por logout com timestamp de inserção.
 * Tokens expirados são removidos automaticamente na verificação para evitar vazamento de memória.
 * @type {Map<string, number>}
 */
const tokenBlacklist = new Map();

/**
 * Gera o hash de uma senha usando bcryptjs.
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com um hash bcrypt.
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash bcrypt armazenado
 * @returns {Promise<boolean>} true se a senha corresponde ao hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Gera um token JWT com o userId no payload.
 * Usa JWT_SECRET do ambiente e expira em 24h.
 * @param {string} userId - ID do usuário
 * @returns {string} Token JWT assinado
 */
export function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ userId }, secret, { expiresIn: TOKEN_EXPIRATION });
}

/**
 * Verifica e decodifica um token JWT.
 * Lança AppError UNAUTHORIZED se o token for inválido ou expirado.
 * @param {string} token - Token JWT
 * @returns {object} Payload decodificado
 */
export function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch {
    throw new AppError('UNAUTHORIZED', 'Token inválido ou expirado');
  }
}

/**
 * Registra um novo usuário no sistema.
 * Valida dados, gera hash da senha, cria o usuário e retorna user + token.
 * @param {{ name: string, email: string, password: string }} dados de cadastro
 * @returns {Promise<{ user: object, token: string }>}
 * @throws {AppError} EMAIL_ALREADY_EXISTS se o e-mail já estiver cadastrado
 */
export async function registerUser({ name, email, password }) {
  // Verifica se o e-mail já está em uso
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new AppError('EMAIL_ALREADY_EXISTS', 'Este e-mail já está em uso');
  }

  // Gera hash da senha e cria o usuário
  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash });

  // Gera token JWT para o usuário recém-criado
  const token = generateToken(user.id);

  return { user, token };
}

/**
 * Autentica um usuário com e-mail e senha.
 * Retorna user (sem hash) e token JWT.
 * @param {{ email: string, password: string }} credenciais
 * @returns {Promise<{ user: object, token: string }>}
 * @throws {AppError} INVALID_CREDENTIALS se e-mail ou senha estiverem incorretos
 */
export async function loginUser({ email, password }) {
  // Busca o usuário pelo e-mail
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
  }

  // Compara a senha fornecida com o hash armazenado
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
  }

  // Gera token JWT
  const token = generateToken(user.id);

  // Retorna o usuário sem o hash da senha
  const { passwordHash: _hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

/**
 * Realiza logout adicionando o token à blacklist em memória com timestamp.
 * O token será automaticamente removido após o TTL expirar (24h).
 * @param {string} token - Token JWT a ser invalidado
 */
export function logoutUser(token) {
  tokenBlacklist.set(token, Date.now());
}

/**
 * Verifica se um token está na blacklist (foi invalidado por logout).
 * Remove automaticamente tokens expirados para evitar vazamento de memória.
 * @param {string} token - Token JWT
 * @returns {boolean} true se o token foi invalidado e ainda não expirou
 */
export function isTokenBlacklisted(token) {
  if (!tokenBlacklist.has(token)) return false;

  const insertedAt = tokenBlacklist.get(token);
  // Remove token expirado da blacklist (JWT já expirou, não precisa mais bloquear)
  if (Date.now() - insertedAt > BLACKLIST_TTL_MS) {
    tokenBlacklist.delete(token);
    return false;
  }

  return true;
}

/**
 * Remove tokens expirados da blacklist para liberar memória.
 * Executado periodicamente via setInterval.
 */
function purgeExpiredTokens() {
  const now = Date.now();
  for (const [token, insertedAt] of tokenBlacklist) {
    if (now - insertedAt > BLACKLIST_TTL_MS) {
      tokenBlacklist.delete(token);
    }
  }
}

// Purga tokens expirados a cada hora (desabilitado em ambiente de teste)
if (process.env.NODE_ENV !== 'test') {
  setInterval(purgeExpiredTokens, 60 * 60 * 1000);
}
