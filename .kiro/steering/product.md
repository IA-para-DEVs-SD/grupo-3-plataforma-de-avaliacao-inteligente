---
inclusion: always
---

# Produto: InsightReview

Plataforma web inteligente de avaliação de produtos com IA para análise e insights automáticos.

## Contexto do Produto

InsightReview resolve o problema de sobrecarga de informações em avaliações online, transformando dados brutos em insights acionáveis através de IA.

## Funcionalidades Core

1. **Análise de Sentimento**: Classificação automática (positiva/neutra/negativa) com SLA de 30s
2. **Resumo Automático**: Síntese de avaliações em pontos-chave com SLA de 60s
3. **Detecção de Padrões**: Identificação de problemas/qualidades recorrentes com SLA de 120s
4. **Score Inteligente**: Pontuação ponderada 0-10 (não média aritmética) com SLA de 30s

## Princípios de Design

- Priorizar clareza sobre volume de informação
- Apresentar insights visuais (gráficos, badges, tags)
- Feedback imediato para ações do usuário
- Interface responsiva e acessível

## Fluxo Principal do Usuário

1. Visualizar produto com insights agregados (% recomendação, pontos positivos/negativos)
2. Explorar análise de sentimento via gráfico
3. Identificar padrões através de tags de problemas recorrentes
4. Ler avaliações individuais com badges de classificação
5. Cadastrar nova avaliação (autenticado)

## Referência Visual

Use `docs/mock-product-page.png` como fonte de verdade para layout e componentes da interface.

## Restrições e Considerações

- Motor de IA integrado ao backend (não serviço externo)
- Rate limiting obrigatório em endpoints de IA
- Cache de resultados de IA quando apropriado
- Validação de entrada em frontend (UX) e backend (segurança)
- Status atual: POC sem código implementado

## Terminologia do Domínio

- **Avaliação/Review**: Opinião de usuário sobre produto
- **Insight**: Informação derivada por IA de múltiplas avaliações
- **Score Inteligente**: Pontuação ponderada calculada por IA (não média simples)
- **Padrão Recorrente**: Problema ou qualidade mencionado em múltiplas avaliações
- **Badge**: Indicador visual de classificação de sentimento
