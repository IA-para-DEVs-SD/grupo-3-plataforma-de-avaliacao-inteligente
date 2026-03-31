// Testes de propriedade para produtos — fast-check + Jest
// Valida propriedades P6–P8 do design doc (Requisito 2)
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import fc from 'fast-check';

// --- Configuração do JWT_SECRET antes de qualquer import de serviço ---
process.env.JWT_SECRET = 'pbt-test-secret-key-for-product-properties';

// --- Helpers compartilhados para banco em memória ---
import { createFreshTestDb, insertTestUser } from './test-helpers.js';

// --- Banco em memória compartilhado por iteração ---
let currentTestDb = null;

// --- Mock do módulo de conexão para usar banco em memória ---
jest.unstable_mockModule('../database/connection.js', () => ({
  getDb: () => currentTestDb,
  closeDb: () => {
    if (currentTestDb) {
      currentTestDb.close();
      currentTestDb = null;
    }
  },
  getTestDb: () => createFreshTestDb(),
}));

// --- Importa módulos após o mock ---
const { createProduct, findById, search } = await import('../models/product-model.js');

// --- Geradores fast-check ---

// Gerador de nomes de produto (alfanuméricos com espaços, 1–40 chars)
const productNameArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,39}$/);

// Gerador de descrições de produto (texto não vazio, 5–100 chars)
const productDescriptionArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .,!]{4,99}$/);

// Gerador de categorias de produto
const productCategoryArb = fc.constantFrom(
  'Eletrônicos', 'Roupas', 'Livros', 'Casa', 'Esportes',
  'Alimentos', 'Brinquedos', 'Ferramentas', 'Saúde', 'Beleza'
);

// Gerador de URLs de imagem opcionais
const imageUrlArb = fc.oneof(
  fc.constant(null),
  fc.webUrl()
);

// Gerador de dados completos de produto (sem createdBy, que vem do usuário de teste)
const productDataArb = fc.record({
  name: productNameArb,
  description: productDescriptionArb,
  category: productCategoryArb,
  imageUrl: imageUrlArb,
});

// Gerador de termos de busca (1–10 chars alfanuméricos)
const searchTermArb = fc.stringMatching(/^[A-Za-z]{1,10}$/);

// --- Cleanup após cada teste ---
afterEach(() => {
  if (currentTestDb) {
    try { currentTestDb.close(); } catch { /* já fechado */ }
    currentTestDb = null;
  }
});


// Feature: smart-product-reviews, Property 6: busca retorna apenas produtos correspondentes ao termo (metamórfica)
// **Validates: Requirements 2.1**
describe('P6 — busca retorna apenas produtos correspondentes ao termo (metamórfica)', () => {
  it('para qualquer termo de busca, todos os resultados devem conter o termo no nome ou categoria (case-insensitive)', async () => {
    await fc.assert(
      fc.asyncProperty(searchTermArb, fc.array(productDataArb, { minLength: 1, maxLength: 8 }), async (term, productsData) => {
        // Cria banco fresco para cada iteração
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);

        // Cadastra todos os produtos gerados
        for (const data of productsData) {
          await createProduct({
            name: data.name,
            description: data.description,
            category: data.category,
            imageUrl: data.imageUrl,
            createdBy: userId,
          });
        }

        // Realiza busca pelo termo gerado
        const results = await search(term);
        const termLower = term.toLowerCase();

        // Verifica que todos os resultados contêm o termo no nome ou categoria
        for (const product of results) {
          const nameMatch = product.name.toLowerCase().includes(termLower);
          const categoryMatch = product.category.toLowerCase().includes(termLower);
          expect(nameMatch || categoryMatch).toBe(true);
        }

        // Verifica que nenhum produto correspondente foi omitido dos resultados
        const allProducts = currentTestDb.prepare(
          'SELECT id, name, category FROM products'
        ).all();

        const expectedIds = allProducts
          .filter(p =>
            p.name.toLowerCase().includes(termLower) ||
            p.category.toLowerCase().includes(termLower)
          )
          .map(p => p.id);

        const resultIds = results.map(r => r.id);
        expect(resultIds.sort()).toEqual(expectedIds.sort());

        // Cleanup do banco da iteração
        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smart-product-reviews, Property 7: detalhes do produto contêm todos os campos obrigatórios (invariante)
// **Validates: Requirements 2.2**
describe('P7 — detalhes do produto contêm todos os campos obrigatórios (invariante)', () => {
  it('para qualquer produto criado com dados válidos, findById deve retornar objeto com todos os campos obrigatórios não nulos', async () => {
    await fc.assert(
      fc.asyncProperty(productDataArb, async (data) => {
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);

        // Cria o produto
        const created = await createProduct({
          name: data.name,
          description: data.description,
          category: data.category,
          imageUrl: data.imageUrl,
          createdBy: userId,
        });

        // Busca pelo ID
        const found = await findById(created.id);

        // Verifica que o produto foi encontrado
        expect(found).not.toBeNull();

        // Verifica campos obrigatórios não nulos
        expect(found.id).toBeDefined();
        expect(found.id).not.toBeNull();
        expect(found.name).toBeDefined();
        expect(found.name).not.toBeNull();
        expect(found.description).toBeDefined();
        expect(found.description).not.toBeNull();
        expect(found.category).toBeDefined();
        expect(found.category).not.toBeNull();
        expect(found.createdBy).toBeDefined();
        expect(found.createdBy).not.toBeNull();
        expect(found.createdAt).toBeDefined();
        expect(found.createdAt).not.toBeNull();

        // imageUrl: se foi fornecido, deve estar presente; se null, pode ser null
        if (data.imageUrl !== null) {
          expect(found.imageUrl).toBe(data.imageUrl);
        }

        // Verifica que os valores correspondem aos dados de entrada
        expect(found.name).toBe(data.name);
        expect(found.description).toBe(data.description);
        expect(found.category).toBe(data.category);

        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smart-product-reviews, Property 8: produto cadastrado aparece na busca (round-trip)
// **Validates: Requirements 2.4**
describe('P8 — produto cadastrado aparece na busca (round-trip)', () => {
  it('para qualquer produto criado com dados válidos, buscar pelo nome exato deve retornar esse produto nos resultados', async () => {
    await fc.assert(
      fc.asyncProperty(productDataArb, async (data) => {
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);

        // Cria o produto
        const created = await createProduct({
          name: data.name,
          description: data.description,
          category: data.category,
          imageUrl: data.imageUrl,
          createdBy: userId,
        });

        // Busca pelo nome exato do produto
        const results = await search(created.name);

        // Verifica que o produto criado aparece nos resultados
        const found = results.find(p => p.id === created.id);
        expect(found).toBeDefined();
        expect(found.name).toBe(created.name);
        expect(found.category).toBe(created.category);

        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});
