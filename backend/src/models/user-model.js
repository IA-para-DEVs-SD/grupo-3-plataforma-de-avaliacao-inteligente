// Modelo de usuário — operações CRUD na tabela users
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';

/**
 * Cria um novo usuário no banco de dados.
 * Gera UUID automaticamente e retorna o usuário criado (sem passwordHash).
 * @param {{ name: string, email: string, passwordHash: string }} dados do usuário
 * @returns {Promise<{ id: string, name: string, email: string, emailVerified: number, createdAt: string }>}
 */
export async function createUser({ name, email, passwordHash }) {
  const db = getDb();
  const id = uuidv4();

  const stmt = db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  );
  stmt.run(id, name, email, passwordHash);

  // Retorna o usuário recém-criado sem o hash da senha
  const user = db.prepare(
    'SELECT id, name, email, email_verified AS emailVerified, created_at AS createdAt FROM users WHERE id = ?'
  ).get(id);

  return user;
}

/**
 * Busca um usuário pelo e-mail.
 * Retorna o objeto completo (incluindo password_hash) para verificação de credenciais.
 * @param {string} email
 * @returns {Promise<object | null>}
 */
export async function findByEmail(email) {
  const db = getDb();

  const user = db.prepare(
    'SELECT id, name, email, password_hash AS passwordHash, email_verified AS emailVerified, created_at AS createdAt FROM users WHERE email = ?'
  ).get(email);

  return user || null;
}

/**
 * Busca um usuário pelo ID.
 * Retorna o objeto sem password_hash (uso em contextos autenticados).
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  const db = getDb();

  const user = db.prepare(
    'SELECT id, name, email, email_verified AS emailVerified, created_at AS createdAt FROM users WHERE id = ?'
  ).get(id);

  return user || null;
}
