# 💡 InsightReview — Plataforma Inteligente de Avaliação de Produtos

## Sobre o Projeto

O **InsightReview** é uma plataforma web onde usuários avaliam produtos de qualquer marca, com apoio de Inteligência Artificial para organizar avaliações, gerar insights automáticos e ajudar na tomada de decisões de compra.

### O Problema

Hoje, usuários enfrentam dificuldades para confiar em avaliações online:

- Avaliações falsas ou enviesadas
- Grande volume de informações desorganizadas
- Falta de clareza sobre pontos positivos e negativos dos produtos

### A Solução

Uma plataforma que utiliza IA para transformar dados brutos de avaliações em informações claras e confiáveis:

- **Resumo Automático** — IA sintetiza opiniões em poucos pontos claros (positivos e negativos)
- **Análise de Sentimento** — Classificação automática das avaliações (positiva, neutra, negativa)
- **Detecção de Padrões** — Identificação de problemas e qualidades recorrentes nos produtos
- **Score Inteligente** — Pontuação ponderada (0-10) mais confiável que a média aritmética simples

## Stack Tecnológica

| Camada   | Tecnologia |
|----------|------------|
| Frontend | React      |
| Backend  | Node.js    |

## Mock de Referência (Frontend)

O mock abaixo representa a página de detalhes de um produto e serve como guia visual para o desenvolvimento do frontend:

![Mock da Página de Produto](docs/mock-product-page.png)

### Elementos do Mock

| Seção | Descrição |
|-------|-----------|
| Header | Navegação com logo "InsightReview", links (Início, Produtos, Minhas Avaliações), Login e Cadastrar |
| Detalhes do Produto | Imagem, nome do produto, categoria com dropdown |
| Insight do Produto | Card destacado com percentual de recomendação, pontos positivos e negativos |
| Score Inteligente | Nota 0-10 com estrelas e classificação textual (ex: "Excelente"), total de avaliações |
| Análise de Sentimento | Gráfico de pizza com distribuição percentual (positivas, neutras, negativas) |
| Problemas Recorrentes | Tags com padrões identificados pela IA (ex: "Bateria Fraca", "Atraso na Entrega") |
| Últimas Avaliações | Cards com avatar, nome, estrelas, badge de sentimento (Recomendado/Não Recomendado/Neutro), data e texto |
| Botão CTA | "Cadastrar Avaliação" para submissão de nova avaliação |

## Documentação

- [Requisitos do Projeto](.kiro/specs/smart-product-reviews/requirements.md)

## Diagrama de Arquitetura

![Diagrama de Arquitetura do InsightReview](docs/architecture-diagram.png)

## Arquitetura do Projeto

Monorepo com Turborepo:

```
meu-projeto/
├── .kiro/                  # Especificações do Kiro/IA
├── .github/                # Especificações e configurações para Github
├── [backend/front]/        # Monorepo podendo ser backend e front
│   ├── docs/               # Documentações
│   ├── tests/              # Testes automatizados
│   ├── src/                # Diretórios com códigos do monorepo
│   └── .env.example        # Variáveis de ambiente
├── scripts/                # Opcional: Scripts gerais do repositório
├── Dockerfile              # Opcional: Imagem Docker
├── docker-compose.yml      # Opcional: Orquestração para rodar local
├── README.md               # Documentação inicial do projeto
└── .gitignore              # Ignora arquivos e pastas no versionamento
```

## Status

🚧 POC em desenvolvimento