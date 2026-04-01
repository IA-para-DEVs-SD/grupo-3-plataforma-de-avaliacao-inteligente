# Avaliação do InsightReview — Rubrica de Qualidade Interna

**Projeto avaliado:** InsightReview — Plataforma Inteligente de Avaliação de Produtos  
**Grupo:** 3  
**Data da avaliação:** 30 de março de 2026  
**Rubrica utilizada:** `docs/rubric.md` (Rubrica de Qualidade Interna do InsightReview)

---

## Nota Final: 92/100 — ⭐ Excelente

---

## 1. Qualidade de Código — 27/30 ⭐ Excelente

### Checklist

- [x] Nomenclatura consistente (arquivos backend em kebab-case, componentes React em PascalCase)
- [x] Funções com responsabilidade única e tamanho razoável
- [x] Separação de camadas respeitada (rotas, controllers, services, models, middleware)
- [x] Constantes extraídas e nomeadas (ex: `MIN_TEXT_LENGTH`, `MAX_SCORE`, `WEIGHT_BASE_RATING`)
- [x] Uso de async/await ao invés de callbacks
- [x] Desestruturação de props em componentes React
- [x] Handlers com prefixo `handle`, hooks com prefixo `use`

### Evidências Positivas

| Aspecto | Evidência |
|---------|-----------|
| Separação de camadas | Fluxo `routes → controllers → services → models` sem vazamento de responsabilidade. Controllers delegam 100% da lógica para services (ex: `review-controller.js` tem apenas 2 handlers enxutos que chamam `review-service.js`). |
| Nomenclatura | Backend em kebab-case (`auth-service.js`, `rate-limit-middleware.js`), frontend em PascalCase (`ProductDetail.jsx`, `SmartScore.jsx`), funções em camelCase, constantes em UPPER_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`, `WEIGHT_BASE_RATING`). |
| Responsabilidade única | `score-calculator.js` separa `calculateBaseRating`, `calculateSentimentScore` e `calculateRecencyScore` como funções internas, compondo no `calculateSmartScore` público. |
| Convenções React | Hooks com prefixo `use` (`useAuth`, `useProducts`, `useInsights`, `useReviews`), handlers com prefixo `handle` (`handleSubmit`, `handlePatternClick`, `handleFilterChange`). Desestruturação de props (`{ smartScore, simpleAverage }`, `{ onSubmit, loading: externalLoading }`). |
| Async/await | Toda a codebase usa async/await, zero callbacks. |
| Motor de IA modular | 5 módulos independentes: `sentiment-analyzer`, `score-calculator`, `pattern-detector`, `summary-generator`, `ai-queue`. |

### Pontos de Desconto (−3)

| Ponto | Impacto | Detalhe |
|-------|---------|---------|
| Estilos inline | −2 | Componentes React usam objetos JavaScript para estilos ao invés de CSS modules ou styled-components (conforme definido na stack tecnológica). Funcional para POC, mas não segue a convenção planejada. |
| Sem lazy loading | −1 | `App.jsx` importa todos os componentes estaticamente. Lazy loading de componentes pesados estava previsto na rubrica de performance. |

---

## 2. Clareza da Documentação — 19/20 ⭐ Excelente

### Checklist

- [x] Cabeçalho descritivo no topo de cada módulo (ex: `// Middleware de autenticação — verifica JWT e injeta req.user`)
- [x] JSDoc com `@param`, `@returns` e `@throws` nas funções exportadas
- [x] Comentários inline explicando decisões não óbvias (ex: `// Escala de 1-5 para 0-10`)
- [x] Referências a requisitos do design doc nos testes (ex: `**Validates: Requirements 4.3**`)
- [x] Documentação e mensagens de usuário em português brasileiro
- [x] Nomes de variáveis e funções autoexplicativos em inglês

### Evidências Positivas

| Aspecto | Evidência |
|---------|-----------|
| Cabeçalhos de módulo | Todo módulo possui cabeçalho descritivo: `// Serviço de avaliações — validação de dados e orquestração do model`, `// Fila de processamento assíncrono para o motor de IA`, `// Analisador de sentimento heurístico baseado em palavras-chave (POC)`. |
| JSDoc completo | `@param`, `@returns` e `@throws` em todas as funções exportadas do backend (ex: `createReviewService`, `authMiddleware`, `calculateSmartScore`, `analyzeSentiment`). |
| Comentários inline | Explicam decisões de design, não o óbvio: `// Escala de 1-5 para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Enfileira pipeline completo de IA (não bloqueia a resposta)`. |
| Rastreabilidade | Testes de propriedade referenciam requisitos do design doc: `**Validates: Requirements 1.1**`, `**Validates: Requirements 4.3**`. |
| Idioma consistente | Documentação e comentários em português brasileiro, código em inglês. |
| Componentes React | Documentados com JSDoc descrevendo propósito e props. |

### Pontos de Desconto (−1)

| Ponto | Impacto | Detalhe |
|-------|---------|---------|
| JSDoc parcial em componentes menores | −1 | Alguns componentes frontend menores poderiam ter JSDoc mais detalhado nas props (ex: `PatternTags`, `ReviewFilters` usam comentário de cabeçalho mas sem `@param` formal para cada prop). |

---

## 3. Segurança — 18/20 ⭐ Excelente

### Checklist

- [x] Validação com express-validator em todos os endpoints que recebem dados
- [x] Validação duplicada no service layer para segurança em profundidade (ex: `createReviewService` valida texto e nota)
- [x] Middleware de autenticação verifica token, blacklist e existência do usuário
- [x] Rate limiting diferenciado: endpoints autenticados (10/min por user) e IA (30/min por IP)
- [x] Classe `AppError` com mapeamento de códigos HTTP padronizado
- [x] Stack traces suprimidos em produção (`NODE_ENV === 'production'`)
- [x] Senhas com requisito mínimo de 8 caracteres
- [x] Emails normalizados antes de persistir

### Evidências Positivas

| Aspecto | Evidência |
|---------|-----------|
| Validação em dupla camada | Frontend com `validators.js` (UX) + backend com `express-validator` no middleware + validação adicional no service layer (`createReviewService` revalida texto e nota). |
| Autenticação JWT robusta | `auth-middleware.js` verifica header Bearer, checa blacklist de tokens, valida assinatura JWT e confirma existência do usuário no banco. |
| Rate limiting diferenciado | `reviewRateLimit` (10/min por `req.user.id`) e `insightRateLimit` (30/min por IP), com respostas estruturadas em formato padrão. |
| Tratamento de erros | Classe `AppError` com mapeamento de códigos HTTP (`UNAUTHORIZED → 401`, `VALIDATION_ERROR → 422`, `RATE_LIMIT_EXCEEDED → 429`). |
| Stack traces | `errorMiddleware` verifica `NODE_ENV === 'production'` e retorna mensagem genérica para erros 500. |
| Senhas | Hash bcrypt (10 rounds), senha nunca retornada na resposta (`{ passwordHash: _hash, ...userWithoutPassword }`). |
| Emails | Normalizados via `normalizeEmail()` do express-validator. |
| Frontend | Interceptor axios trata 401 removendo token e redirecionando para login. |
| Compressão | HTTP habilitada com `compression()` no server. |

### Pontos de Desconto (−2)

| Ponto | Impacto | Detalhe |
|-------|---------|---------|
| Blacklist em memória | −1 | Blacklist de tokens em memória (perde dados no restart do servidor). Aceitável para POC, mas não escalável. |
| Sem CSRF protection | −1 | Sem CSRF protection explícita. Mitigado parcialmente pelo uso de JWT em header, mas não documentado como decisão consciente. |

---

## 4. Estratégia de Testes e Verificação de Propriedades — 28/30 ⭐ Excelente

### Checklist

- [x] Cada módulo possui arquivo de teste correspondente (`*.test.js` / `*.test.jsx`)
- [x] Testes de propriedade (P13–P21) validando invariantes do motor de IA com fast-check
- [x] Propriedades matemáticas verificadas: soma de percentuais = 100% (±0.1%), score ∈ [0.0, 10.0], média simples correta
- [x] Propriedades de threshold verificadas: resumo requer ≥5 avaliações, padrões requerem ≥10 avaliações
- [x] Teste e2e cobrindo fluxo completo: cadastro → login → produto → avaliação → insights
- [x] Banco em memória (better-sqlite3 `:memory:`) isolado por iteração de PBT
- [x] Testes de frontend com React Testing Library usando queries semânticas
- [x] Referências explícitas aos requisitos do design doc nos testes (ex: `Validates: Requirements 4.3`)
- [x] Cleanup adequado com `afterEach` / `afterAll` para evitar vazamento de estado

### Evidências Positivas

| Aspecto | Evidência |
|---------|-----------|
| Property-based testing | fast-check cobrindo 4 domínios: autenticação (P1–P5), produtos (P6–P8), avaliações (P9–P12) e motor de IA (P13–P21). Total de 21 propriedades verificadas. |
| Invariantes matemáticos | Distribuição de sentimento soma 100% (±0.1%), score ∈ [0.0, 10.0], média simples correta, thresholds de 5 e 10 avaliações respeitados. |
| Geradores customizados | `registrationArb`, `productDataArb`, `classifiedReviewArb` com `fc.stringMatching`, `fc.constantFrom` e composição via `fc.record`/`fc.tuple`. |
| Banco isolado | `createFreshTestDb()` com `:memory:` e cleanup em `afterEach`. |
| Cobertura de módulos | 5 módulos de IA, 4 controllers, 4 services, 4 middlewares, 4 models — todos com arquivo `.test.js` correspondente. |
| Teste e2e | Fluxo completo com supertest: cadastro → login → produto → avaliação → listagem → insights, validando status codes e estrutura de resposta. |
| Frontend | React Testing Library com queries semânticas (`getByLabelText`, `getByRole`), simulação de interação com `userEvent`, verificação de acessibilidade (`aria-label`, `role="alert"`). |
| Rastreabilidade | Testes referenciam requisitos do design doc (`Validates: Requirements X.Y`). |
| Iterações | 100 iterações por propriedade nos PBTs (`numRuns: 100`), 50 para propriedades com banco mais pesado. |

### Pontos de Desconto (−2)

| Ponto | Impacto | Detalhe |
|-------|---------|---------|
| Schema SQL duplicado | −1 | Schema SQL duplicado entre `connection.js` e cada arquivo de teste de propriedade (4 cópias). Poderia ser extraído para um módulo compartilhado de test utils. |
| Sem testes de SLA | −1 | Sem testes de carga ou performance para validar os SLAs definidos (30s, 60s, 120s). Compreensível para POC, mas os SLAs estão documentados sem verificação automatizada. |

---

## Pontuação Final

| Critério | Pontuação | Nível |
|----------|-----------|-------|
| 1. Qualidade de Código | 27/30 | ⭐ Excelente |
| 2. Clareza da Documentação | 19/20 | ⭐ Excelente |
| 3. Segurança | 18/20 | ⭐ Excelente |
| 4. Estratégia de Testes | 28/30 | ⭐ Excelente |
| **TOTAL** | **92/100** | **⭐ Excelente** |

---

## Considerações Finais

O projeto InsightReview atinge nível Excelente em todos os 4 critérios da rubrica interna, com destaque especial para a estratégia de testes baseados em propriedades (28/30) e a qualidade de código (27/30).

Os pontos de melhoria identificados são menores e típicos de um POC:

1. **Estilos inline** (−2): migrar para CSS modules ou styled-components conforme definido na stack tecnológica.
2. **Lazy loading** (−1): implementar `React.lazy()` e `Suspense` para componentes pesados no `App.jsx`.
3. **JSDoc em componentes menores** (−1): adicionar `@param` formal nas props de `PatternTags`, `ReviewFilters` e similares.
4. **Blacklist JWT em memória** (−1): migrar para Redis ou persistir em banco para sobreviver a restarts.
5. **CSRF protection** (−1): documentar como ADR a decisão de usar JWT em header como mitigação, ou implementar proteção explícita.
6. **Schema SQL duplicado nos testes** (−1): extrair para módulo compartilhado `test-utils/db-schema.js`.
7. **Testes de SLA** (−1): adicionar testes de performance básicos para validar os SLAs documentados (30s, 60s, 120s).
