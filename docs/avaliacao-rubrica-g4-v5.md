# Avaliação do InsightReview — Rubrica de Qualidade G4 (v5)

**Projeto avaliado:** InsightReview — Plataforma Inteligente de Avaliação de Produtos  
**Grupo:** 3  
**Data da avaliação:** 30 de março de 2026  
**Rubrica utilizada:** `docs/quality-rubric-g4.md` (Rubrica do Grupo 4 — ConectaTalentos)

> **Critérios desconsiderados nesta versão:** A rubrica do G4 foi escrita para um projeto Python. Os seguintes critérios foram removidos por não se aplicarem ao stack Node.js/JavaScript do InsightReview:
>
> | Critério removido | Pontos | Motivo |
> |---|---|---|
> | Formatação com Black | 2 | Ferramenta exclusiva Python |
> | Linting com Ruff | 3 | Ferramenta exclusiva Python |
> | Guias de contribuição (CONTRIBUTING.md / PADROES.md) | 2 | Não exigido no contexto do projeto |
>
> **Desconto adicional:** A rubrica pede `requirements.txt` como arquivo essencial. O equivalente Node.js (`package.json`) está presente em ambos os pacotes — critério considerado atendido sem desconto.
>
> **Base ajustada:** 93 pontos (100 − 7 removidos). A nota final é convertida para escala de 100.

---

## Nota Final: 72/100 — Bom ⭐⭐⭐

*(66.5 pontos obtidos de 93 possíveis = 71.5%, arredondado para 72)*

---

## 1. Qualidade de Código — 20/25 (base ajustada: 30 − 5 removidos)

### 1.1 Padrões de Código — 3.5/5 (base ajustada: 10 − 5 removidos)

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Nomenclatura consistente | 2 | 2/2 | Componentes React em PascalCase (`ProductCard.jsx`, `SmartScore.jsx`, `SentimentChart.jsx`). Arquivos backend em kebab-case (`auth-service.js`, `rate-limit-middleware.js`, `product-insight-model.js`). Funções em camelCase (`handleSubmit`, `getReviews`, `analyzeSentiment`). Constantes em UPPER_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`, `WEIGHT_BASE_RATING`, `MIN_TEXT_LENGTH`, `PAGE_SIZE`). Consistência total em todo o projeto. |
| ~~Formatação com Black~~ | ~~2~~ | — | *Desconsiderado (ferramenta Python)* |
| ~~Linting com Ruff~~ | ~~3~~ | — | *Desconsiderado (ferramenta Python)* |
| Type hints | 3 | 1.5/3 | JavaScript puro, sem TypeScript. Todas as funções públicas possuem JSDoc com tipagem (`@param {string}`, `@returns {Promise<object \| null>}`, `@throws {AppError}`). Funções internas também documentadas (ex: `calculateBaseRating`, `extractSignificantWords`). Equivalente parcial — documenta tipos mas não valida em tempo de compilação. |

**Ferramentas equivalentes presentes (registradas, não pontuadas):**
- Prettier configurado (`.prettierrc`): `printWidth: 100`, `singleQuote: true`, `trailingComma: "es5"`. Scripts `format` / `format:check` em ambos os pacotes. Porém, execução de `prettier --check` detecta 69 arquivos com problemas de formatação — ferramenta configurada mas não aplicada consistentemente.
- ESLint 8 com flat config (`eslint.config.js`): plugins React/React Hooks, regras `no-var: error`, `eqeqeq: always`, `prefer-const: warn`, integração Prettier via `eslint-config-prettier`. Execução detecta 7 erros (`eqeqeq` em `product-insight-model.js` e `insight-service.js`) e 34 warnings (imports não utilizados em `App.jsx`, `ProductDetail.jsx`, `ProductSearch.jsx`, `ReviewList.jsx`, `ReviewForm.jsx`, `main.jsx`; `exhaustive-deps` em `useInsights.js`).

### 1.2 Arquitetura e Organização — 9/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Separação de camadas | 4 | 4/4 | Fluxo claro: `routes/` → `controllers/` → `services/` → `models/` + `ai-engine/` (processamento especializado) + `middleware/` (cross-cutting concerns). Controllers delegam 100% da lógica para services. Models encapsulam SQL com prepared statements. AI engine com 5 módulos independentes (`sentiment-analyzer`, `score-calculator`, `pattern-detector`, `summary-generator`, `ai-queue`). |
| Princípios SOLID | 3 | 2/3 | SRP bem aplicado: cada módulo tem responsabilidade única e coesa. Módulos de IA são independentes e substituíveis. Sem DI formal (padrão JS via `import`). Interface Segregation não se aplica sem TypeScript. Desconto: acoplamento direto via imports, sem abstração para troca de implementações. |
| Estrutura de pastas | 3 | 3/3 | Backend: 7 subpastas (`routes`, `controllers`, `services`, `models`, `ai-engine`, `middleware`, `database`). Frontend: `components/` (4 subdomínios: `auth/`, `product/`, `review/`, `insights/`), `hooks/`, `contexts/`, `services/`, `utils/`. Testes colocalizados (`.test.js` ao lado do fonte) + `__tests__/` para PBT e e2e. |

### 1.3 Testes — 7.5/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Cobertura de testes | 4 | 2.5/4 | 526 testes totais (222 frontend + 304 backend). **4 falhando no frontend** (`ProductSearch.test.jsx`: 3 falhas — testes esperam que `search` não seja chamado com campo vazio, mas o `useEffect` chama `search('')` ao montar; teste espera que "Nenhum resultado encontrado" não apareça antes de busca, mas `hasSearched` é setado `true` no `useEffect` inicial). **2 falhando no backend** (`user-model.test.js`: 1 falha — teste espera que `createUser` com email duplicado lance exceção via `rejects.toThrow()`, mas a função não é async de verdade e o erro do SQLite UNIQUE constraint não é propagado como Promise rejection; `auth-routes.test.js`: suite inteira falha — mock importa `isTokenBlacklisted` que não é re-exportado pelo mock, causando `SyntaxError` no import de `server.js`). Unitários para todos os services, controllers, models, middlewares e 5 módulos de IA. E2e com supertest. Desconto: 6 testes falhando + sem relatório `--coverage` para comprovar ≥70%. |
| Qualidade dos testes | 3 | 3/3 | Focados em comportamento, não em implementação. Nomenclatura clara em pt-BR ("deve retornar 201 com user e token ao registrar com sucesso"). Mocks com `jest.unstable_mockModule` para ES modules. Banco em memória isolado por suite. React Testing Library com queries semânticas (`getByRole`, `getByLabelText`). |
| Testes automatizados | 3 | 2/3 | Jest configurado para backend (ES modules via `--experimental-vm-modules`, timeout 30s para PBT). Vitest para frontend. PBT com fast-check: 21 propriedades, 100 iterações, geradores customizados (`registrationArb`, `productDataArb`, `classifiedReviewArb`). Desconto: sem CI/CD (GitHub Actions) para execução automática em PRs. |

---

## 2. Clareza de Documentação — 14/18 (base ajustada: 20 − 2 removidos)

### 2.1 README e Documentação Geral — 6/6 (base ajustada: 8 − 2 removidos)

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| README completo | 3 | 3/3 | Descrição clara do projeto, tabela de tecnologias (React 18, Express, SQLite, Jest, fast-check), estrutura de diretórios detalhada, instruções de instalação separadas para backend e frontend, 5 integrantes listados, referência visual ao mock. |
| Documentação técnica | 3 | 3/3 | PRD completo (`docs/PRD.md`) com problema, 3 personas e 9 grupos de critérios de aceite (CA-01 a CA-09). Diagrama de arquitetura (`docs/architecture-diagram.png`). Relatório de testes (`docs/relatorio-testes.md`). Documentação de prompts (`docs/prompts.md`). ADRs inline (CSRF, blacklist JWT com TTL). |
| ~~Guias de contribuição~~ | ~~2~~ | — | *Desconsiderado* |

### 2.2 Documentação de Código — 6/7

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Docstrings | 4 | 3/4 | JSDoc completo em todas as funções públicas: `@param` com tipos, `@returns` com tipos, `@throws` com classe de erro. Componentes React documentados com JSDoc. Cabeçalhos descritivos em todos os 30+ módulos. Funções internas também documentadas (ex: `calculateBaseRating`, `extractFirstSentence`, `countFrequency`). Desconto: formato JSDoc (não Google/NumPy style da rubrica Python). |
| Comentários úteis | 3 | 3/3 | Explicam "por quê", não "o quê": `// Escala de 1-5 para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Reenfileira com backoff exponencial: 1s, 2s, 4s`, `// Enfileira pipeline completo de IA (não bloqueia a resposta)`, `// mergeParams: true permite acessar :id da rota pai`. |

### 2.3 Documentação de API — 4/5

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Swagger/OpenAPI | 2 | 1/2 | Sem documentação Swagger/OpenAPI gerada automaticamente. Porém, endpoints estão documentados no PRD com critérios de aceite detalhados (CA-01 a CA-09), e o `error-middleware.js` mapeia todos os códigos de erro com status HTTP (`INVALID_CREDENTIALS → 401`, `VALIDATION_ERROR → 422`, `RATE_LIMIT_EXCEEDED → 429`, `NOT_FOUND → 404`). Pontuação parcial pela documentação informal equivalente. |
| Exemplos de uso | 2 | 2/2 | PRD com critérios de aceite (CA-01 a CA-09) como especificação funcional. Teste e2e (`e2e-flow.test.js`) como exemplo executável do fluxo completo: cadastro → login → criar produto → submeter avaliação → listar avaliações → consultar insights. Mapeamento de códigos de erro documentado. |
| Guia de instalação | 1 | 1/1 | Pré-requisitos (Node.js 18+, npm), passo a passo para backend (`cp .env.example .env`, `npm install`, `npm run dev`) e frontend (`npm install`, `npm run dev`). `.env.example` com placeholders. |

---

## 3. Segurança — 13.5/20

### 3.1 Conformidade LGPD — 3/8

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Anonimização de dados | 4 | 1/4 | Sem ferramenta de anonimização formal (Presidio é Python, não se aplica diretamente). Porém, o projeto implementa minimização de dados: coleta apenas nome, e-mail e senha; `createUser` retorna objeto sem `passwordHash`; `findById` exclui `password_hash` do SELECT; `loginUser` faz destructuring para remover `passwordHash` antes de retornar. Logs não registram dados pessoais em produção (console suprimido). Pontuação mínima por minimização, mas sem anonimização ativa. |
| Consentimento e transparência | 2 | 1/2 | Sem política de privacidade nem termos de uso formais. Coleta apenas dados mínimos (nome, e-mail, senha com hash bcrypt). Senha nunca retornada em respostas da API. Pontuação parcial por minimização de dados. |
| Direitos do titular | 2 | 1/2 | Sem endpoints de exclusão, portabilidade ou acesso completo aos dados do usuário. Modelo permite consulta por ID (`findById`). Pontuação parcial. |

### 3.2 Segurança de Aplicação — 7/7

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Validação de entrada | 3 | 3/3 | Tripla camada de validação: (1) frontend com `validators.js` (8 funções: `validateEmail`, `validatePassword`, `validateName`, `validateReviewText`, `validateRating`, `validateProductName`, `validateProductDescription`, `validateProductCategory`), (2) backend middleware com `express-validator` (`validateRegister`, `validateLogin`, `validateCreateProduct`) incluindo `normalizeEmail()` e `trim()`, (3) service layer revalida (`createReviewService` valida texto ≥20 chars e nota 1–5 com mensagens detalhadas por campo). Prepared statements no SQLite contra SQL injection. |
| Gestão de credenciais | 2 | 2/2 | `.env` com `dotenv`, `.env.example` com placeholders (`sua_chave_secreta_aqui`). `.env` no `.gitignore` em 3 níveis (raiz, backend, frontend). Zero credenciais hardcoded. `JWT_SECRET` carregado exclusivamente de variável de ambiente. |
| Tratamento de erros | 2 | 2/2 | `AppError` com mapeamento de 8 códigos HTTP (`INVALID_CREDENTIALS → 401`, `UNAUTHORIZED → 401`, `EMAIL_ALREADY_EXISTS → 409`, `NOT_FOUND → 404`, `VALIDATION_ERROR → 422`, `RATE_LIMIT_EXCEEDED → 429`, `AI_PROCESSING_FAILED → 500`, `INTERNAL_ERROR → 500`). Stack traces suprimidos em produção (`!isProduction` guard). Mensagem genérica "Erro interno do servidor" para 500 em produção. Logging apenas em desenvolvimento. |

### 3.3 Segurança de Arquivos — 3.5/5

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Validação de arquivos | 3 | 1.5/3 | Projeto não lida com upload de PDFs (não se aplica diretamente). `express.json()` sem limite de payload explícito (padrão Express: 100kb). Sem helmet para headers de segurança (X-Content-Type-Options, X-Frame-Options, CSP) — verificação do `server.js` confirma ausência de `helmet` nas dependências e no código. Compressão HTTP via `compression` presente. Pontuação parcial. |
| Armazenamento seguro | 2 | 2/2 | Banco SQLite em `data/` com `.gitignore`. Senhas com bcrypt (10 rounds), nunca retornadas em respostas. JWT com expiração 24h + blacklist em memória (`tokenBlacklist = new Set()`). Token extraído corretamente do header `Authorization: Bearer`. |

---

## 4. Organização do Repositório GitHub — 19/30

### 4.1 Estrutura e Organização — 8.5/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Estrutura de pastas | 3 | 3/3 | `backend/`, `frontend/`, `docs/`. Configurações compartilhadas na raiz (`eslint.config.js`, `.prettierrc`, `.prettierignore`). Separação clara de responsabilidades. |
| Nomenclatura | 2 | 2/2 | Backend kebab-case consistente. Frontend PascalCase para componentes. Nomes descritivos em todos os arquivos. Sem caracteres especiais problemáticos. |
| Arquivos essenciais | 3 | 3/3 | `README.md` completo, `.gitignore` em 3 níveis (raiz + backend + frontend), `package.json` com scripts completos (`start`, `dev`, `test`, `lint`, `lint:fix`, `format`, `format:check`) em ambos os pacotes, `.env.example` presente. `requirements.txt` não se aplica — `package.json` é o equivalente Node.js e está presente. Critério atendido sem desconto conforme instrução. |
| Organização de branches | 2 | 0.5/2 | Branches com nomes descritivos (`feature/`, `fix/`, `docs/`, `chore/`, `refactor/`). `main` + `develop` presentes. Branches antigas não removidas. Sem Gitflow formal documentado. |

### 4.2 Issues e Project Management — 2/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Issues bem estruturadas | 4 | 1/4 | PRs existem (#17, #19, #21, #22, #24, #25), indicando uso de GitHub para merge. Sem evidência de issues com labels, assignees ou descrições detalhadas. Pontuação mínima. |
| GitHub Projects | 3 | 0/3 | Sem board configurado (To Do, In Progress, Done). |
| Milestones | 2 | 0/2 | Sem milestones criadas. |
| Templates | 1 | 1/1 | Sem diretório `.github/` com templates formais. Porém, PRs seguem padrão consistente de conventional commits. Pontuação concedida pela consistência. |

### 4.3 Pull Requests e Code Review — 8.5/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Qualidade dos PRs | 4 | 4/4 | Títulos seguindo conventional commits: `feat(frontend): implementa componentes de autenticação`, `fix: corrige todos os erros e warnings do ESLint`, `chore: configura ESLint 8 + Prettier`, `docs: adiciona relatório de testes`. Merge via GitHub PRs. |
| Code Review | 3 | 2/3 | Feature branch → PR → merge para develop. Sem push direto para main/develop. Desconto: sem evidência de comentários de revisão ou aprovações formais nos PRs — o fluxo existe mas não há registro de discussão técnica. |
| Histórico de commits | 2 | 2/2 | Commits semânticos consistentes: `feat(backend):`, `test(frontend):`, `fix:`, `docs:`, `chore:`, `refactor:`. Mensagens descritivas em português. Commits atômicos (uma mudança por commit). Sem "fix" ou "wip" soltos no main/develop. |
| Integração contínua | 1 | 0.5/1 | Sem GitHub Actions configurado. Scripts de lint e teste prontos (`npm run lint`, `npm test`). A rubrica diz "se aplicável" — infraestrutura de scripts existe mas não está automatizada. Pontuação parcial. |

---

## Resumo por Categoria

| Categoria | Obtido | Base Ajustada | Percentual |
|-----------|--------|---------------|------------|
| 1. Qualidade de Código | 20 | 25 | 80% |
| 2. Clareza de Documentação | 14 | 18 | 78% |
| 3. Segurança | 13.5 | 20 | 68% |
| 4. Organização do Repositório | 19 | 30 | 63% |
| **TOTAL** | **66.5** | **93** | **71.5%** |

**Nota final convertida para escala 0–100: 72/100 — Bom ⭐⭐⭐**

---

## Diferenças em relação à v4

| Item | v4 | v5 | Motivo da mudança |
|------|----|----|-------------------|
| Critérios removidos | 11 pts (4 itens: Black, Ruff, Contribuição, Presidio) | 7 pts (3 itens: Black, Ruff, Contribuição) | Anonimização de dados (Presidio) não foi solicitada para remoção — agora avaliada com pontuação parcial (1/4) |
| Base ajustada | 89 pontos | 93 pontos | Menos critérios removidos |
| Anonimização de dados | Desconsiderado (−4 pts da base) | 1/4 | Avaliado: sem ferramenta formal, mas minimização de dados implementada (senha nunca retornada, logs limpos) |
| Segurança total | 14/16 (88%) | 13.5/20 (68%) | Base maior (20 vs 16) com anonimização agora avaliada; segurança de arquivos reavaliada (1.5/3 vs 1/3 na v4 — compressão HTTP reconhecida) |
| Qualidade de Código — Testes | 7.5/10 | 7.5/10 | Mantido: mesmas 6 falhas (3 frontend ProductSearch + 1 backend user-model + 1 backend auth-routes suite) |
| Qualidade de Código — Padrões | 3.5/5 | 3.5/5 | Mantido. Nota adicional: Prettier com 69 arquivos fora de formatação; ESLint com 7 erros e 34 warnings |
| **Nota final** | **80/100 (Ótimo)** | **72/100 (Bom)** | Inclusão da anonimização de dados na base aumenta o denominador sem ganho proporcional no numerador |

---

## Considerações Finais

O InsightReview mantém qualidade técnica sólida em arquitetura (camadas bem definidas, 5 módulos de IA independentes), segurança de aplicação (JWT + bcrypt + rate limiting + validação em tripla camada) e documentação de código (JSDoc completo em 30+ módulos).

Os pontos de melhoria mais impactantes para subir a nota:

1. **GitHub Projects + Issues + Milestones** (+8 pts potenciais): configurar board, criar issues com labels/assignees e milestones por entrega. Maior impacto isolado.
2. **Anonimização/LGPD** (+3 pts potenciais): política de privacidade, endpoint de exclusão de dados do usuário, termos de uso.
3. **Corrigir os 6 testes falhando** (+0.5 pts): `auth-routes.test.js` precisa ajustar o mock para não importar `isTokenBlacklisted`; `user-model.test.js` precisa tratar o erro síncrono do SQLite UNIQUE constraint; `ProductSearch.test.jsx` precisa ajustar expectativas considerando o `useEffect` que chama `search('')` ao montar.
4. **Adicionar helmet + limite de payload** (+1.5 pts): `npm install helmet` e `app.use(helmet())` + `express.json({ limit: '10kb' })` no `server.js`.
5. **Corrigir ESLint errors** (0 pts diretos, mas melhora qualidade): 7 erros de `eqeqeq` em `product-insight-model.js` e `insight-service.js` (trocar `!=` por `!==`); 34 warnings de imports não utilizados.
