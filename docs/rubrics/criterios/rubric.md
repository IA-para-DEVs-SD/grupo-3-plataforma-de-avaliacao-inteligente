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
