# Rubrica de Qualidade — InsightReview

Documento de avaliação de qualidade do projeto InsightReview, definindo critérios objetivos para medir e manter o padrão de excelência do código.

---

## 1. Qualidade de Código (0 a 30 pontos)

Avalia a legibilidade, manutenibilidade e aderência às convenções do projeto.

| Faixa | Nível | Descrição |
|-------|-------|-----------|
| 25–30 | ⭐ Excelente | Código segue todas as convenções (camelCase, kebab-case, PascalCase conforme contexto). Funções pequenas e com responsabilidade única. Separação clara entre camadas (controllers → services → models). Sem código duplicado. Constantes nomeadas em UPPER_SNAKE_CASE. |
| 18–24 | ✅ Bom | Código segue a maioria das convenções. Funções com escopo bem definido. Separação de camadas respeitada com raras exceções. Pouca duplicação. |
| 10–17 | ⚠️ Aceitável | Algumas violações de convenção. Funções ocasionalmente longas ou com múltiplas responsabilidades. Alguma duplicação de lógica entre camadas. |
| 0–9 | ❌ Insuficiente | Convenções ignoradas. Funções monolíticas. Lógica de negócio misturada com controle de fluxo HTTP. Duplicação significativa. |

### Checklist

- [ ] Nomenclatura consistente (arquivos backend em kebab-case, componentes React em PascalCase)
- [ ] Funções com responsabilidade única e tamanho razoável
- [ ] Separação de camadas respeitada (rotas, controllers, services, models, middleware)
- [ ] Constantes extraídas e nomeadas (ex: `MIN_TEXT_LENGTH`, `MAX_SCORE`, `WEIGHT_BASE_RATING`)
- [ ] Uso de async/await ao invés de callbacks
- [ ] Desestruturação de props em componentes React
- [ ] Handlers com prefixo `handle`, hooks com prefixo `use`

---

## 2. Clareza da Documentação (0 a 20 pontos)

Avalia a qualidade dos comentários, JSDoc e documentação auxiliar do projeto.

| Faixa | Nível | Descrição |
|-------|-------|-----------|
| 17–20 | ⭐ Excelente | Todos os módulos possuem comentário de cabeçalho explicando propósito. Funções públicas documentadas com JSDoc (parâmetros, retorno, exceções). Comentários inline explicam o "porquê", não o "o quê". Documentação em português brasileiro. |
| 12–16 | ✅ Bom | Maioria dos módulos e funções documentados. JSDoc presente nas funções principais. Comentários inline em pontos críticos. |
| 6–11 | ⚠️ Aceitável | Documentação parcial. Algumas funções sem JSDoc. Comentários esparsos ou redundantes com o código. |
| 0–5 | ❌ Insuficiente | Sem comentários de cabeçalho. Funções sem documentação. Ausência de JSDoc. Comentários em idioma inconsistente. |

### Checklist

- [ ] Cabeçalho descritivo no topo de cada módulo (ex: `// Middleware de autenticação — verifica JWT e injeta req.user`)
- [ ] JSDoc com `@param`, `@returns` e `@throws` nas funções exportadas
- [ ] Comentários inline explicando decisões não óbvias (ex: `// Escala de 1-5 para 0-10`)
- [ ] Referências a requisitos do design doc nos testes (ex: `**Validates: Requirements 4.3**`)
- [ ] Documentação e mensagens de usuário em português brasileiro
- [ ] Nomes de variáveis e funções autoexplicativos em inglês

---

## 3. Segurança (0 a 20 pontos)

Avalia as práticas de proteção contra vulnerabilidades e abuso.

| Faixa | Nível | Descrição |
|-------|-------|-----------|
| 17–20 | ⭐ Excelente | Validação de entrada em todas as camadas (frontend para UX, backend para segurança). Autenticação JWT com verificação de blacklist. Rate limiting diferenciado por tipo de endpoint. Erros estruturados sem exposição de stack traces em produção. Sanitização de dados antes do processamento. |
| 12–16 | ✅ Bom | Validação presente na maioria dos endpoints. Autenticação implementada. Rate limiting configurado. Erros tratados de forma centralizada. |
| 6–11 | ⚠️ Aceitável | Validação parcial. Autenticação básica sem blacklist. Rate limiting genérico. Alguns endpoints sem tratamento de erro adequado. |
| 0–5 | ❌ Insuficiente | Entradas não validadas. Sem autenticação ou autenticação frágil. Sem rate limiting. Stack traces expostos em produção. |

### Checklist

- [ ] Validação com express-validator em todos os endpoints que recebem dados
- [ ] Validação duplicada no service layer para segurança em profundidade (ex: `createReviewService` valida texto e nota)
- [ ] Middleware de autenticação verifica token, blacklist e existência do usuário
- [ ] Rate limiting diferenciado: endpoints autenticados (10/min por user) e IA (30/min por IP)
- [ ] Classe `AppError` com mapeamento de códigos HTTP padronizado
- [ ] Stack traces suprimidos em produção (`NODE_ENV === 'production'`)
- [ ] Senhas com requisito mínimo de 8 caracteres
- [ ] Emails normalizados antes de persistir

---

## 4. Estratégia de Testes e Verificação de Propriedades (0 a 30 pontos)

Avalia a abrangência, sofisticação e confiabilidade da suíte de testes. Este critério reflete o ponto mais forte do projeto: a adoção de testes baseados em propriedades (property-based testing) com fast-check para validar invariantes matemáticos e regras de negócio, indo além de testes tradicionais baseados em exemplos.

| Faixa | Nível | Descrição |
|-------|-------|-----------|
| 25–30 | ⭐ Excelente | Testes unitários para cada módulo. Testes de propriedade (PBT) validando invariantes matemáticos (ex: distribuição de sentimento soma 100%, score dentro de [0, 10]). Testes e2e cobrindo fluxo completo do usuário. Infraestrutura de teste com banco em memória isolado por iteração. Geradores customizados para dados realistas. |
| 18–24 | ✅ Bom | Testes unitários na maioria dos módulos. Alguns testes de propriedade para lógica crítica. Teste e2e do fluxo principal. Mocks bem organizados. |
| 10–17 | ⚠️ Aceitável | Testes unitários parciais. Sem testes de propriedade. Testes e2e básicos. Mocks inconsistentes ou frágeis. |
| 0–9 | ❌ Insuficiente | Cobertura de testes baixa. Sem testes de propriedade ou e2e. Testes frágeis ou dependentes de estado externo. |

### Checklist

- [ ] Cada módulo possui arquivo de teste correspondente (`*.test.js` / `*.test.jsx`)
- [ ] Testes de propriedade (P13–P21) validando invariantes do motor de IA com fast-check
- [ ] Propriedades matemáticas verificadas: soma de percentuais = 100% (±0.1%), score ∈ [0.0, 10.0], média simples correta
- [ ] Propriedades de threshold verificadas: resumo requer ≥5 avaliações, padrões requerem ≥10 avaliações
- [ ] Teste e2e cobrindo fluxo completo: cadastro → login → produto → avaliação → insights
- [ ] Banco em memória (better-sqlite3 `:memory:`) isolado por iteração de PBT
- [ ] Testes de frontend com React Testing Library usando queries semânticas
- [ ] Referências explícitas aos requisitos do design doc nos testes (ex: `Validates: Requirements 4.3`)
- [ ] Cleanup adequado com `afterEach` / `afterAll` para evitar vazamento de estado

---

## Como Usar Esta Rubrica

1. Antes de abrir um PR, revise o código contra os checklists de cada critério
2. Na code review, use os níveis (Excelente → Insuficiente) para classificar cada aspecto
3. Priorize correções de itens classificados como ❌ Insuficiente ou ⚠️ Aceitável
4. O objetivo mínimo para merge é ✅ Bom em todos os critérios

---

## Análise de Pontuação do Projeto InsightReview

Avaliação realizada com base na análise direta do código-fonte do projeto.

### 1. Qualidade de Código — 27/30 ⭐ Excelente

Evidências positivas:
- Separação de camadas impecável: `routes → controllers → services → models` sem vazamento de responsabilidade. Controllers delegam 100% da lógica para services (ex: `review-controller.js` tem apenas 2 handlers enxutos que chamam `review-service.js`).
- Nomenclatura consistente em todo o projeto: backend em kebab-case (`auth-service.js`, `rate-limit-middleware.js`), frontend em PascalCase (`ProductDetail.jsx`, `SmartScore.jsx`), funções em camelCase, constantes em UPPER_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`, `WEIGHT_BASE_RATING`).
- Funções com responsabilidade única: `score-calculator.js` separa `calculateBaseRating`, `calculateSentimentScore` e `calculateRecencyScore` como funções internas, compondo no `calculateSmartScore` público.
- Hooks com prefixo `use` (`useAuth`, `useProducts`, `useInsights`, `useReviews`), handlers com prefixo `handle` (`handleSubmit`, `handlePatternClick`, `handleFilterChange`).
- Desestruturação de props nos componentes (`{ smartScore, simpleAverage }`, `{ onSubmit, loading: externalLoading }`).
- Async/await em toda a codebase, zero callbacks.
- Motor de IA modular: 5 módulos independentes (`sentiment-analyzer`, `score-calculator`, `pattern-detector`, `summary-generator`, `ai-queue`).

Pontos de desconto (-3):
- Estilos inline em objetos JavaScript nos componentes React ao invés de CSS modules ou styled-components (conforme definido na stack tecnológica). Funcional para POC, mas não segue a convenção planejada.
- Ausência de lazy loading nos componentes React (`App.jsx` importa tudo estaticamente), item previsto na rubrica de performance.

### 2. Clareza da Documentação — 19/20 ⭐ Excelente

Evidências positivas:
- Todo módulo possui cabeçalho descritivo: `// Serviço de avaliações — validação de dados e orquestração do model`, `// Fila de processamento assíncrono para o motor de IA`, `// Analisador de sentimento heurístico baseado em palavras-chave (POC)`.
- JSDoc completo com `@param`, `@returns` e `@throws` em todas as funções exportadas do backend (ex: `createReviewService`, `authMiddleware`, `calculateSmartScore`, `analyzeSentiment`).
- Comentários inline explicam decisões de design, não o óbvio: `// Escala de 1-5 para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Enfileira pipeline completo de IA (não bloqueia a resposta)`.
- Testes de propriedade referenciam requisitos do design doc: `**Validates: Requirements 1.1**`, `**Validates: Requirements 4.3**`.
- Idioma consistente: documentação e comentários em português brasileiro, código em inglês.
- Componentes React documentados com JSDoc descrevendo propósito e props.

Ponto de desconto (-1):
- Alguns componentes frontend menores poderiam ter JSDoc mais detalhado nas props (ex: `PatternTags`, `ReviewFilters` usam comentário de cabeçalho mas sem `@param` formal para cada prop).

### 3. Segurança — 18/20 ⭐ Excelente

Evidências positivas:
- Validação em dupla camada: frontend com `validators.js` (UX) + backend com `express-validator` no middleware + validação adicional no service layer (`createReviewService` revalida texto e nota).
- Autenticação JWT robusta: `auth-middleware.js` verifica header Bearer, checa blacklist de tokens, valida assinatura JWT e confirma existência do usuário no banco.
- Rate limiting diferenciado: `reviewRateLimit` (10/min por `req.user.id`) e `insightRateLimit` (30/min por IP), com respostas estruturadas em formato padrão.
- Classe `AppError` com mapeamento de códigos HTTP (`UNAUTHORIZED → 401`, `VALIDATION_ERROR → 422`, `RATE_LIMIT_EXCEEDED → 429`).
- Stack traces suprimidos em produção: `errorMiddleware` verifica `NODE_ENV === 'production'` e retorna mensagem genérica para erros 500.
- Senhas com hash bcrypt (10 rounds) e senha nunca retornada na resposta (`{ passwordHash: _hash, ...userWithoutPassword }`).
- Emails normalizados via `normalizeEmail()` do express-validator.
- Interceptor axios no frontend trata 401 removendo token e redirecionando para login.
- Compressão HTTP habilitada com `compression()` no server.

Pontos de desconto (-2):
- Blacklist de tokens em memória (perde dados no restart do servidor). Aceitável para POC, mas não escalável.
- Sem CSRF protection explícita (mitigado parcialmente pelo uso de JWT em header, mas não documentado como decisão consciente).

### 4. Estratégia de Testes e Verificação de Propriedades — 28/30 ⭐ Excelente

Evidências positivas:
- Testes de propriedade (PBT) com fast-check cobrindo 4 domínios: autenticação (P1–P5), produtos (P6–P8), avaliações (P9–P12) e motor de IA (P13–P21). Total de 21 propriedades verificadas.
- Invariantes matemáticos validados: distribuição de sentimento soma 100% (±0.1%), score ∈ [0.0, 10.0], média simples correta, thresholds de 5 e 10 avaliações respeitados.
- Geradores customizados sofisticados: `registrationArb`, `productDataArb`, `classifiedReviewArb` com `fc.stringMatching`, `fc.constantFrom` e composição via `fc.record`/`fc.tuple`.
- Banco em memória isolado por iteração de PBT (`createFreshTestDb()` com `:memory:` e cleanup em `afterEach`).
- Testes unitários para cada módulo: 5 módulos de IA, 4 controllers, 4 services, 4 middlewares, 4 models — todos com arquivo `.test.js` correspondente.
- Teste e2e completo com supertest: fluxo cadastro → login → produto → avaliação → listagem → insights, validando status codes e estrutura de resposta.
- Frontend testado com React Testing Library: queries semânticas (`getByLabelText`, `getByRole`), simulação de interação com `userEvent`, verificação de acessibilidade (`aria-label`, `role="alert"`).
- Testes referenciam requisitos do design doc (`Validates: Requirements X.Y`), criando rastreabilidade entre código e especificação.
- 100 iterações por propriedade nos PBTs (`numRuns: 100`), 50 para propriedades com banco mais pesado.

Pontos de desconto (-2):
- Schema SQL duplicado entre `connection.js` e cada arquivo de teste de propriedade (4 cópias). Poderia ser extraído para um módulo compartilhado de test utils.
- Sem testes de carga ou performance para validar os SLAs definidos (30s, 60s, 120s). Compreensível para POC, mas os SLAs estão documentados sem verificação automatizada.

---

## Pontuação Final

| Critério | Pontuação | Nível |
|----------|-----------|-------|
| 1. Qualidade de Código | 27/30 | ⭐ Excelente |
| 2. Clareza da Documentação | 19/20 | ⭐ Excelente |
| 3. Segurança | 18/20 | ⭐ Excelente |
| 4. Estratégia de Testes | 28/30 | ⭐ Excelente |
| **TOTAL** | **92/100** | **⭐ Excelente** |

O projeto InsightReview atinge nível Excelente em todos os 4 critérios, com destaque especial para a estratégia de testes baseados em propriedades (28/30) e a qualidade de código (27/30). Os pontos de melhoria identificados são menores e típicos de um POC: estilos inline ao invés de CSS modules, blacklist JWT em memória, schema SQL duplicado nos testes e ausência de lazy loading.
