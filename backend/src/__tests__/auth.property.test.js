// Testes de propriedade para autenticação — fast-check + Jest
// Valida propriedades P1–P5 do design doc (Requisito 1)
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import fc from 'fast-check';

// --- Configuração do JWT_SECRET antes de qualquer import de serviço ---
process.env.JWT_SECRET = 'pbt-test-secret-key-for-auth-properties';

// --- Helpers compartilhados para banco em memória ---
import { createFreshTestDb } from './test-helpers.js';

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
const { registerUser, loginUser, logoutUser, verifyToken, isTokenBlacklisted } =
  await import('../services/auth-service.js');
const { findByEmail } = await import('../models/user-model.js');

// --- Geradores fast-check ---

// Gerador de nomes não vazios (alfanuméricos com espaços, 1–30 chars)
const nameArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,29}$/);

// Gerador de e-mails válidos no formato user@domain.tld
const emailArb = fc.tuple(
  fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/),
  fc.stringMatching(/^[a-z][a-z0-9]{0,5}$/),
  fc.constantFrom('com', 'org', 'net', 'io')
).map(([user, domain, tld]) => `${user}@${domain}.${tld}`);

// Gerador de senhas válidas (mínimo 8 caracteres alfanuméricos)
const passwordArb = fc.stringMatching(/^[A-Za-z0-9]{8,20}$/);

// Gerador de dados de registro completos
const registrationArb = fc.tuple(nameArb, emailArb, passwordArb)
  .map(([name, email, password]) => ({ name, email, password }));

// --- Cleanup após cada teste ---
afterEach(() => {
  if (currentTestDb) {
    try { currentTestDb.close(); } catch { /* já fechado */ }
    currentTestDb = null;
  }
});

// Feature: smart-product-reviews, Property 1: cadastro válido cria conta (round-trip)
// **Validates: Requirements 1.1**
describe('P1 — cadastro válido cria conta (round-trip)', () => {
  it('para qualquer dado válido de registro, o usuário deve ser recuperável por e-mail', async () => {
    await fc.assert(
      fc.asyncProperty(registrationArb, async ({ name, email, password }) => {
        // Cria banco fresco para cada iteração
        currentTestDb = createFreshTestDb();

        const result = await registerUser({ name, email, password });

        // Verifica que o registro retornou user e token
        expect(result.user).toBeDefined();
        expect(result.token).toBeDefined();

        // Verifica round-trip: buscar por e-mail retorna o mesmo usuário
        const found = await findByEmail(email);
        expect(found).not.toBeNull();
        expect(found.name).toBe(name);
        expect(found.email).toBe(email);

        // Cleanup do banco da iteração
        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smart-product-reviews, Property 2: login válido retorna token (round-trip)
// **Validates: Requirements 1.2**
describe('P2 — login válido retorna token (round-trip)', () => {
  it('para qualquer usuário cadastrado, login com credenciais corretas retorna JWT válido', async () => {
    await fc.assert(
      fc.asyncProperty(registrationArb, async ({ name, email, password }) => {
        currentTestDb = createFreshTestDb();

        // Registra o usuário
        await registerUser({ name, email, password });

        // Login com as mesmas credenciais
        const loginResult = await loginUser({ email, password });

        // Deve retornar token
        expect(loginResult.token).toBeDefined();
        expect(typeof loginResult.token).toBe('string');

        // Token deve ser verificável
        const payload = verifyToken(loginResult.token);
        expect(payload.userId).toBeDefined();

        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smart-product-reviews, Property 3: login inválido é rejeitado (error condition)
// **Validates: Requirements 1.3**
describe('P3 — login inválido é rejeitado (error condition)', () => {
  it('para qualquer par e-mail/senha sem usuário cadastrado, login deve rejeitar com INVALID_CREDENTIALS', async () => {
    await fc.assert(
      fc.asyncProperty(emailArb, passwordArb, async (email, password) => {
        currentTestDb = createFreshTestDb();

        // Tenta login sem nenhum usuário cadastrado — deve lançar erro
        try {
          await loginUser({ email, password });
          // Se não lançou erro, o teste falha
          throw new Error('Deveria ter lançado erro');
        } catch (err) {
          if (err.message === 'Deveria ter lançado erro') throw err;
          expect(err.code).toBe('INVALID_CREDENTIALS');
        }

        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smart-product-reviews, Property 4: e-mail duplicado rejeitado (idempotência)
// **Validates: Requirements 1.4**
describe('P4 — e-mail duplicado rejeitado (idempotência)', () => {
  it('para qualquer e-mail já cadastrado, segundo registro deve rejeitar com EMAIL_ALREADY_EXISTS', async () => {
    await fc.assert(
      fc.asyncProperty(registrationArb, nameArb, passwordArb, async (first, secondName, secondPassword) => {
        currentTestDb = createFreshTestDb();

        // Primeiro registro deve funcionar
        await registerUser(first);

        // Segundo registro com mesmo e-mail deve falhar
        try {
          await registerUser({ name: secondName, email: first.email, password: secondPassword });
          throw new Error('Deveria ter lançado erro');
        } catch (err) {
          if (err.message === 'Deveria ter lançado erro') throw err;
          expect(err.code).toBe('EMAIL_ALREADY_EXISTS');
        }

        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smart-product-reviews, Property 5: logout invalida sessão (round-trip)
// **Validates: Requirements 1.5**
describe('P5 — logout invalida sessão (round-trip)', () => {
  it('para qualquer token JWT válido, após logout o token deve estar na blacklist', async () => {
    await fc.assert(
      fc.asyncProperty(registrationArb, async ({ name, email, password }) => {
        currentTestDb = createFreshTestDb();

        // Registra e obtém token
        const { token } = await registerUser({ name, email, password });

        // Token não deve estar na blacklist antes do logout
        expect(isTokenBlacklisted(token)).toBe(false);

        // Realiza logout
        logoutUser(token);

        // Token deve estar na blacklist após logout
        expect(isTokenBlacklisted(token)).toBe(true);

        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});
