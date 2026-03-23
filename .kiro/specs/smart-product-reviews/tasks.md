# Tasks: InsightReview — Smart Product Reviews

## Estratégia de Implementação

As tasks estão organizadas em **features independentes e progressivas**. Cada feature entrega valor funcional completo (backend + frontend) antes de avançar para a próxima. A ordem respeita dependências: infraestrutura → autenticação → produtos → avaliações → IA.

---

## Feature 1: Infraestrutura e Configuração Base

Configuração inicial dos dois projetos, banco de dados, middleware de erros e estrutura de pastas.

- [ ] 1.1 Inicializar projeto backend com Node.js/Express
  - [ ] 1.1.1 Criar `backend/package.json` com dependências: express, better-sqlite3, bcryptjs, jsonwebtoken, express-validator, express-rate-limit, cors, dotenv
  - [ ] 1.1.2 Criar `backend/src/server.js` com configuração Express (cors, json parser, compressão gzip)
  - [ ] 1.1.3 Criar `backend/src/middleware/error-middleware.js` com handler centralizado de erros (formato `{ error: { code, message, details } }`)
  - [ ] 1.1.4 Criar `backend/src/database/connection.js` com inicialização SQLite e criação das tabelas (users, products, reviews, product_insights)
  - [ ] 1.1.5 Criar `backend/.env.example` com variáveis: PORT, JWT_SECRET, NODE_ENV, DB_PATH

- [ ] 1.2 Inicializar projeto frontend com React
  - [ ] 1.2.1 Criar `frontend/package.json` com dependências: react, react-dom, react-router-dom, axios
  - [ ] 1.2.2 Criar `frontend/src/App.jsx` com estrutura de rotas (react-router-dom): `/`, `/login`, `/register`, `/products/:id`
  - [ ] 1.2.3 Criar `frontend/src/services/api.js` com instância axios configurada (baseURL, interceptor de token JWT no header)
  - [ ] 1.2.4 Criar `frontend/src/utils/validators.js` com funções de validação reutilizáveis (email, senha, texto mínimo, nota)

- [ ] 1.3 Configurar testes
  - [ ] 1.3.1 Instalar e configurar Jest no backend com suporte a ES modules
  - [ ] 1.3.2 Instalar fast-check no backend para testes de propriedade
  - [ ] 1.3.3 Instalar e configurar React Testing Library no frontend

---

## Feature 2: Cadastro e Autenticação de Usuários

Registro, login, logout e proteção de rotas via JWT. Cobre o Requisito 1.

- [ ] 2.1 Backend — Autenticação
  - [ ] 2.1.1 Criar `backend/src/models/user-model.js` com funções: `createUser`, `findByEmail`, `findById`
  - [ ] 2.1.2 Criar `backend/src/services/auth-service.js` com lógica: hash de senha (bcryptjs), geração de JWT, verificação de credenciais
  - [ ] 2.1.3 Criar `backend/src/controllers/auth-controller.js` com handlers: `register`, `login`, `logout`
  - [ ] 2.1.4 Criar `backend/src/routes/auth-routes.js` com rotas: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
  - [ ] 2.1.5 Criar `backend/src/middleware/auth-middleware.js` para verificar JWT e injetar `req.user`
  - [ ] 2.1.6 Criar `backend/src/middleware/validation-middleware.js` com schemas de validação para registro (nome, email, senha ≥ 8 chars) e login

- [ ] 2.2 Frontend — Autenticação
  - [ ] 2.2.1 Criar `frontend/src/contexts/AuthContext.jsx` com estado de usuário autenticado, funções `login`, `logout`, `register`
  - [ ] 2.2.2 Criar `frontend/src/services/auth-service.js` com chamadas à API: `register`, `login`, `logout`
  - [ ] 2.2.3 Criar `frontend/src/hooks/useAuth.js` consumindo AuthContext
  - [ ] 2.2.4 Criar `frontend/src/components/auth/RegisterForm.jsx` com campos nome, e-mail, senha e validação inline
  - [ ] 2.2.5 Criar `frontend/src/components/auth/LoginForm.jsx` com campos e-mail, senha, mensagem de erro e redirecionamento pós-login
  - [ ] 2.2.6 Criar componente `PrivateRoute` para proteger rotas que exigem autenticação

- [ ] 2.3 Testes — Autenticação
  - [ ] 2.3.1 Escrever testes unitários para `auth-service.js`: hash de senha, geração/verificação de JWT
  - [ ] 2.3.2 Escrever testes de integração para `POST /api/auth/register` e `POST /api/auth/login`
  - [ ] 2.3.3 Escrever teste de propriedade P1 (cadastro válido cria conta) — `auth.property.test.js`
  - [ ] 2.3.4 Escrever teste de propriedade P2 (login válido retorna token) — `auth.property.test.js`
  - [ ] 2.3.5 Escrever teste de propriedade P3 (login inválido é rejeitado) — `auth.property.test.js`
  - [ ] 2.3.6 Escrever teste de propriedade P4 (e-mail duplicado rejeitado) — `auth.property.test.js`
  - [ ] 2.3.7 Escrever teste de propriedade P5 (logout invalida sessão) — `auth.property.test.js`

---

## Feature 3: Cadastro e Busca de Produtos

CRUD de produtos e busca por nome/categoria. Cobre o Requisito 2.

- [ ] 3.1 Backend — Produtos
  - [ ] 3.1.1 Criar `backend/src/models/product-model.js` com funções: `createProduct`, `findById`, `search` (por nome/categoria, case-insensitive)
  - [ ] 3.1.2 Criar `backend/src/services/product-service.js` com lógica de negócio: validação de dados, orquestração de model
  - [ ] 3.1.3 Criar `backend/src/controllers/product-controller.js` com handlers: `searchProducts`, `getProductById`, `createProduct`
  - [ ] 3.1.4 Criar `backend/src/routes/product-routes.js` com rotas: `GET /api/products`, `GET /api/products/:id`, `POST /api/products` (autenticado)
  - [ ] 3.1.5 Adicionar validação de entrada para criação de produto (nome, descrição, categoria obrigatórios)

- [ ] 3.2 Frontend — Produtos
  - [ ] 3.2.1 Criar `frontend/src/services/product-service.js` com chamadas à API: `searchProducts`, `getProduct`, `createProduct`
  - [ ] 3.2.2 Criar `frontend/src/hooks/useProducts.js` com estado de busca, loading e erro
  - [ ] 3.2.3 Criar `frontend/src/components/product/ProductSearch.jsx` com campo de busca e lista de resultados
  - [ ] 3.2.4 Criar `frontend/src/components/product/ProductCard.jsx` exibindo nome, categoria e imagem
  - [ ] 3.2.5 Criar `frontend/src/components/product/ProductDetail.jsx` exibindo todos os campos do produto
  - [ ] 3.2.6 Implementar mensagem "nenhum resultado encontrado" quando busca retorna vazio

- [ ] 3.3 Testes — Produtos
  - [ ] 3.3.1 Escrever testes unitários para `product-service.js` e `product-model.js`
  - [ ] 3.3.2 Escrever testes de integração para `GET /api/products` e `POST /api/products`
  - [ ] 3.3.3 Escrever teste de propriedade P6 (busca retorna apenas correspondentes) — `product.property.test.js`
  - [ ] 3.3.4 Escrever teste de propriedade P7 (detalhes têm campos obrigatórios) — `product.property.test.js`
  - [ ] 3.3.5 Escrever teste de propriedade P8 (produto cadastrado aparece na busca) — `product.property.test.js`

---

## Feature 4: Submissão e Listagem de Avaliações

Criação, listagem, filtragem e ordenação de avaliações. Cobre os Requisitos 3 e 8.

- [ ] 4.1 Backend — Avaliações
  - [ ] 4.1.1 Criar `backend/src/models/review-model.js` com funções: `createReview`, `findByProductId` (com filtro de sentimento, ordenação, paginação), `findById`
  - [ ] 4.1.2 Criar `backend/src/services/review-service.js` com lógica: validação (texto ≥ 20 chars, nota 1–5), criação, listagem com filtros
  - [ ] 4.1.3 Criar `backend/src/controllers/review-controller.js` com handlers: `getReviews`, `createReview`
  - [ ] 4.1.4 Criar `backend/src/routes/review-routes.js` com rotas: `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews` (autenticado)
  - [ ] 4.1.5 Implementar paginação (10 itens/página) e parâmetros de query: `?sentiment=`, `?sort=rating_asc|rating_desc`, `?page=`
  - [ ] 4.1.6 Adicionar rate limiting em `POST /api/products/:id/reviews` (10 req/min por usuário)

- [ ] 4.2 Frontend — Avaliações
  - [ ] 4.2.1 Criar `frontend/src/services/review-service.js` com chamadas à API: `getReviews`, `createReview`
  - [ ] 4.2.2 Criar `frontend/src/hooks/useReviews.js` com estado de avaliações, filtros, paginação e loading
  - [ ] 4.2.3 Criar `frontend/src/components/review/ReviewCard.jsx` exibindo texto, nota, autor, data e badge de sentimento (null = sem badge)
  - [ ] 4.2.4 Criar `frontend/src/components/review/ReviewFilters.jsx` com seletores de filtro de sentimento e ordenação por nota
  - [ ] 4.2.5 Criar `frontend/src/components/review/ReviewList.jsx` com lista paginada de ReviewCards e controles de navegação
  - [ ] 4.2.6 Criar `frontend/src/components/review/ReviewForm.jsx` com campos texto e nota (1–5 estrelas), validação inline e redirecionamento para login se não autenticado

- [ ] 4.3 Testes — Avaliações
  - [ ] 4.3.1 Escrever testes unitários para `review-service.js`: validação de texto e nota
  - [ ] 4.3.2 Escrever testes de integração para `GET /api/products/:id/reviews` e `POST /api/products/:id/reviews`
  - [ ] 4.3.3 Escrever teste de propriedade P9 (avaliação válida salva e listada) — `review.property.test.js`
  - [ ] 4.3.4 Escrever teste de propriedade P10 (submissão sem auth rejeitada) — `review.property.test.js`
  - [ ] 4.3.5 Escrever teste de propriedade P11 (texto curto rejeitado) — `review.property.test.js`
  - [ ] 4.3.6 Escrever teste de propriedade P12 (nota inválida rejeitada) — `review.property.test.js`
  - [ ] 4.3.7 Escrever teste de propriedade P22 (listagem ordenada por data com paginação) — `review.property.test.js`
  - [ ] 4.3.8 Escrever teste de propriedade P23 (filtro de sentimento preciso) — `review.property.test.js`
  - [ ] 4.3.9 Escrever teste de propriedade P24 (ordenação por nota correta) — `review.property.test.js`

---

## Feature 5: Motor de IA — Análise de Sentimento

Classificação automática de avaliações e exibição de distribuição percentual. Cobre o Requisito 4.

- [ ] 5.1 Backend — Análise de Sentimento
  - [ ] 5.1.1 Criar `backend/src/ai-engine/ai-queue.js` com fila de processamento assíncrono (array em memória + setImmediate/setTimeout), suporte a retentativas com backoff exponencial (máx. 3 tentativas)
  - [ ] 5.1.2 Criar `backend/src/ai-engine/sentiment-analyzer.js` com função `analyzeSentiment(text)` retornando `'positive' | 'neutral' | 'negative'` (implementação heurística baseada em palavras-chave para POC)
  - [ ] 5.1.3 Criar `backend/src/models/product-insight-model.js` com funções: `upsertInsight`, `findByProductId`
  - [ ] 5.1.4 Criar `backend/src/services/insight-service.js` com função `recalculateSentimentDistribution(productId)` que agrega sentimentos e atualiza `ProductInsight`
  - [ ] 5.1.5 Integrar fila de IA ao `review-service.js`: após salvar avaliação, enfileirar análise de sentimento
  - [ ] 5.1.6 Adicionar rate limiting em `GET /api/products/:id/insights` (30 req/min por IP)

- [ ] 5.2 Frontend — Análise de Sentimento
  - [ ] 5.2.1 Criar `frontend/src/services/insight-service.js` com chamada à API: `getInsights(productId)`
  - [ ] 5.2.2 Criar `frontend/src/hooks/useInsights.js` com estado de insights e polling opcional para aguardar processamento
  - [ ] 5.2.3 Atualizar `ReviewCard.jsx` para exibir badge colorido de sentimento (positivo=verde, neutro=cinza, negativo=vermelho; ausente=sem badge)
  - [ ] 5.2.4 Criar `frontend/src/components/insights/SentimentChart.jsx` exibindo distribuição percentual (positivo/neutro/negativo) como gráfico de barras ou pizza

- [ ] 5.3 Testes — Análise de Sentimento
  - [ ] 5.3.1 Escrever testes unitários para `sentiment-analyzer.js` com exemplos de textos positivos, neutros e negativos
  - [ ] 5.3.2 Escrever testes unitários para `ai-queue.js`: enfileiramento, processamento, retentativas
  - [ ] 5.3.3 Escrever teste de propriedade P13 (sentimento classificado dentro do SLA) — `ai-engine.property.test.js`
  - [ ] 5.3.4 Escrever teste de propriedade P14 (distribuição percentual soma 100%) — `ai-engine.property.test.js`

---

## Feature 6: Motor de IA — Resumo Automático

Geração de resumo com pontos positivos e negativos quando produto tem ≥ 5 avaliações. Cobre o Requisito 5.

- [ ] 6.1 Backend — Resumo Automático
  - [ ] 6.1.1 Criar `backend/src/ai-engine/summary-generator.js` com função `generateSummary(reviews)` retornando objeto `{ positives: string[], negatives: string[] }` (implementação heurística para POC: agrupa frases por sentimento)
  - [ ] 6.1.2 Atualizar `insight-service.js` com função `regenerateSummary(productId)`: verifica threshold de 5 avaliações, gera resumo, persiste em `ProductInsight.summary`
  - [ ] 6.1.3 Integrar ao fluxo da fila: após análise de sentimento, verificar se deve regenerar resumo (SLA 60s)
  - [ ] 6.1.4 Criar rota `GET /api/products/:id/insights` retornando `ProductInsight` completo (summary, patterns, smartScore, simpleAverage, sentimentDistribution)

- [ ] 6.2 Frontend — Resumo Automático
  - [ ] 6.2.1 Criar `frontend/src/components/insights/InsightCard.jsx` exibindo resumo com listas de pontos positivos e negativos
  - [ ] 6.2.2 Exibir mensagem "Resumo disponível após 5 avaliações" quando produto tem menos de 5 avaliações
  - [ ] 6.2.3 Integrar `InsightCard` na página `ProductDetail.jsx` no topo da seção de avaliações

- [ ] 6.3 Testes — Resumo Automático
  - [ ] 6.3.1 Escrever testes unitários para `summary-generator.js` com conjuntos de avaliações variados
  - [ ] 6.3.2 Escrever testes de integração para `GET /api/products/:id/insights`
  - [ ] 6.3.3 Escrever teste de propriedade P15 (resumo gerado com ≥ 5 avaliações) — `ai-engine.property.test.js`
  - [ ] 6.3.4 Escrever teste de propriedade P16 (insights atualizados após nova avaliação) — `ai-engine.property.test.js`

---

## Feature 7: Motor de IA — Detecção de Padrões Recorrentes

Identificação e exibição de padrões com filtragem de avaliações por padrão. Cobre o Requisito 6.

- [ ] 7.1 Backend — Detecção de Padrões
  - [ ] 7.1.1 Criar `backend/src/ai-engine/pattern-detector.js` com função `detectPatterns(reviews)` retornando `{ strengths: string[], weaknesses: string[] }` (implementação heurística: frequência de termos por sentimento)
  - [ ] 7.1.2 Atualizar `insight-service.js` com função `reanalyzePatterns(productId)`: verifica threshold de 10 avaliações, detecta padrões, persiste em `ProductInsight.patterns`
  - [ ] 7.1.3 Integrar ao fluxo da fila: após resumo, verificar se deve reanalisar padrões (SLA 120s)
  - [ ] 7.1.4 Adicionar endpoint de filtragem por padrão: `GET /api/products/:id/reviews?pattern=<termo>` retorna avaliações que mencionam o padrão

- [ ] 7.2 Frontend — Padrões Recorrentes
  - [ ] 7.2.1 Criar `frontend/src/components/insights/PatternTags.jsx` exibindo tags de padrões separadas em "Pontos Fortes" e "Pontos Fracos", clicáveis
  - [ ] 7.2.2 Integrar `PatternTags` na página `ProductDetail.jsx`
  - [ ] 7.2.3 Implementar filtragem de avaliações ao clicar em uma tag de padrão (atualiza `useReviews` com parâmetro `pattern`)

- [ ] 7.3 Testes — Padrões Recorrentes
  - [ ] 7.3.1 Escrever testes unitários para `pattern-detector.js` com conjuntos de avaliações variados
  - [ ] 7.3.2 Escrever testes de integração para filtragem por padrão
  - [ ] 7.3.3 Escrever teste de propriedade P17 (padrões detectados com ≥ 10 avaliações) — `ai-engine.property.test.js`
  - [ ] 7.3.4 Escrever teste de propriedade P18 (padrões têm strengths e weaknesses) — `ai-engine.property.test.js`
  - [ ] 7.3.5 Escrever teste de propriedade P19 (filtragem por padrão é precisa) — `review.property.test.js`

---

## Feature 8: Motor de IA — Score Inteligente

Cálculo e exibição do score ponderado com comparação à média simples. Cobre o Requisito 7.

- [ ] 8.1 Backend — Score Inteligente
  - [ ] 8.1.1 Criar `backend/src/ai-engine/score-calculator.js` com função `calculateSmartScore(reviews, sentimentDistribution, patterns)` retornando Float [0.0–10.0] com ponderação de: nota base (50%), sentimento (30%), recência (20%)
  - [ ] 8.1.2 Atualizar `insight-service.js` com função `recalculateScore(productId)`: verifica threshold de 3 avaliações, calcula smartScore e simpleAverage, persiste em `ProductInsight`
  - [ ] 8.1.3 Integrar ao fluxo da fila: recalcular score após cada nova avaliação (SLA 30s)

- [ ] 8.2 Frontend — Score Inteligente
  - [ ] 8.2.1 Criar `frontend/src/components/insights/SmartScore.jsx` exibindo score inteligente (0–10 com 1 casa decimal) e média simples lado a lado, com representação visual em estrelas
  - [ ] 8.2.2 Exibir mensagem "Score Inteligente disponível após 3 avaliações" quando produto tem menos de 3 avaliações
  - [ ] 8.2.3 Integrar `SmartScore` na página `ProductDetail.jsx`

- [ ] 8.3 Testes — Score Inteligente
  - [ ] 8.3.1 Escrever testes unitários para `score-calculator.js` com diferentes distribuições de avaliações
  - [ ] 8.3.2 Escrever teste de propriedade P20 (score no intervalo [0.0, 10.0]) — `ai-engine.property.test.js`
  - [ ] 8.3.3 Escrever teste de propriedade P21 (média simples matematicamente correta) — `ai-engine.property.test.js`

---

## Feature 9: Integração Final e Página de Produto Completa

Composição de todos os componentes na página de produto conforme o mock visual. Polimento de UX.

- [ ] 9.1 Composição da Página de Produto
  - [ ] 9.1.1 Atualizar `ProductDetail.jsx` integrando todos os componentes na ordem do mock: header do produto → SmartScore → InsightCard → SentimentChart → PatternTags → ReviewFilters → ReviewList → ReviewForm
  - [ ] 9.1.2 Implementar estados de loading (skeleton/spinner) para cada seção de insights enquanto IA processa
  - [ ] 9.1.3 Implementar tratamento de erros de API com mensagens amigáveis em português

- [ ] 9.2 Navegação e Header
  - [ ] 9.2.1 Criar componente `Header` com navegação, campo de busca global e botões de login/logout
  - [ ] 9.2.2 Implementar página inicial com `ProductSearch` e lista de produtos em destaque
  - [ ] 9.2.3 Garantir responsividade em mobile (breakpoint 768px)

- [ ] 9.3 Polimento e Validações Finais
  - [ ] 9.3.1 Verificar que stack traces não são expostos em produção (`NODE_ENV=production`)
  - [ ] 9.3.2 Verificar que todos os endpoints de IA têm rate limiting configurado
  - [ ] 9.3.3 Verificar que validações de entrada existem tanto no frontend quanto no backend para todos os formulários
  - [ ] 9.3.4 Testar fluxo completo: cadastro → login → busca produto → submeter avaliação → visualizar insights
