// Serviço de autenticação — hash de senha, JWT, registro, login e logout
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findByEmail } from '../models/user-model.js';
import { AppError } from '../middleware/error-middleware.js';

// Número de rounds para o salt do bcrypt
const SALT_ROUNDS = 10;

// Tempo de expiração do token JWT
const TOKEN_EXPIRATION = '24h';

// Blacklist de tokens (em memória — suficiente para POC)
const tokenBlacklist = new Set();

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
  const { passwordHash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

/**
 * Realiza logout adicionando o token à blacklist em memória.
 * @param {string} token - Token JWT a ser invalidado
 */
export function logoutUser(token) {
  tokenBlacklist.add(token);
}

/**
 * Verifica se um token está na blacklist (foi invalidado por logout).
 * @param {string} token - Token JWT
 * @returns {boolean} true se o token foi invalidado
 */
export function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}
