# InsightReview — Plataforma Inteligente de Avaliação de Produtos

Plataforma web onde usuários avaliam produtos com apoio de Inteligência Artificial para organizar avaliações, gerar insights automáticos e ajudar na tomada de decisões de compra.

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instruções de Instalação](#instruções-de-instalação)
- [Documentação](#documentação)
- [Integrantes](#integrantes)

## Sobre o Projeto

O InsightReview resolve o problema de sobrecarga de informações em avaliações online, transformando dados brutos em insights acionáveis através de IA.

### Funcionalidades

- **Análise de Sentimento** — Classificação automática das avaliações (positiva, neutra, negativa)
- **Resumo Automático** — IA sintetiza opiniões em pontos claros (positivos e negativos)
- **Detecção de Padrões** — Identificação de problemas e qualidades recorrentes nos produtos
- **Score Inteligente** — Pontuação ponderada (0-10) mais confiável que a média aritmética simples

### Referência Visual

![Mock da Página de Produto](docs/mock-product-page.png)

## Tecnologias Utilizadas

| Camada    | Tecnologia                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router, Axios     |
| Backend   | Node.js, Express, SQLite          |
| Motor IA  | Integrado ao backend (heurístico) |
| Testes    | Jest, fast-check, React Testing Library |

## Estrutura do Projeto

```
grupo-3-plataforma-de-avaliacao-inteligente/
├── backend/
│   ├── src/
│   │   ├── ai-engine/       # Motor de IA (sentimento, resumo, padrões, score)
│   │   ├── controllers/     # Lógica de controle das rotas
│   │   ├── database/        # Conexão e inicialização do banco de dados
│   │   ├── middleware/      # Auth, validação, rate limiting
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Definição de rotas
│   │   ├── services/        # Lógica de negócio
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React (auth, product, review, insights)
│   │   ├── contexts/        # Context API providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Chamadas à API
│   │   ├── utils/           # Funções auxiliares e validadores
│   │   └── App.jsx
│   └── package.json
├── .kiro/
│   ├── specs/               # Especificações de features
│   └── steering/            # Regras e padrões do projeto
├── docs/                    # Mocks e documentação visual
└── README.md
```

## Instruções de Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Backend

```bash
cd backend
cp .env.example .env
# edite o .env com suas configurações
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentação

- [Requisitos](.kiro/specs/smart-product-reviews/requirements.md)
- [Design Técnico](.kiro/specs/smart-product-reviews/design.md)
- [Tasks de Implementação](.kiro/specs/smart-product-reviews/tasks.md)

## Integrantes

| Nome                    |
|-------------------------|
| Emesson Cavalcante      |
| Denis Mendes Valgas     |
| Lucas Almeida           |
| Marco Aurélio Alencastro|
| Diego Roberto da Silva  |

---

🚧 POC em desenvolvimento
