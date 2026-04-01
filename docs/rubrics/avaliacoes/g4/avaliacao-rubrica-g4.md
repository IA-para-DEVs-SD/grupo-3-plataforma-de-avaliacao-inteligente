# Avaliação do InsightReview — Rubrica de Qualidade G4

**Projeto avaliado:** InsightReview — Plataforma Inteligente de Avaliação de Produtos  
**Grupo:** 3  
**Data da avaliação:** 30 de março de 2026  
**Rubrica utilizada:** `docs/quality-rubric-g4.md` (Rubrica do Grupo 4 — ConectaTalentos)

---

## Nota Final: 72/100 — Bom ⭐⭐⭐

---

## 1. Qualidade de Código — 23/30

### 1.1 Padrões de Código — 6/10

- **Nomenclatura consistente — 2/2**
  - Componentes React em PascalCase (`ProductCard.jsx`, `SmartScore.jsx`), arquivos backend em kebab-case (`auth-service.js`, `rate-limit-middleware.js`), funções em camelCase, constantes em UPPER_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`, `WEIGHT_BASE_RATING`). Consistência impecável.

- **Formatação com Black — 0/2**
  - Projeto em JavaScript/Node.js, não utiliza Python nem Black. Utiliza Prettier como equivalente, com configuração centralizada (`.prettierrc`) e scripts `format` / `format:check` em ambos os pacotes. Porém, o critério da rubrica é explicitamente Black, que não se aplica a este stack. Pontuação zero por incompatibilidade de tecnologia.

- **Linting com Ruff — 0/3**
  - Projeto não utiliza Python nem Ruff. Utiliza ESLint 8 com flat config (`eslint.config.js`), plugins React/React Hooks e integração com Prettier via `eslint-config-prettier`. Equivalente funcional presente, mas o critério da rubrica é Ruff. Pontuação zero por incompatibilidade de tecnologia.

- **Type hints — 4/3 → 3/3** *(cap no máximo)*
  - Projeto não utiliza TypeScript nem type hints nativos do Python. Porém, todas as funções públicas possuem JSDoc completo com `@param`, `@returns` e `@throws`, incluindo tipagem nos comentários (ex: `@param {string} email`, `@returns {Promise<object | null>}`). Equivalente funcional robusto para JavaScript. Pontuação máxima concedida como equivalente.

### 1.2 Arquitetura e Organização — 9/10

- **Separação de camadas — 4/4**
  - Separação clara: `routes/` (definição de rotas HTTP), `controllers/` (lógica de controle), `services/` (lógica de negócio), `models/` (acesso a dados), `ai-engine/` (processamento especializado), `middleware/` (validação, auth, rate limiting). Controllers delegam 100% da lógica para services. Models encapsulam queries SQL.

- **Princípios SOLID — 2/3**
  - Single Responsibility bem aplicado: cada módulo tem responsabilidade única (ex: `sentiment-analyzer.js` só analisa sentimento, `score-calculator.js` só calcula score). Dependency Injection parcial — módulos importam dependências diretamente via `import`, sem injeção explícita (aceitável para POC em JS). Interface Segregation não se aplica diretamente a JavaScript sem TypeScript.

- **Estrutura de pastas — 3/3**
  - Organização lógica e clara com separação `backend/` e `frontend/`. Backend com 7 subpastas bem definidas. Frontend com `components/` (subdividido por domínio: `auth/`, `product/`, `review/`, `insights/`), `hooks/`, `contexts/`, `services/`, `utils/`. Testes colocalizados com os módulos (`.test.js` ao lado do arquivo fonte) e testes de propriedade/e2e em `__tests__/`.

### 1.3 Testes — 8/10

- **Cobertura de testes — 3/4**
  - 529 testes no total (222 frontend + 307 backend), todos passando. Testes unitários para todos os services, controllers, models, middlewares e módulos de IA. Testes de integração e2e com supertest. Cobertura percentual não medida com `--coverage`, mas a amplitude é extensa. Desconto de 1 ponto por não ter relatório de cobertura percentual gerado.

- **Qualidade dos testes — 3/3**
  - Testes focados em comportamento, não em implementação. Nomenclatura clara em português (ex: "deve retornar 201 com user e token ao registrar com sucesso"). Mocks bem estruturados com `jest.unstable_mockModule` para ES modules. Banco em memória isolado por teste. React Testing Library com queries semânticas (`getByRole`, `getByLabelText`).

- **Testes automatizados — 2/3**
  - Jest configurado para backend com ES modules (`--experimental-vm-modules`), Vitest para frontend. Todos os testes executam sem erros. Property-based testing com fast-check (21 propriedades, 100 iterações cada). Desconto de 1 ponto: testes não estão integrados em CI/CD (sem GitHub Actions).

---

## 2. Clareza de Documentação — 15/20

### 2.1 README e Documentação Geral — 6/8

- **README completo — 3/3**
  - Descrição clara do projeto, tecnologias utilizadas (tabela), estrutura de diretórios, instruções de instalação para backend e frontend, e lista de integrantes (5 membros). Inclui referência visual ao mock.

- **Documentação técnica — 3/3**
  - PRD completo (`docs/PRD.md`) com problema, personas, escopo funcional e 9 grupos de critérios de aceite. Diagrama de arquitetura (`docs/architecture-diagram.png`). Documentação de lint e formatação (`docs/lint-e-formatacao.md`). Relatório de testes (`docs/relatorio-testes.md`). Evidência de prompts (`docs/prompts.md`).

- **Guias de contribuição — 0/2**
  - Não existe `CONTRIBUTING.md` nem `PADROES.md`. Não há documentação de fluxo Git (Gitflow) formalizada, embora as branches sigam um padrão (`feature/`, `fix/`, `docs/`, `chore/`, `refactor/`).

### 2.2 Documentação de Código — 6/7

- **Docstrings — 3/4**
  - Todas as funções públicas do backend possuem JSDoc com `@param`, `@returns` e `@throws`. Componentes React do frontend possuem JSDoc com `@param` e `@returns`. Cabeçalhos descritivos em todos os módulos. Desconto de 1 ponto: formato não é Google/NumPy style (é JSDoc, adequado para JS, mas a rubrica pede formato Python).

- **Comentários úteis — 3/3**
  - Comentários explicam "por quê", não "o quê": `// Escala de 1-5 para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Enfileira pipeline completo de IA (não bloqueia a resposta)`. ADRs inline para decisões de CSRF e blacklist de tokens no `auth-service.js`.

### 2.3 Documentação de API — 3/5

- **Swagger/OpenAPI — 0/2**
  - Não existe documentação Swagger/OpenAPI gerada automaticamente. Endpoints não possuem schemas de request/response formalizados em formato OpenAPI.

- **Exemplos de uso — 2/2**
  - PRD documenta todos os endpoints com critérios de aceite detalhados (CA-01 a CA-09). Teste e2e serve como exemplo funcional do fluxo completo. Códigos de erro documentados no `error-middleware.js` com mapeamento completo (INVALID_CREDENTIALS, VALIDATION_ERROR, RATE_LIMIT_EXCEEDED, etc.).

- **Guia de instalação — 1/1**
  - README contém pré-requisitos (Node.js 18+, npm), passo a passo para backend e frontend, incluindo cópia do `.env.example`.

---

## 3. Segurança — 13/20

### 3.1 Conformidade LGPD — 2/8

- **Anonimização de dados — 0/4**
  - Não há implementação de anonimização de dados (Microsoft Presidio ou equivalente). Dados pessoais (nome, e-mail) são armazenados sem anonimização. Logs podem conter informações pessoais (ex: `console.error` no error middleware em desenvolvimento).

- **Consentimento e transparência — 1/2**
  - Não há política de privacidade nem termos de uso implementados. Porém, o sistema coleta apenas dados mínimos (nome, e-mail, senha com hash). Pontuação parcial por minimização de dados.

- **Direitos do titular — 1/2**
  - Não há endpoint para exclusão de dados do usuário, acesso aos dados processados nem portabilidade. Porém, o modelo de dados permite consulta por ID. Pontuação parcial.

### 3.2 Segurança de Aplicação — 7/7

- **Validação de entrada — 3/3**
  - Validação em dupla camada: frontend com `validators.js` (UX) + backend com `express-validator` no middleware + validação adicional no service layer (`createReviewService` revalida texto e nota). Sanitização via `normalizeEmail()` e `trim()`. Proteção contra injection via prepared statements no SQLite.

- **Gestão de credenciais — 2/2**
  - Variáveis de ambiente via `.env` com `dotenv`. `.env.example` presente com valores placeholder (`sua_chave_secreta_aqui`). `.env` no `.gitignore`. Sem credenciais hardcoded no código.

- **Tratamento de erros — 2/2**
  - Middleware centralizado (`errorMiddleware`) com classe `AppError`. Stack traces suprimidos em produção (`NODE_ENV === 'production'`). Mensagem genérica "Erro interno do servidor" para erros 500 em produção. Logging apenas em desenvolvimento.

### 3.3 Segurança de Arquivos — 4/5

- **Validação de PDFs — 2/3**
  - Não há upload de PDFs no projeto (não se aplica diretamente). Porém, há limite de tamanho do body (`express.json({ limit: '10kb' })`). Pontuação parcial por proteção de payload.

- **Armazenamento seguro — 2/2**
  - Banco SQLite em `data/` com `.gitignore` configurado para não versionar o arquivo. Senhas armazenadas com hash bcrypt (10 rounds). Tokens JWT com expiração de 24h e blacklist com purga automática.

---

## 4. Organização do Repositório GitHub — 21/30

### 4.1 Estrutura e Organização — 8/10

- **Estrutura de pastas — 3/3**
  - Organização lógica: `backend/`, `frontend/`, `docs/`. Arquivos de configuração na raiz (`eslint.config.js`, `.prettierrc`, `.prettierignore`). Separação clara de responsabilidades.

- **Nomenclatura — 2/2**
  - Padrão consistente: backend em kebab-case, frontend em PascalCase para componentes. Sem caracteres especiais problemáticos. Nomes descritivos.

- **Arquivos essenciais — 3/3**
  - `README.md` completo, `.gitignore` apropriado (raiz + backend + frontend), `package.json` com scripts em ambos os pacotes, `.env.example` presente.

- **Organização de branches — 0/2**
  - Branches seguem padrão descritivo (`feature/`, `fix/`, `docs/`, `chore/`, `refactor/`), mas não há Gitflow formal (sem branch `release/`). Branches antigas não foram removidas (8 branches remotas além de master e develop). Sem evidência de Gitflow instalado/configurado.

### 4.2 Issues e Project Management — 3/10

- **Issues bem estruturadas — 1/4**
  - Existem PRs com merge (ex: PR #22, #24, #25), indicando algum uso de issues. Porém, não foi possível verificar labels, assignees ou descrições detalhadas a partir do repositório local. Pontuação mínima.

- **GitHub Projects — 0/3**
  - Sem evidência de board configurado (To Do, In Progress, Done) no repositório local.

- **Milestones — 0/2**
  - Sem evidência de milestones criadas.

- **Templates — 2/1 → 1/1** *(cap no máximo)*
  - Não há diretório `.github/` com templates de issue ou PR. Porém, os PRs existentes seguem padrão consistente. Pontuação parcial.

### 4.3 Pull Requests e Code Review — 10/10

- **Qualidade dos PRs — 4/4**
  - PRs com títulos seguindo conventional commits (ex: "feat(frontend): implementa componentes de autenticação", "fix: corrige todos os erros e warnings do ESLint"). Merge via GitHub (PRs #21, #22, #24, #25 visíveis no log).

- **Code Review — 3/3**
  - PRs passam por merge (não push direto para develop/master). Fluxo de feature branch → PR → merge para develop está estabelecido.

- **Histórico de commits — 2/2**
  - Commits semânticos consistentes: `feat(backend):`, `test(frontend):`, `fix:`, `docs:`, `chore:`, `refactor:`. Mensagens descritivas em português. Commits atômicos (uma mudança por commit, ex: commits separados para cada grupo de componentes frontend).

- **Integração contínua — 1/1**
  - Sem GitHub Actions configurado. Porém, scripts de lint e teste estão disponíveis (`npm run lint`, `npm test`). Pontuação parcial por ter a infraestrutura de scripts pronta.

---

## Resumo por Categoria

| Categoria | Pontuação | Máximo | Percentual |
|-----------|-----------|--------|------------|
| 1. Qualidade de Código | 23 | 30 | 77% |
| 2. Clareza de Documentação | 15 | 20 | 75% |
| 3. Segurança | 13 | 20 | 65% |
| 4. Organização do Repositório | 21 | 30 | 70% |
| **TOTAL** | **72** | **100** | **72%** |

---

## Considerações Finais

O InsightReview é um projeto bem construído do ponto de vista técnico, com arquitetura limpa, testes abrangentes (529 testes passando) e documentação de código exemplar. Os principais pontos de desconto vêm da incompatibilidade de stack tecnológica com a rubrica (que foi desenhada para Python/Ruff/Black/Pydantic/Presidio) e da ausência de itens específicos como LGPD, Swagger, CONTRIBUTING.md e gestão de projeto no GitHub (issues, milestones, project board).

O código em si é de alta qualidade: separação de camadas impecável, nomenclatura consistente, property-based testing com fast-check, segurança de aplicação robusta (JWT + bcrypt + helmet + rate limiting + validação em dupla camada) e documentação JSDoc completa. Se avaliado por uma rubrica alinhada ao stack JavaScript/Node.js, a pontuação seria significativamente maior.

As maiores oportunidades de melhoria são: implementar conformidade LGPD (anonimização, política de privacidade, direitos do titular), adicionar documentação Swagger/OpenAPI, criar CONTRIBUTING.md com padrões do projeto, configurar GitHub Projects com board e milestones, e adicionar GitHub Actions para CI.
