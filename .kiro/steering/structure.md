---
inclusion: always
---

# Estrutura do Projeto

## Arquitetura

Projeto em fase inicial (POC) sem código implementado. Estrutura planejada:

- `/frontend` - Aplicação React (SPA)
- `/backend` - API REST Node.js/Express + Motor de IA integrado

## Organização de Diretórios

### Atual
```
/
├── .kiro/specs/{feature-name}/  # Specs de features
├── .kiro/steering/              # Regras do projeto
├── docs/                        # Mocks e documentação visual
└── README.md
```

### Planejada (Frontend)
```
frontend/
├── src/
│   ├── components/          # Componentes React (PascalCase.jsx)
│   ├── hooks/               # Custom hooks (useName.js)
│   ├── contexts/            # Context API providers
│   ├── services/            # Chamadas de API
│   ├── utils/               # Funções auxiliares
│   └── App.jsx
└── package.json
```

### Planejada (Backend)
```
backend/
├── src/
│   ├── routes/              # Definição de rotas (kebab-case.js)
│   ├── controllers/         # Lógica de controle
│   ├── services/            # Lógica de negócio
│   ├── models/              # Modelos de dados
│   ├── ai-engine/           # Motor de IA (análise, resumos, padrões)
│   ├── middleware/          # Validação, autenticação, rate limiting
│   └── server.js
└── package.json
```

## Convenções de Nomenclatura

- Componentes React: `PascalCase.jsx` (ex: `ProductCard.jsx`)
- Arquivos backend: `kebab-case.js` (ex: `review-service.js`)
- Variáveis/funções: `camelCase` (ex: `handleSubmit`, `getReviews`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_REVIEWS_PER_PAGE`)
- Custom hooks: prefixo `use` (ex: `useReviews.js`)
- Event handlers: prefixo `handle` (ex: `handleClick`)

## Referência Visual

`docs/mock-product-page.png` contém o design de referência com:
- Header (navegação + autenticação)
- Detalhes do produto
- Card de insights (% recomendação, pontos positivos/negativos)
- Score inteligente (0-10 com estrelas)
- Gráfico de análise de sentimento
- Tags de problemas recorrentes
- Lista de avaliações com badges
- CTA para cadastrar avaliação

Use este mock como guia para implementação do frontend.

## Idioma

- Documentação/comentários/mensagens: português brasileiro
- Código (variáveis/funções): inglês (convenção padrão)
