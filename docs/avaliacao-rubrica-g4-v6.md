# Avaliação de Qualidade — InsightReview (Rubrica G4 v6)

Data da avaliação: 31/03/2026

---

## 1. Qualidade de Código — 27/30 ⭐ Excelente

O código segue consistentemente as convenções definidas no projeto.

### Checklist

- [x] Nomenclatura consistente (arquivos backend em kebab-case, componentes React em PascalCase)
- [x] Funções com responsabilidade única e tamanho razoável
- [x] Separação de camadas respeitada (rotas, controllers, services, models, middleware)
- [x] Constantes extraídas e nomeadas (ex: `MIN_TEXT_LENGTH`, `MAX_SCORE`, `WEIGHT_BASE_RATING`, `SALT_ROUNDS`, `PAGE_SIZE`, `MAX_RETRIES`)
- [x] Uso de async/await ao invés de callbacks
- [x] Desestruturação de props em componentes React
- [x] Handlers com prefixo `handle`, hooks com prefixo `use`

### Evidências positivas

- Separação de camadas impecável: `routes → controllers → services → models`, sem vazamento de lógica HTTP para camadas inferiores. Controllers delegam para services, services orquestram models e AI engine.
- Constantes bem nomeadas em UPPER_SNAKE_CASE: `WEIGHT_BASE_RATING`, `WEIGHT_SENTIMENT`, `WEIGHT_RECENCY`, `MIN_TEXT_LENGTH`, `MAX_RATING`, `SUMMARY_THRESHOLD`, `PATTERN_THRESHOLD`, `SCORE_THRESHOLD`, `MAX_PATTERNS`, `MIN_WORD_LENGTH`, `BASE_DELAY_MS`.
- Funções pequenas e focadas: `calculateBaseRating`, `calculateSentimentScore`, `calculateRecencyScore` no score-calculator; `extractSignificantWords`, `countFrequency`, `topTerms` no pattern-detector.
- Frontend usa functional components com hooks, desestruturação de props (`{ smartScore, simpleAverage }`, `{ product }`), handlers com prefixo `handle` (`handleSearch`, `handleLogout`, `handleSubmit`, `handleBlur`).
- Hook customizado `useAuth` com prefixo `use`, re-exportado de `hooks/useAuth.js` para conveniência de importação.
- Fila de processamento assíncrono (`ai-queue.js`) com backoff exponencial e retentativas — design pattern bem implementado.

### Pontos de melhoria (-3 pontos)

- Falta middleware de validação (`express-validator`) na rota de criação de avaliações (`POST /reviews`). A validação existe no service layer (`createReviewService`), mas a rota não aplica `validateCreateReview` como middleware, diferente das rotas de auth e product que usam `validateRegister`, `validateLogin` e `validateCreateProduct`.
- Duplicação do schema SQL de criação de tabelas: o mesmo `CREATE_TABLES_SQL` aparece em `connection.js`, `ai-engine.property.test.js`, `e2e-flow.test.js`, `product.property.test.js`, `review.property.test.js` e `auth.property.test.js`. Poderia ser extraído para um módulo compartilhado.
- Frontend usa estilos inline em todos os componentes. Aceitável para POC, mas não escala bem.

---

## 2. Clareza da Documentação — 19/20 ⭐ Excelente

Documentação consistente e de alta qualidade em todo o projeto.

### Checklist

- [x] Cabeçalho descritivo no topo de cada módulo (ex: `// Middleware de autenticação — verifica JWT e injeta req.user`)
- [x] JSDoc com `@param`, `@returns` e `@throws` nas funções exportadas
- [x] Comentários inline explicando decisões não óbvias (ex: `// Escala de 1-5 para 0-10`)
- [x] Referências a requisitos do design doc nos testes (ex: `**Validates: Requirements 4.3**`)
- [x] Documentação e mensagens de usuário em português brasileiro
- [x] Nomes de variáveis e funções autoexplicativos em inglês

### Evidências positivas

- Todos os módulos possuem cabeçalho descritivo: `// Analisador de sentimento heurístico baseado em palavras-chave (POC)`, `// Middleware centralizado de erros e classe AppError para erros estruturados`, `// Serviço de insights — orquestra o motor de IA e persiste resultados`, etc.
- JSDoc completo com `@param`, `@returns` e `@throws` em todas as funções exportadas do backend. Exemplos: `createReviewService`, `registerUser`, `loginUser`, `authMiddleware`, `calculateSmartScore`, `analyzeSentiment`.
- Comentários inline explicam o "porquê": `// Escala de 1-5 para 0-10`, `// diff varia de -1 a 1, escalar para 0-10`, `// Ajusta arredondamento para garantir soma = 100%`, `// Mensagem genérica — não revela se o e-mail ou a senha está incorreta (Requisito 1.3)`.
- Referências explícitas aos requisitos do design doc em todos os testes de propriedade: `**Validates: Requirements 1.1**` até `**Validates: Requirements 8.4**`.
- Mensagens de erro e validação em português brasileiro: `"Nome é obrigatório"`, `"Formato de e-mail inválido"`, `"Senha deve ter no mínimo 8 caracteres"`, `"Limite de requisições excedido"`.
- Frontend também documenta componentes com JSDoc no cabeçalho: `SmartScore`, `LoginForm`, `Header`, `ProductCard`.

### Pontos de melhoria (-1 ponto)

- Funções de validação no frontend (`validators.js`) têm JSDoc, mas os componentes React poderiam ter documentação mais detalhada das props (ex: `@param` para cada prop).

---

## 3. Segurança — 18/20 ⭐ Excelente

Implementação robusta de segurança em múltiplas camadas.

### Checklist

- [x] Validação com express-validator em todos os endpoints que recebem dados
- [x] Validação duplicada no service layer para segurança em profundidade (ex: `createReviewService` valida texto e nota)
- [x] Middleware de autenticação verifica token, blacklist e existência do usuário
- [x] Rate limiting diferenciado: endpoints autenticados (10/min por user) e IA (30/min por IP)
- [x] Classe `AppError` com mapeamento de códigos HTTP padronizado
- [x] Stack traces suprimidos em produção (`NODE_ENV === 'production'`)
- [x] Senhas com requisito mínimo de 8 caracteres
- [x] Emails normalizados antes de persistir

### Evidências positivas

- Validação em duas camadas: `express-validator` nos middlewares de rota (`validateRegister`, `validateLogin`, `validateCreateProduct`) + validação no service layer (`createReviewService` valida `text.trim().length < MIN_TEXT_LENGTH` e `rating` entre 1-5).
- `authMiddleware` verifica: (1) presença do header Authorization, (2) formato Bearer, (3) blacklist de tokens, (4) assinatura JWT, (5) existência do usuário no banco. Cadeia completa de verificação.
- Rate limiting diferenciado: `reviewRateLimit` = 10/min por `req.user.id`, `insightRateLimit` = 30/min por `req.ip`. Respostas de rate limit retornam erro estruturado com código `RATE_LIMIT_EXCEEDED`.
- `AppError` com mapeamento padronizado: `INVALID_CREDENTIALS → 401`, `EMAIL_ALREADY_EXISTS → 409`, `NOT_FOUND → 404`, `VALIDATION_ERROR → 422`, `RATE_LIMIT_EXCEEDED → 429`.
- Stack traces suprimidos em produção: `isProduction && statusCode === 500 && code === 'INTERNAL_ERROR'` retorna mensagem genérica.
- Bcrypt com 10 rounds para hash de senhas. Token JWT com expiração de 24h.
- Frontend valida campos inline (onBlur) e no submit, com mensagens em pt-BR. Interceptor axios remove token inválido e redireciona para login em caso de 401.
- `normalizeEmail()` aplicado no express-validator para registro e login.

### Pontos de melhoria (-2 pontos)

- A rota `POST /reviews` não aplica middleware de validação com `express-validator` (a validação ocorre apenas no service layer). Embora funcional, não segue o padrão das demais rotas que usam middleware de validação.
- A rota `POST /auth/logout` não usa `authMiddleware`, permitindo que qualquer requisição adicione tokens arbitrários à blacklist (impacto baixo em POC, mas é uma inconsistência).

---

## 4. Estratégia de Testes e Verificação de Propriedades — 28/30 ⭐ Excelente

Suíte de testes sofisticada com property-based testing, testes unitários e e2e.

### Checklist

- [x] Cada módulo possui arquivo de teste correspondente (`*.test.js` / `*.test.jsx`)
- [x] Testes de propriedade (P1–P24) validando invariantes com fast-check
- [x] Propriedades matemáticas verificadas: soma de percentuais = 100% (±0.1%), score ∈ [0.0, 10.0], média simples correta
- [x] Propriedades de threshold verificadas: resumo requer ≥5 avaliações, padrões requerem ≥10 avaliações
- [x] Teste e2e cobrindo fluxo completo: cadastro → login → produto → avaliação → insights
- [x] Banco em memória (better-sqlite3 `:memory:`) isolado por iteração de PBT
- [x] Testes de frontend com React Testing Library usando queries semânticas
- [x] Referências explícitas aos requisitos do design doc nos testes (ex: `Validates: Requirements 4.3`)
- [x] Cleanup adequado com `afterEach` / `afterAll` para evitar vazamento de estado

### Evidências positivas

- 24 propriedades testadas com fast-check (P1–P24), cobrindo:
  - Auth (P1–P5): round-trip de cadastro, login válido retorna JWT, login inválido rejeitado, e-mail duplicado rejeitado, logout invalida sessão.
  - Produtos (P6–P8): busca metamórfica, campos obrigatórios invariantes, round-trip de cadastro.
  - Avaliações (P9–P12): round-trip de criação, produto inexistente rejeitado, texto curto rejeitado, nota inválida rejeitada.
  - Motor de IA (P13–P18, P20–P21): sentimento classificado, distribuição soma 100%, resumo com threshold ≥5, insights atualizados, padrões com threshold ≥10, estrutura de padrões, score em [0,10], média simples correta.
  - Listagem (P22–P24): ordenação por data com paginação, filtro de sentimento preciso, ordenação por nota.
- Geradores customizados realistas: `productNameArb`, `emailArb`, `classifiedReviewArb`, `reviewForScoreArb`, `invalidRatingArb` (inclui zero, negativos, decimais, >5).
- Banco em memória isolado por iteração: cada iteração do PBT cria um `new Database(':memory:')` fresco com schema aplicado, e fecha no cleanup.
- Testes unitários para cada módulo: controllers, services, models, middleware, AI engine — todos com arquivo `.test.js` correspondente.
- Testes de frontend com React Testing Library usando queries semânticas: `getByLabelText`, `getByRole`, `getByText`, `queryByText`. Testes de acessibilidade verificam `aria-invalid`, `aria-label`, `role="alert"`.
- Teste e2e completo com supertest: cadastro → login → criar produto → submeter avaliação → listar avaliações → consultar insights. Usa banco em memória compartilhado para todo o fluxo.
- `numRuns: 100` para propriedades de funções puras, `numRuns: 50` para propriedades com banco de dados — balanceamento adequado entre cobertura e performance.
- Timeout de 30s configurado no Jest para acomodar testes de propriedade.

### Pontos de melhoria (-2 pontos)

- Propriedade P19 (mencionada na rubrica como parte de P13–P21) não está presente nos testes. A sequência pula de P18 para P20.
- Duplicação significativa do setup de banco em memória e schema SQL entre os 4 arquivos de teste de propriedade. Um módulo `test-helpers.js` compartilhado reduziria a duplicação.

---

## Resumo da Avaliação

| Critério | Pontuação | Nível |
|----------|-----------|-------|
| 1. Qualidade de Código | 27/30 | ⭐ Excelente |
| 2. Clareza da Documentação | 19/20 | ⭐ Excelente |
| 3. Segurança | 18/20 | ⭐ Excelente |
| 4. Estratégia de Testes | 28/30 | ⭐ Excelente |
| **Total** | **92/100** | **⭐ Excelente** |

### Conclusão

O projeto InsightReview demonstra maturidade técnica acima da média em todas as dimensões avaliadas. Os destaques são a estratégia de testes com 24 propriedades validadas via fast-check, a separação de camadas consistente no backend, e a documentação completa com JSDoc e referências aos requisitos. Os pontos de melhoria identificados são menores e não comprometem a qualidade geral — a ausência de middleware de validação na rota de reviews e a duplicação do schema SQL nos testes são os itens mais relevantes para correção futura.
