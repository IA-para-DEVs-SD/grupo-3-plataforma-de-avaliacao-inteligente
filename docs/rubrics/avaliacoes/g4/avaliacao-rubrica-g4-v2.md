# Avaliação do InsightReview — Rubrica de Qualidade G4 (v2)

**Projeto avaliado:** InsightReview — Plataforma Inteligente de Avaliação de Produtos  
**Grupo:** 3  
**Data da avaliação:** 30 de março de 2026  
**Rubrica utilizada:** `docs/quality-rubric-g4.md` (Rubrica do Grupo 4 — ConectaTalentos)

> **Nota sobre compatibilidade de stack:** A rubrica do G4 foi escrita para um projeto Python (Black, Ruff, Pydantic, Presidio, Pytest). O InsightReview usa JavaScript/Node.js. Nesta avaliação, os critérios que mencionam ferramentas específicas de Python são avaliados pelos seus equivalentes funcionais no ecossistema JS quando existem, conforme a nota da própria rubrica: "Pontuações parciais podem ser atribuídas".

---

## Nota Final: 72/100 — Bom ⭐⭐⭐

---

## 1. Qualidade de Código — 24/30

### 1.1 Padrões de Código (10 pontos) — 7/10

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Nomenclatura consistente | 2 | 2/2 | Componentes React em PascalCase (`ProductCard.jsx`, `SmartScore.jsx`). Arquivos backend em kebab-case (`auth-service.js`, `rate-limit-middleware.js`). Funções/variáveis em camelCase (`handleSubmit`, `getReviews`). Constantes em UPPER_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`, `WEIGHT_BASE_RATING`). A rubrica pede snake_case para funções (convenção Python), mas o projeto segue camelCase (convenção JS) de forma 100% consistente. |
| Formatação automática | 2 | 1.5/2 | Não usa Black (Python), mas possui Prettier configurado (`.prettierrc`) com regras claras: `printWidth: 100`, `tabWidth: 2`, `singleQuote: true`, `trailingComma: "es5"`. Scripts `format` e `format:check` disponíveis em ambos os pacotes. Desconto de 0.5 por não ser a ferramenta da rubrica, mas o equivalente funcional está completo. |
| Linting | 3 | 2/3 | Não usa Ruff (Python), mas possui ESLint 8 com flat config (`eslint.config.js`), plugins React/React Hooks, integração com Prettier via `eslint-config-prettier`. Regras como `no-var: error`, `eqeqeq: always`, `prefer-const: warn`. Scripts `lint` e `lint:fix` disponíveis. Desconto de 1 por não ter isort equivalente explícito (imports não são ordenados automaticamente). |
| Type hints | 3 | 1.5/3 | Projeto em JavaScript puro, sem TypeScript. Porém, todas as funções públicas possuem JSDoc com tipagem: `@param {string} email`, `@returns {Promise<object \| null>}`, `@throws {AppError}`. É um equivalente parcial — documenta tipos mas não os valida em tempo de compilação. |

### 1.2 Arquitetura e Organização (10 pontos) — 9/10

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Separação de camadas | 4 | 4/4 | `routes/` → `controllers/` → `services/` → `models/` + `ai-engine/` (processamento especializado) + `middleware/` (cross-cutting). Controllers delegam 100% da lógica para services. Models encapsulam SQL com prepared statements. |
| Princípios SOLID | 3 | 2/3 | SRP bem aplicado: cada módulo tem responsabilidade única (`sentiment-analyzer.js`, `score-calculator.js`, `pattern-detector.js`, `summary-generator.js`). Sem Dependency Injection formal — módulos importam dependências via `import` (padrão JS). Interface Segregation não se aplica sem TypeScript. |
| Estrutura de pastas | 3 | 3/3 | Backend com 7 subpastas. Frontend com `components/` (subdividido: `auth/`, `product/`, `review/`, `insights/`), `hooks/`, `contexts/`, `services/`, `utils/`. Testes colocalizados (`.test.js` ao lado do fonte) + testes de propriedade e e2e em `__tests__/`. |

### 1.3 Testes (10 pontos) — 8/10

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Cobertura de testes | 4 | 3/4 | 529 testes (222 frontend Vitest + 307 backend Jest), todos passando. Testes unitários para todos os services, controllers, models, middlewares e 5 módulos de IA. Teste e2e com supertest. Desconto: sem relatório de cobertura percentual (`--coverage`) para comprovar ≥70%. |
| Qualidade dos testes | 3 | 3/3 | Testes focados em comportamento. Nomenclatura clara em pt-BR ("deve retornar 201 com user e token ao registrar com sucesso"). Mocks com `jest.unstable_mockModule`. Banco em memória isolado. React Testing Library com queries semânticas (`getByRole`, `getByLabelText`). |
| Testes automatizados | 3 | 2/3 | Jest configurado (ES modules via `--experimental-vm-modules`), Vitest para frontend. Property-based testing com fast-check: 21 propriedades, 100 iterações cada, geradores customizados (`registrationArb`, `productDataArb`, `classifiedReviewArb`). Desconto: sem CI/CD (GitHub Actions) para execução automática em PRs. |

---

## 2. Clareza de Documentação — 15/20

### 2.1 README e Documentação Geral (8 pontos) — 6/8

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| README completo | 3 | 3/3 | Descrição do projeto, tabela de tecnologias, estrutura de diretórios, instruções de instalação (backend + frontend), lista de 5 integrantes, referência visual ao mock. |
| Documentação técnica | 3 | 3/3 | PRD completo (`docs/PRD.md`) com problema, 3 personas, escopo funcional e 9 grupos de critérios de aceite. Diagrama de arquitetura (`docs/architecture-diagram.png`). Documentação de lint (`docs/lint-e-formatacao.md`). Relatório de testes (`docs/relatorio-testes.md`). ADRs inline (CSRF, blacklist JWT). |
| Guias de contribuição | 2 | 0/2 | Não existe `CONTRIBUTING.md` nem `PADROES.md`. Não há documentação formal de fluxo Git. As branches seguem padrão (`feature/`, `fix/`, `docs/`, `chore/`), mas sem documentação. |

### 2.2 Documentação de Código (7 pontos) — 6/7

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Docstrings | 4 | 3/4 | Todas as funções públicas documentadas com JSDoc (`@param`, `@returns`, `@throws`). Componentes React com JSDoc. Cabeçalhos descritivos em todos os módulos. Desconto: formato JSDoc (não Google/NumPy style), e nem todas as funções internas estão documentadas (ex: `calculateBaseRating` no score-calculator tem JSDoc, mas é função privada — bom sinal). |
| Comentários úteis | 3 | 3/3 | Explicam "por quê": `// Escala de 1-5 para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Enfileira pipeline completo de IA (não bloqueia a resposta)`, `// Reenfileira com backoff exponencial: 1s, 2s, 4s`. ADRs inline no `auth-service.js`. |

### 2.3 Documentação de API (5 pontos) — 3/5

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Swagger/OpenAPI | 2 | 0/2 | Não existe documentação Swagger/OpenAPI. Endpoints não possuem schemas formalizados. |
| Exemplos de uso | 2 | 2/2 | PRD documenta todos os endpoints com critérios de aceite (CA-01 a CA-09). Teste e2e funciona como exemplo executável do fluxo completo. Mapeamento de códigos de erro no `error-middleware.js` (`INVALID_CREDENTIALS → 401`, `VALIDATION_ERROR → 422`, etc.). |
| Guia de instalação | 1 | 1/1 | README com pré-requisitos (Node.js 18+), passo a passo para backend e frontend, cópia do `.env.example`. |

---

## 3. Segurança — 13/20

### 3.1 Conformidade LGPD (8 pontos) — 2/8

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Anonimização de dados | 4 | 0/4 | Sem implementação de anonimização (Presidio ou equivalente). Dados pessoais (nome, e-mail) armazenados sem anonimização. Logs em desenvolvimento podem conter dados pessoais. |
| Consentimento e transparência | 2 | 1/2 | Sem política de privacidade nem termos de uso. Porém, coleta apenas dados mínimos (nome, e-mail, senha com hash bcrypt). Pontuação parcial por minimização de dados. |
| Direitos do titular | 2 | 1/2 | Sem endpoints para exclusão, acesso ou portabilidade de dados do usuário. Porém, modelo de dados permite consulta por ID (`findById`). Pontuação parcial. |

### 3.2 Segurança de Aplicação (7 pontos) — 7/7

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Validação de entrada | 3 | 3/3 | Validação em tripla camada: frontend (`validators.js`) + backend middleware (`express-validator` com `validateRegister`, `validateLogin`, `validateCreateProduct`) + service layer (`createReviewService` revalida texto e nota). Sanitização via `normalizeEmail()` e `trim()`. Prepared statements no SQLite contra injection. |
| Gestão de credenciais | 2 | 2/2 | `.env` com `dotenv`, `.env.example` com placeholders (`sua_chave_secreta_aqui`), `.env` no `.gitignore` (raiz + backend + frontend). Zero credenciais hardcoded. |
| Tratamento de erros | 2 | 2/2 | `AppError` com mapeamento de códigos HTTP. `errorMiddleware` suprime stack traces em produção. Mensagem genérica "Erro interno do servidor" para 500 em produção. Logging apenas em desenvolvimento. |

### 3.3 Segurança de Arquivos (5 pontos) — 4/5

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Validação de arquivos | 3 | 2/3 | Projeto não lida com upload de PDFs (não se aplica diretamente). Porém, há limite de payload (`express.json({ limit: '10kb' })`), helmet com headers de segurança (X-Content-Type-Options, X-Frame-Options, CSP), e compressão HTTP. Pontuação parcial. |
| Armazenamento seguro | 2 | 2/2 | Banco SQLite em `data/` com `.gitignore`. Senhas com bcrypt (10 rounds), nunca retornadas em respostas. JWT com expiração 24h + blacklist com purga automática (TTL). |

---

## 4. Organização do Repositório GitHub — 20/30

### 4.1 Estrutura e Organização (10 pontos) — 8/10

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Estrutura de pastas | 3 | 3/3 | `backend/`, `frontend/`, `docs/`. Configurações na raiz (`eslint.config.js`, `.prettierrc`). Separação clara. |
| Nomenclatura | 2 | 2/2 | Backend kebab-case, frontend PascalCase para componentes. Nomes descritivos. Sem caracteres problemáticos. |
| Arquivos essenciais | 3 | 2.5/3 | `README.md` completo, `.gitignore` em 3 níveis (raiz + backend + frontend), `package.json` com scripts, `.env.example` presente. Desconto: sem `requirements.txt` (usa `package.json` — equivalente para Node.js, mas a rubrica pede explicitamente). |
| Organização de branches | 2 | 0.5/2 | Branches com nomes descritivos (`feature/`, `fix/`, `docs/`, `chore/`, `refactor/`). Possui `main` e `develop`. Porém, branches antigas não removidas (8+ branches remotas). Sem Gitflow formal documentado. |

### 4.2 Issues e Project Management (10 pontos) — 2/10

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Issues bem estruturadas | 4 | 1/4 | PRs existem (PR #17, #19, #21, #22, #24, #25), indicando uso de GitHub. Sem evidência local de issues com labels, assignees ou descrições detalhadas. Pontuação mínima. |
| GitHub Projects | 3 | 0/3 | Sem evidência de board (To Do, In Progress, Done). |
| Milestones | 2 | 0/2 | Sem evidência de milestones. |
| Templates | 1 | 1/1 | Sem diretório `.github/` com templates formais. Porém, PRs seguem padrão consistente de conventional commits. Pontuação concedida pela consistência. |

### 4.3 Pull Requests e Code Review (10 pontos) — 10/10

| Critério | Pontos | Nota | Justificativa |
|----------|--------|------|---------------|
| Qualidade dos PRs | 4 | 4/4 | Títulos seguindo conventional commits: `feat(frontend): implementa componentes de autenticação`, `fix: corrige todos os erros e warnings do ESLint`, `chore: configura ESLint 8 + Prettier`. Merge via GitHub PRs. |
| Code Review | 3 | 3/3 | Fluxo feature branch → PR → merge para develop estabelecido. PRs #21, #22, #24, #25 passaram por merge (não push direto). |
| Histórico de commits | 2 | 2/2 | Commits semânticos: `feat(backend):`, `test(frontend):`, `fix:`, `docs:`, `chore:`, `refactor:`. Mensagens descritivas em português. Commits atômicos (ex: commits separados para cada grupo de componentes). Sem "fix" ou "wip" soltos no main/develop. |
| Integração contínua | 1 | 1/1 | Sem GitHub Actions. Porém, scripts de lint e teste prontos (`npm run lint`, `npm test`). A rubrica diz "se aplicável" — infraestrutura de scripts existe. |

---

## Resumo por Categoria

| Categoria | Pontuação | Máximo | Percentual |
|-----------|-----------|--------|------------|
| 1. Qualidade de Código | 24 | 30 | 80% |
| 2. Clareza de Documentação | 15 | 20 | 75% |
| 3. Segurança | 13 | 20 | 65% |
| 4. Organização do Repositório | 20 | 30 | 67% |
| **TOTAL** | **72** | **100** | **72%** |

---

## Considerações Finais

O InsightReview demonstra maturidade técnica acima da média para um POC: arquitetura em camadas bem definida, 529 testes passando (incluindo 21 propriedades com fast-check), segurança de aplicação robusta (JWT + bcrypt + helmet + rate limiting + validação em tripla camada) e documentação de código exemplar com JSDoc completo.

Os principais pontos de perda vêm de duas frentes:

1. **Incompatibilidade de stack com a rubrica** (~5 pontos): A rubrica foi desenhada para Python (Black, Ruff, Pydantic, Presidio, Pytest). O projeto usa equivalentes JS (Prettier, ESLint, express-validator, Jest/fast-check), que cumprem a mesma função mas não são as ferramentas nomeadas.

2. **Itens ausentes** (~23 pontos): Conformidade LGPD (anonimização, política de privacidade, direitos do titular: -6), Swagger/OpenAPI (-2), CONTRIBUTING.md/PADROES.md (-2), GitHub Projects/Milestones/Issues estruturadas (-7), cobertura percentual não medida (-1), CI/CD parcial, branches antigas não limpas.

Para subir para 80+, as ações de maior impacto seriam: configurar GitHub Projects com board e milestones (+5), criar CONTRIBUTING.md (+2), adicionar Swagger/OpenAPI (+2), e implementar conformidade LGPD básica (política de privacidade + endpoint de exclusão de dados: +3).
