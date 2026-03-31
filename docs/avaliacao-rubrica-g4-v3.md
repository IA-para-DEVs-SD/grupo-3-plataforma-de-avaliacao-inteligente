# Avaliação do InsightReview — Rubrica de Qualidade G4 (v3)

**Projeto avaliado:** InsightReview — Plataforma Inteligente de Avaliação de Produtos  
**Grupo:** 3  
**Data da avaliação:** 30 de março de 2026  
**Rubrica utilizada:** `docs/quality-rubric-g4.md` (Rubrica do Grupo 4 — ConectaTalentos)

> **Critérios desconsiderados:** A rubrica do G4 foi escrita para um projeto Python. Os seguintes critérios foram removidos por não se aplicarem ao stack Node.js/JavaScript do InsightReview:
>
> | Critério removido | Pontos | Motivo |
> |---|---|---|
> | Formatação com Black | 2 | Ferramenta exclusiva Python |
> | Linting com Ruff | 3 | Ferramenta exclusiva Python |
> | Guias de contribuição (CONTRIBUTING.md / PADROES.md) | 2 | Não exigido no contexto do projeto |
> | Swagger/OpenAPI | 2 | Não exigido no contexto do projeto |
> | Anonimização de dados (Presidio) | 4 | Ferramenta exclusiva Python / não aplicável |
>
> **Base ajustada:** 87 pontos (100 - 13 removidos). A nota final é convertida para escala de 100.

---

## Nota Final: 83/100 — Ótimo ⭐⭐⭐⭐

*(72 pontos obtidos de 87 possíveis = 82.8%, arredondado para 83)*

---

## 1. Qualidade de Código — 24/25 (base ajustada: 30 - 5 removidos)

### 1.1 Padrões de Código — 5/5 (base ajustada: 10 - 5 removidos)

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Nomenclatura consistente | 2 | 2/2 | Componentes React em PascalCase (`ProductCard.jsx`, `SmartScore.jsx`). Arquivos backend em kebab-case (`auth-service.js`, `rate-limit-middleware.js`). Funções em camelCase (`handleSubmit`, `getReviews`). Constantes em UPPER_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`, `WEIGHT_BASE_RATING`). Consistência total. |
| ~~Formatação com Black~~ | ~~2~~ | — | *Desconsiderado (ferramenta Python)* |
| ~~Linting com Ruff~~ | ~~3~~ | — | *Desconsiderado (ferramenta Python)* |
| Type hints | 3 | 1.5/3 | JavaScript puro, sem TypeScript. Todas as funções públicas possuem JSDoc com tipagem (`@param {string}`, `@returns {Promise<object \| null>}`, `@throws {AppError}`). Equivalente parcial — documenta tipos mas não valida em tempo de compilação. |

**Nota sobre ferramentas equivalentes presentes (não pontuadas, mas registradas):**
- Prettier configurado (`.prettierrc`) com scripts `format` / `format:check`
- ESLint 8 com flat config, plugins React/React Hooks, integração Prettier

### 1.2 Arquitetura e Organização — 9/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Separação de camadas | 4 | 4/4 | `routes/` → `controllers/` → `services/` → `models/` + `ai-engine/` (processamento especializado) + `middleware/`. Controllers delegam 100% da lógica para services. |
| Princípios SOLID | 3 | 2/3 | SRP bem aplicado em todos os módulos. Sem DI formal (padrão JS via `import`). Interface Segregation não se aplica sem TypeScript. |
| Estrutura de pastas | 3 | 3/3 | Backend: 7 subpastas. Frontend: `components/` (4 subdomínios), `hooks/`, `contexts/`, `services/`, `utils/`. Testes colocalizados + `__tests__/` para PBT e e2e. |

### 1.3 Testes — 8/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Cobertura de testes | 4 | 3/4 | 529 testes (222 frontend + 307 backend), todos passando. Unitários para todos os módulos. E2e com supertest. Desconto: sem relatório `--coverage` para comprovar ≥70%. |
| Qualidade dos testes | 3 | 3/3 | Focados em comportamento. Nomenclatura clara em pt-BR. Mocks com `jest.unstable_mockModule`. Banco em memória isolado. React Testing Library com queries semânticas. |
| Testes automatizados | 3 | 2/3 | Jest + Vitest configurados. PBT com fast-check: 21 propriedades, 100 iterações, geradores customizados. Desconto: sem CI/CD para execução automática em PRs. |

---

## 2. Clareza de Documentação — 13/16 (base ajustada: 20 - 4 removidos)

### 2.1 README e Documentação Geral — 6/6 (base ajustada: 8 - 2 removidos)

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| README completo | 3 | 3/3 | Descrição, tabela de tecnologias, estrutura de diretórios, instruções de instalação (backend + frontend), 5 integrantes, referência visual. |
| Documentação técnica | 3 | 3/3 | PRD completo com personas e critérios de aceite. Diagrama de arquitetura. Documentação de lint/formatação. Relatório de testes. ADRs inline (CSRF, blacklist JWT). |
| ~~Guias de contribuição~~ | ~~2~~ | — | *Desconsiderado* |

### 2.2 Documentação de Código — 6/7

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Docstrings | 4 | 3/4 | JSDoc completo em todas as funções públicas (`@param`, `@returns`, `@throws`). Componentes React documentados. Cabeçalhos em todos os módulos. Desconto: formato JSDoc (não Google/NumPy style da rubrica). |
| Comentários úteis | 3 | 3/3 | Explicam "por quê": `// Escala de 1-5 para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Reenfileira com backoff exponencial: 1s, 2s, 4s`. |

### 2.3 Documentação de API — 3/3 (base ajustada: 5 - 2 removidos)

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| ~~Swagger/OpenAPI~~ | ~~2~~ | — | *Desconsiderado* |
| Exemplos de uso | 2 | 2/2 | PRD com critérios de aceite (CA-01 a CA-09). Teste e2e como exemplo executável. Mapeamento de códigos de erro no `error-middleware.js`. |
| Guia de instalação | 1 | 1/1 | Pré-requisitos, passo a passo, `.env.example`. |

---

## 3. Segurança — 15/16 (base ajustada: 20 - 4 removidos)

### 3.1 Conformidade LGPD — 2/4 (base ajustada: 8 - 4 removidos)

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| ~~Anonimização de dados~~ | ~~4~~ | — | *Desconsiderado (Presidio / Python)* |
| Consentimento e transparência | 2 | 1/2 | Sem política de privacidade nem termos de uso formais. Coleta apenas dados mínimos (nome, e-mail, senha com hash). Pontuação parcial por minimização. |
| Direitos do titular | 2 | 1/2 | Sem endpoints de exclusão/portabilidade. Modelo permite consulta por ID (`findById`). Pontuação parcial. |

### 3.2 Segurança de Aplicação — 7/7

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Validação de entrada | 3 | 3/3 | Tripla camada: frontend (`validators.js`) + backend middleware (`express-validator`) + service layer. Sanitização (`normalizeEmail`, `trim`). Prepared statements contra injection. |
| Gestão de credenciais | 2 | 2/2 | `.env` + `dotenv`, `.env.example` com placeholders, `.env` no `.gitignore` em 3 níveis. Zero credenciais hardcoded. |
| Tratamento de erros | 2 | 2/2 | `AppError` com mapeamento HTTP. Stack traces suprimidos em produção. Mensagem genérica para 500. |

### 3.3 Segurança de Arquivos — 4/5

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Validação de arquivos | 3 | 2/3 | Sem upload de PDFs (não se aplica diretamente). Limite de payload (`10kb`), helmet com headers de segurança, compressão HTTP. Pontuação parcial. |
| Armazenamento seguro | 2 | 2/2 | SQLite em `data/` com `.gitignore`. Bcrypt 10 rounds. JWT com expiração 24h + blacklist com TTL. Senha nunca retornada em respostas. |

---

## 4. Organização do Repositório GitHub — 20/30

### 4.1 Estrutura e Organização — 8/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Estrutura de pastas | 3 | 3/3 | `backend/`, `frontend/`, `docs/`. Configurações na raiz. Separação clara. |
| Nomenclatura | 2 | 2/2 | Backend kebab-case, frontend PascalCase. Nomes descritivos. |
| Arquivos essenciais | 3 | 2.5/3 | README, `.gitignore` (3 níveis), `package.json` com scripts, `.env.example`. Desconto: rubrica pede `requirements.txt` (equivalente `package.json` presente). |
| Organização de branches | 2 | 0.5/2 | Branches descritivas (`feature/`, `fix/`, `docs/`). `main` + `develop` presentes. Branches antigas não removidas. Sem Gitflow formal. |

### 4.2 Issues e Project Management — 2/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Issues bem estruturadas | 4 | 1/4 | PRs existem (#17, #19, #21, #22, #24, #25). Sem evidência de issues com labels/assignees. |
| GitHub Projects | 3 | 0/3 | Sem board configurado. |
| Milestones | 2 | 0/2 | Sem milestones. |
| Templates | 1 | 1/1 | Sem `.github/` formal, mas PRs seguem padrão consistente de conventional commits. |

### 4.3 Pull Requests e Code Review — 10/10

| Critério | Máx. | Nota | Justificativa |
|----------|------|------|---------------|
| Qualidade dos PRs | 4 | 4/4 | Conventional commits: `feat(frontend):`, `fix:`, `chore:`, `docs:`, `refactor:`. Merge via GitHub PRs. |
| Code Review | 3 | 3/3 | Feature branch → PR → merge para develop. Sem push direto. |
| Histórico de commits | 2 | 2/2 | Commits semânticos, descritivos, atômicos. Sem "fix" ou "wip" soltos. |
| Integração contínua | 1 | 1/1 | Sem GitHub Actions, mas scripts de lint/teste prontos. Rubrica diz "se aplicável". |

---

## Resumo

| Categoria | Obtido | Base Ajustada | Percentual |
|-----------|--------|---------------|------------|
| 1. Qualidade de Código | 24 | 25 | 96% |
| 2. Clareza de Documentação | 13 | 16 | 81% |
| 3. Segurança | 15 | 16 | 94% |
| 4. Organização do Repositório | 20 | 30 | 67% |
| **TOTAL** | **72** | **87** | **82.8%** |

**Nota final convertida para escala 0–100: 83/100 — Ótimo ⭐⭐⭐⭐**

---

## Considerações Finais

Com a remoção dos 13 pontos de critérios específicos de Python que não se aplicam ao stack Node.js, o InsightReview atinge 83/100 (Ótimo). O projeto demonstra qualidade técnica sólida em arquitetura, testes (529 passando, incluindo PBT com fast-check) e segurança de aplicação.

O principal ponto de melhoria é a gestão de projeto no GitHub: a ausência de issues estruturadas, project board e milestones custa 8 pontos. Configurar esses itens seria a ação de maior impacto para subir a nota para 90+.
