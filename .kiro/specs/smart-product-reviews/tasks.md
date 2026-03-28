# Tasks: InsightReview — Smart Product Reviews

## Estratégia de Implementação

As tasks estão organizadas por **dev**, distribuídas entre 5 desenvolvedores com responsabilidades claras. A Feature 1 (infraestrutura) é pré-requisito compartilhado e deve ser concluída primeiro. Após isso, os devs trabalham em paralelo nas suas áreas.

| Dev | Área de Responsabilidade |
|-----|--------------------------|
| Dev 1 | Infraestrutura + Banco de Dados + Integração Final |
| Dev 2 | Autenticação (backend + frontend + testes) |
| Dev 3 | Produtos + Avaliações — Backend |
| Dev 4 | Produtos + Avaliações — Frontend |
| Dev 5 | Motor de IA completo (sentimento, resumo, padrões, score) |

---

## Dev 1 — Infraestrutura, Banco de Dados e Integração Final

Responsável pela base dos dois projetos, configuração de banco, middleware compartilhado e composição final da página.

- [ ] 1.1 Inicializar projeto backend com Node.js/Express
  - [x] 1.1.1 Criar `backend/package.json` com dependências: express, better-sqlite3, bcryptjs, jsonwebtoken, express-validator, express-rate-limit, cors, dotenv
  - [x] 1.1.2 Criar `backend/src/server.js` com configuração Express (cors, json parser, compressão gzip)
  - [x] 1.1.3 Criar `backend/src/middleware/error-middleware.js` com handler centralizado de erros (formato `{ error: { code, message, details } }`)
  - [x] 1.1.4 Criar `backend/src/database/connection.js` com inicialização SQLite e criação das tabelas (users, products, reviews, product_insights)
  - [x] 1.1.5 Criar `backend/.env.example` com variáveis: PORT, JWT_SECRET, NODE_ENV, DB_PATH

- [ ] 1.2 Inicializar projeto frontend com React
  - [x] 1.2.1 Criar `frontend/package.json` com dependências: react, react-dom, react-router-dom, axios
  - [x] 1.2.2 Criar `frontend/src/App.jsx` com estrutura de rotas (react-router-dom): `/`, `/login`, `/register`, `/products/:id`
  - [x] 1.2.3 Criar `frontend/src/services/api.js` com instância axios configurada (baseURL, interceptor de token JWT no header)
  - [x] 1.2.4 Criar `frontend/src/utils/validators.js` com funções de validação reutilizáveis (email, senha, texto mínimo, nota)

- [ ] 1.3 Configurar testes
  - [x] 1.3.1 Instalar e configurar Jest no backend com suporte a ES modules
  - [x] 1.3.2 Instalar fast-check no backend para testes de propriedade
  - [x] 1.3.3 Instalar e configurar React Testing Library no frontend

- [ ] 1.4 Composição da Página de Produto e Navegação
  - [x] 1.4.1 Atualizar `ProductDetail.jsx` integrando todos os componentes na ordem do mock: header do produto → SmartScore → InsightCard → SentimentChart → PatternTags → ReviewFilters → ReviewList → ReviewForm
  - [x] 1.4.2 Implementar estados de loading (skeleton/spinner) para cada seção de insights enquanto IA processa
  - [x] 1.4.3 Implementar tratamento de erros de API com mensagens amigáveis em português
  - [x] 1.4.4 Criar componente `Header` com navegação, campo de busca global e botões de login/logout
  - [x] 1.4.5 Implementar página inicial com `ProductSearch` e lista de produtos em destaque
  - [x] 1.4.6 Garantir responsividade em mobile (breakpoint 768px)

- [ ] 1.5 Polimento e Validações Finais
  - [x] 1.5.1 Verificar que stack traces não são expostos em produção (`NODE_ENV=production`)
  - [x] 1.5.2 Verificar que todos os endpoints de IA têm rate limiting configurado
  - [x] 1.5.3 Verificar que validações de entrada existem tanto no frontend quanto no backend para todos os formulários
  - [x] 1.5.4 Testar fluxo completo: cadastro → login → busca produto → submeter avaliação → visualizar insights

---

## Dev 2 — Autenticação (Backend + Frontend + Testes)

Responsável por todo o fluxo de cadastro, login, logout, proteção de rotas e testes de autenticação. Cobre o Requisito 1.

- [ ] 2.1 Backend — Autenticação
  - [x] 2.1.1 Criar `backend/src/models/user-model.js` com funções: `createUser`, `findByEmail`, `findById`
  - [x] 2.1.2 Criar `backend/src/services/auth-service.js` com lógica: hash de senha (bcryptjs), geração de JWT, verificação de credenciais
  - [x] 2.1.3 Criar `backend/src/controllers/auth-controller.js` com handlers: `register`, `login`, `logout`
  - [x] 2.1.4 Criar `backend/src/routes/auth-routes.js` com rotas: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
  - [x] 2.1.5 Criar `backend/src/middleware/auth-middleware.js` para verificar JWT e injetar `req.user`
  - [x] 2.1.6 Criar `backend/src/middleware/validation-middleware.js` com schemas de validação para registro (nome, email, senha ≥ 8 chars) e login

- [ ] 2.2 Frontend — Autenticação
  - [x] 2.2.1 Criar `frontend/src/contexts/AuthContext.jsx` com estado de usuário autenticado, funções `login`, `logout`, `register`
  - [x] 2.2.2 Criar `frontend/src/services/auth-service.js` com chamadas à API: `register`, `login`, `logout`
  - [x] 2.2.3 Criar `frontend/src/hooks/useAuth.js` consumindo AuthContext
  - [x] 2.2.4 Criar `frontend/src/components/auth/RegisterForm.jsx` com campos nome, e-mail, senha e validação inline
  - [x] 2.2.5 Criar `frontend/src/components/auth/LoginForm.jsx` com campos e-mail, senha, mensagem de erro e redirecionamento pós-login
  - [x] 2.2.6 Criar componente `PrivateRoute` para proteger rotas que exigem autenticação

- [ ] 2.3 Testes — Autenticação
  - [x] 2.3.1 Escrever testes unitários para `auth-service.js`: hash de senha, geração/verificação de JWT
  - [x] 2.3.2 Escrever testes de integração para `POST /api/auth/register` e `POST /api/auth/login`
  - [x] 2.3.3 Escrever teste de propriedade P1 (cadastro válido cria conta) — `auth.property.test.js`
  - [x] 2.3.4 Escrever teste de propriedade P2 (login válido retorna token) — `auth.property.test.js`
  - [x] 2.3.5 Escrever teste de propriedade P3 (login inválido é rejeitado) — `auth.property.test.js`
  - [x] 2.3.6 Escrever teste de propriedade P4 (e-mail duplicado rejeitado) — `auth.property.test.js`
  - [x] 2.3.7 Escrever teste de propriedade P5 (logout invalida sessão) — `auth.property.test.js`

---

## Dev 3 — Produtos e Avaliações (Backend + Testes)

Responsável por toda a API de produtos e avaliações: models, services, controllers, rotas e testes. Cobre os Requisitos 2, 3 e 8.

- [ ] 3.1 Backend — Produtos
  - [x] 3.1.1 Criar `backend/src/models/product-model.js` com funções: `createProduct`, `findById`, `search` (por nome/categoria, case-insensitive)
  - [x] 3.1.2 Criar `backend/src/services/product-service.js` com lógica de negócio: validação de dados, orquestração de model
  - [x] 3.1.3 Criar `backend/src/controllers/product-controller.js` com handlers: `searchProducts`, `getProductById`, `createProduct`
  - [x] 3.1.4 Criar `backend/src/routes/product-routes.js` com rotas: `GET /api/products`, `GET /api/products/:id`, `POST /api/products` (autenticado)
  - [x] 3.1.5 Adicionar validação de entrada para criação de produto (nome, descrição, categoria obrigatórios)

- [ ] 3.2 Backend — Avaliações
  - [x] 3.2.1 Criar `backend/src/models/review-model.js` com funções: `createReview`, `findByProductId` (com filtro de sentimento, ordenação, paginação), `findById`
  - [x] 3.2.2 Criar `backend/src/services/review-service.js` com lógica: validação (texto ≥ 20 chars, nota 1–5), criação, listagem com filtros
  - [x] 3.2.3 Criar `backend/src/controllers/review-controller.js` com handlers: `getReviews`, `createReview`
  - [x] 3.2.4 Criar `backend/src/routes/review-routes.js` com rotas: `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews` (autenticado)
  - [x] 3.2.5 Implementar paginação (10 itens/página) e parâmetros de query: `?sentiment=`, `?sort=rating_asc|rating_desc`, `?page=`
  - [x] 3.2.6 Adicionar rate limiting em `POST /api/products/:id/reviews` (10 req/min por usuário)

- [ ] 3.3 Testes — Produtos e Avaliações
  - [x] 3.3.1 Escrever testes unitários para `product-service.js` e `product-model.js`
  - [x] 3.3.2 Escrever testes de integração para `GET /api/products` e `POST /api/products`
  - [x] 3.3.3 Escrever teste de propriedade P6 (busca retorna apenas correspondentes) — `product.property.test.js`
  - [x] 3.3.4 Escrever teste de propriedade P7 (detalhes têm campos obrigatórios) — `product.property.test.js`
  - [x] 3.3.5 Escrever teste de propriedade P8 (produto cadastrado aparece na busca) — `product.property.test.js`
  - [x] 3.3.6 Escrever testes unitários para `review-service.js`: validação de texto e nota
  - [x] 3.3.7 Escrever testes de integração para `GET /api/products/:id/reviews` e `POST /api/products/:id/reviews`
  - [x] 3.3.8 Escrever teste de propriedade P9 (avaliação válida salva e listada) — `review.property.test.js`
  - [x] 3.3.9 Escrever teste de propriedade P10 (submissão sem auth rejeitada) — `review.property.test.js`
  - [x] 3.3.10 Escrever teste de propriedade P11 (texto curto rejeitado) — `review.property.test.js`
  - [x] 3.3.11 Escrever teste de propriedade P12 (nota inválida rejeitada) — `review.property.test.js`
  - [x] 3.3.12 Escrever teste de propriedade P22 (listagem ordenada por data com paginação) — `review.property.test.js`
  - [x] 3.3.13 Escrever teste de propriedade P23 (filtro de sentimento preciso) — `review.property.test.js`
  - [x] 3.3.14 Escrever teste de propriedade P24 (ordenação por nota correta) — `review.property.test.js`

---

## Dev 4 — Produtos e Avaliações (Frontend)

Responsável por todos os componentes React de produtos e avaliações: services, hooks, componentes visuais. Cobre os Requisitos 2, 3 e 8.

- [ ] 4.1 Frontend — Produtos
  - [x] 4.1.1 Criar `frontend/src/services/product-service.js` com chamadas à API: `searchProducts`, `getProduct`, `createProduct`
  - [x] 4.1.2 Criar `frontend/src/hooks/useProducts.js` com estado de busca, loading e erro
  - [x] 4.1.3 Criar `frontend/src/components/product/ProductSearch.jsx` com campo de busca e lista de resultados
  - [x] 4.1.4 Criar `frontend/src/components/product/ProductCard.jsx` exibindo nome, categoria e imagem
  - [x] 4.1.5 Criar `frontend/src/components/product/ProductDetail.jsx` exibindo todos os campos do produto
  - [x] 4.1.6 Implementar mensagem "nenhum resultado encontrado" quando busca retorna vazio

- [ ] 4.2 Frontend — Avaliações
  - [x] 4.2.1 Criar `frontend/src/services/review-service.js` com chamadas à API: `getReviews`, `createReview`
  - [x] 4.2.2 Criar `frontend/src/hooks/useReviews.js` com estado de avaliações, filtros, paginação e loading
  - [x] 4.2.3 Criar `frontend/src/components/review/ReviewCard.jsx` exibindo texto, nota, autor, data e badge de sentimento (null = sem badge)
  - [x] 4.2.4 Criar `frontend/src/components/review/ReviewFilters.jsx` com seletores de filtro de sentimento e ordenação por nota
  - [x] 4.2.5 Criar `frontend/src/components/review/ReviewList.jsx` com lista paginada de ReviewCards e controles de navegação
  - [x] 4.2.6 Criar `frontend/src/components/review/ReviewForm.jsx` com campos texto e nota (1–5 estrelas), validação inline e redirecionamento para login se não autenticado

---

## Dev 5 — Motor de IA Completo (Backend + Frontend + Testes)

Responsável por todo o motor de IA: fila de processamento, análise de sentimento, resumo automático, detecção de padrões, score inteligente e seus componentes visuais. Cobre os Requisitos 4, 5, 6 e 7.

- [ ] 5.1 Infraestrutura de IA — Fila e Sentimento
  - [x] 5.1.1 Criar `backend/src/ai-engine/ai-queue.js` com fila de processamento assíncrono (array em memória + setImmediate/setTimeout), suporte a retentativas com backoff exponencial (máx. 3 tentativas)
  - [x] 5.1.2 Criar `backend/src/ai-engine/sentiment-analyzer.js` com função `analyzeSentiment(text)` retornando `'positive' | 'neutral' | 'negative'` (implementação heurística baseada em palavras-chave para POC)
  - [x] 5.1.3 Criar `backend/src/models/product-insight-model.js` com funções: `upsertInsight`, `findByProductId`
  - [x] 5.1.4 Criar `backend/src/services/insight-service.js` com função `recalculateSentimentDistribution(productId)` que agrega sentimentos e atualiza `ProductInsight`
  - [x] 5.1.5 Integrar fila de IA ao `review-service.js`: após salvar avaliação, enfileirar análise de sentimento
  - [x] 5.1.6 Adicionar rate limiting em `GET /api/products/:id/insights` (30 req/min por IP)

- [ ] 5.2 Resumo Automático
  - [x] 5.2.1 Criar `backend/src/ai-engine/summary-generator.js` com função `generateSummary(reviews)` retornando objeto `{ positives: string[], negatives: string[] }` (implementação heurística para POC: agrupa frases por sentimento)
  - [x] 5.2.2 Atualizar `insight-service.js` com função `regenerateSummary(productId)`: verifica threshold de 5 avaliações, gera resumo, persiste em `ProductInsight.summary`
  - [x] 5.2.3 Integrar ao fluxo da fila: após análise de sentimento, verificar se deve regenerar resumo (SLA 60s)
  - [x] 5.2.4 Criar rota `GET /api/products/:id/insights` retornando `ProductInsight` completo (summary, patterns, smartScore, simpleAverage, sentimentDistribution)

- [ ] 5.3 Detecção de Padrões Recorrentes
  - [x] 5.3.1 Criar `backend/src/ai-engine/pattern-detector.js` com função `detectPatterns(reviews)` retornando `{ strengths: string[], weaknesses: string[] }` (implementação heurística: frequência de termos por sentimento)
  - [x] 5.3.2 Atualizar `insight-service.js` com função `reanalyzePatterns(productId)`: verifica threshold de 10 avaliações, detecta padrões, persiste em `ProductInsight.patterns`
  - [x] 5.3.3 Integrar ao fluxo da fila: após resumo, verificar se deve reanalisar padrões (SLA 120s)
  - [x] 5.3.4 Adicionar endpoint de filtragem por padrão: `GET /api/products/:id/reviews?pattern=<termo>` retorna avaliações que mencionam o padrão

- [ ] 5.4 Score Inteligente
  - [x] 5.4.1 Criar `backend/src/ai-engine/score-calculator.js` com função `calculateSmartScore(reviews, sentimentDistribution, patterns)` retornando Float [0.0–10.0] com ponderação de: nota base (50%), sentimento (30%), recência (20%)
  - [x] 5.4.2 Atualizar `insight-service.js` com função `recalculateScore(productId)`: verifica threshold de 3 avaliações, calcula smartScore e simpleAverage, persiste em `ProductInsight`
  - [x] 5.4.3 Integrar ao fluxo da fila: recalcular score após cada nova avaliação (SLA 30s)

- [ ] 5.5 Frontend — Componentes de IA e Insights
  - [x] 5.5.1 Criar `frontend/src/services/insight-service.js` com chamada à API: `getInsights(productId)`
  - [x] 5.5.2 Criar `frontend/src/hooks/useInsights.js` com estado de insights e polling opcional para aguardar processamento
  - [x] 5.5.3 Atualizar `ReviewCard.jsx` para exibir badge colorido de sentimento (positivo=verde, neutro=cinza, negativo=vermelho; ausente=sem badge)
  - [x] 5.5.4 Criar `frontend/src/components/insights/SentimentChart.jsx` exibindo distribuição percentual (positivo/neutro/negativo) como gráfico de barras ou pizza
  - [x] 5.5.5 Criar `frontend/src/components/insights/InsightCard.jsx` exibindo resumo com listas de pontos positivos e negativos
  - [x] 5.5.6 Exibir mensagem "Resumo disponível após 5 avaliações" quando produto tem menos de 5 avaliações
  - [x] 5.5.7 Criar `frontend/src/components/insights/PatternTags.jsx` exibindo tags de padrões separadas em "Pontos Fortes" e "Pontos Fracos", clicáveis
  - [x] 5.5.8 Implementar filtragem de avaliações ao clicar em uma tag de padrão (atualiza `useReviews` com parâmetro `pattern`)
  - [x] 5.5.9 Criar `frontend/src/components/insights/SmartScore.jsx` exibindo score inteligente (0–10 com 1 casa decimal) e média simples lado a lado, com representação visual em estrelas
  - [x] 5.5.10 Exibir mensagem "Score Inteligente disponível após 3 avaliações" quando produto tem menos de 3 avaliações

- [ ] 5.6 Testes — Motor de IA
  - [x] 5.6.1 Escrever testes unitários para `sentiment-analyzer.js` com exemplos de textos positivos, neutros e negativos
  - [x] 5.6.2 Escrever testes unitários para `ai-queue.js`: enfileiramento, processamento, retentativas
  - [x] 5.6.3 Escrever teste de propriedade P13 (sentimento classificado dentro do SLA) — `ai-engine.property.test.js`
  - [x] 5.6.4 Escrever teste de propriedade P14 (distribuição percentual soma 100%) — `ai-engine.property.test.js`
  - [x] 5.6.5 Escrever testes unitários para `summary-generator.js` com conjuntos de avaliações variados
  - [x] 5.6.6 Escrever testes de integração para `GET /api/products/:id/insights`
  - [x] 5.6.7 Escrever teste de propriedade P15 (resumo gerado com ≥ 5 avaliações) — `ai-engine.property.test.js`
  - [x] 5.6.8 Escrever teste de propriedade P16 (insights atualizados após nova avaliação) — `ai-engine.property.test.js`
  - [x] 5.6.9 Escrever testes unitários para `pattern-detector.js` com conjuntos de avaliações variados
  - [x] 5.6.10 Escrever testes de integração para filtragem por padrão
  - [x] 5.6.11 Escrever teste de propriedade P17 (padrões detectados com ≥ 10 avaliações) — `ai-engine.property.test.js`
  - [x] 5.6.12 Escrever teste de propriedade P18 (padrões têm strengths e weaknesses) — `ai-engine.property.test.js`
  - [x] 5.6.13 Escrever teste de propriedade P19 (filtragem por padrão é precisa) — `review.property.test.js`
  - [x] 5.6.14 Escrever testes unitários para `score-calculator.js` com diferentes distribuições de avaliações
  - [x] 5.6.15 Escrever teste de propriedade P20 (score no intervalo [0.0, 10.0]) — `ai-engine.property.test.js`
  - [x] 5.6.16 Escrever teste de propriedade P21 (média simples matematicamente correta) — `ai-engine.property.test.js`
