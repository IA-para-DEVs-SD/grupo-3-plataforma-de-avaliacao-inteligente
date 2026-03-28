// Modelo de produto — operações CRUD na tabela products
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';

/**
 * Cria um novo produto no banco de dados.
 * Gera UUID automaticamente e retorna o produto criado.
 * @param {{ name: string, description: string, category: string, imageUrl?: string, createdBy: string }} dados do produto
 * @returns {Promise<{ id: string, name: string, description: string, category: string, imageUrl: string|null, createdBy: string, createdAt: string }>}
 */
export async function createProduct({ name, description, category, imageUrl = null, createdBy }) {
  const db = getDb();
  const id = uuidv4();

  const stmt = db.prepare(
    'INSERT INTO products (id, name, description, category, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, name, description, category, imageUrl, createdBy);

  // Retorna o produto recém-criado
  const product = db.prepare(
    `SELECT id, name, description, category, image_url AS imageUrl, created_by AS createdBy, created_at AS createdAt
     FROM products WHERE id = ?`
  ).get(id);

  return product;
}

/**
 * Busca um produto pelo ID.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  const db = getDb();

  const product = db.prepare(
    `SELECT id, name, description, category, image_url AS imageUrl, created_by AS createdBy, created_at AS createdAt
     FROM products WHERE id = ?`
  ).get(id);

  return product || null;
}

/**
 * Busca produtos por nome ou categoria (case-insensitive).
 * Se o termo for vazio ou nulo, retorna todos os produtos.
 * @param {string} [term] — termo de busca
 * @returns {Promise<Array<object>>}
 */
export async function search(term) {
  const db = getDb();

  if (!term || term.trim() === '') {
    return db.prepare(
      `SELECT id, name, description, category, image_url AS imageUrl, created_by AS createdBy, created_at AS createdAt
       FROM products ORDER BY created_at DESC`
    ).all();
  }

  const likeTerm = `%${term}%`;

  return db.prepare(
    `SELECT id, name, description, category, image_url AS imageUrl, created_by AS createdBy, created_at AS createdAt
     FROM products
     WHERE name LIKE ? OR category LIKE ?
     ORDER BY created_at DESC`
  ).all(likeTerm, likeTerm);
}
