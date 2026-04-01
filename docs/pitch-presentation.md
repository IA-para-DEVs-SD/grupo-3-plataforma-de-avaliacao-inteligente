# InsightReview — Pitch de Apresentação

**Versão:** 1.0  
**Data:** Março 2026  
**Status:** POC em desenvolvimento

---

## 1. O Problema (2 min)

### A Crise das Avaliações Online

**Cenário atual:**
- Produtos populares acumulam centenas/milhares de avaliações
- Consumidores não conseguem processar esse volume de informação
- Decisões baseadas apenas nas primeiras avaliações ou na nota média

**Por que isso importa?**

> "Uma nota 3.5 pode significar um produto mediano OU um produto polarizador com metade dos usuários adorando e metade odiando."

**Impactos mensuráveis:**
- ⏱️ Tempo excessivo gasto em pesquisa de produtos
- 😤 Frustração pós-compra por expectativas não alinhadas
- 🚫 Desconfiança generalizada em plataformas de avaliação
- 💸 Decisões de compra mal informadas

---

## 2. A Solução (3 min)

### InsightReview: IA que Transforma Dados em Decisões

**Proposta de valor:**
Transformamos centenas de avaliações em insights acionáveis através de IA integrada, permitindo decisões de compra informadas em segundos, não horas.

### Diferenciais Competitivos

| Plataformas Tradicionais | InsightReview |
|---|---|
| Média aritmética simples | **Score Inteligente ponderado** (sentimento + recência + padrões) |
| Leitura manual de avaliações | **Resumo automático** de pontos-chave |
| Padrões diluídos no texto | **Tags de problemas recorrentes** identificados por IA |
| Sem contexto emocional | **Badges de sentimento** em cada avaliação |

### Funcionalidades Core

**1. Análise de Sentimento** (SLA: 30s)
- Classificação automática: positiva / neutra / negativa
- Distribuição percentual visual
- Badges coloridos em cada avaliação

**2. Score Inteligente** (SLA: 30s)
- Pontuação ponderada 0-10 (não média simples)
- Considera sentimento, recência e padrões
- Disponível a partir de 3 avaliações

**3. Resumo Automático** (SLA: 60s)
- Síntese dos principais pontos positivos e negativos
- Gerado a partir de 5 avaliações
- Atualizado dinamicamente

**4. Detecção de Padrões** (SLA: 120s)
- Identificação de problemas/qualidades recorrentes
- Tags clicáveis para filtrar avaliações relacionadas
- Disponível a partir de 10 avaliações

---

## 3. Demonstração Visual (2 min)

### Jornada do Usuário

**Antes (plataformas tradicionais):**
1. Vê nota média 3.8 ⭐ (sem contexto)
2. Lê 20+ avaliações manualmente
3. Tenta identificar padrões mentalmente
4. Ainda não tem certeza da decisão

**Depois (InsightReview):**
1. Vê Score Inteligente 7.2/10 + distribuição de sentimento
2. Lê resumo automático: "Pontos fortes: custo-benefício, durabilidade. Pontos fracos: bateria fraca"
3. Clica em tag "bateria fraca" → vê 15 avaliações mencionando isso
4. Decisão informada em 30 segundos

### Interface (referência: `docs/mock-product-page.png`)

**Componentes principais:**
- Header com autenticação
- Card de insights (% recomendação, resumo)
- Score Inteligente (0-10 com estrelas)
- Gráfico de distribuição de sentimento
- Tags de padrões recorrentes
- Lista de avaliações com badges

---

## 4. Arquitetura Técnica (3 min)

### Stack Tecnológica

**Frontend:**
- React (functional components + hooks)
- Context API para estado global
- CSS modules para estilização
- Axios para requisições HTTP

**Backend:**
- Node.js + Express (API RESTful)
- SQLite (POC) → PostgreSQL (produção)
- JWT para autenticação
- Express-validator para validação

**Motor de IA (integrado ao backend):**
- Análise de sentimento (NLP)
- Geração de resumos (text summarization)
- Detecção de padrões (pattern mining)
- Cálculo de score ponderado (weighted scoring)

### Arquitetura de Sistema

```
┌─────────────┐
│   Frontend  │ (React SPA)
│   (React)   │
└──────┬──────┘
       │ HTTPS/REST
       ▼
┌─────────────────────────────┐
│       Backend API           │
│    (Node.js + Express)      │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │   Motor de IA       │   │
│  │  - Sentimento       │   │
│  │  - Resumos          │   │
│  │  - Padrões          │   │
│  │  - Score            │   │
│  └─────────────────────┘   │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │   Database   │
    │   (SQLite)   │
    └──────────────┘
```

### Decisões Técnicas Estratégicas

**1. IA integrada (não serviço externo)**
- ✅ Controle total sobre algoritmos
- ✅ Sem dependência de APIs terceiras
- ✅ Custos previsíveis
- ✅ Latência reduzida

**2. Processamento assíncrono**
- ✅ UX não bloqueante
- ✅ SLAs garantidos (30s-120s)
- ✅ Escalabilidade horizontal

**3. Cache inteligente**
- ✅ Evita reprocessamento desnecessário
- ✅ Reduz carga computacional
- ✅ Melhora tempo de resposta

---

## 5. Por que Essa Stack? (2 min)

### Vantagens das Tecnologias Escolhidas

**React (Frontend)**
- Ecossistema maduro com vasta comunidade e bibliotecas prontas
- Componentes reutilizáveis aceleram o desenvolvimento e reduzem bugs
- Virtual DOM garante re-renderizações eficientes, essencial para atualizações em tempo real dos insights
- Hooks e Context API eliminam a necessidade de bibliotecas externas de estado (Redux), reduzindo complexidade e bundle size
- Amplamente adotado no mercado: facilita onboarding de novos devs

**Node.js + Express (Backend)**
- JavaScript full-stack: mesmo idioma no frontend e backend, reduz fricção cognitiva e permite compartilhamento de código (validações, tipos)
- Event loop não-bloqueante é ideal para o processamento assíncrono dos algoritmos de IA com SLAs distintos
- NPM: maior repositório de pacotes do mundo, com soluções prontas para NLP, autenticação e validação
- Express é minimalista e flexível: sem overhead desnecessário para uma API RESTful focada

**SQLite → PostgreSQL (Banco de Dados)**
- SQLite no POC: zero configuração, zero custo, banco embutido no processo — perfeito para validar o produto
- Migração natural para PostgreSQL em produção: mesma sintaxe SQL, sem reescrita de queries
- PostgreSQL é battle-tested para cargas de produção com suporte a índices avançados, JSON nativo e full-text search

**JWT (Autenticação)**
- Stateless: sem necessidade de sessões no servidor, facilita escalabilidade horizontal
- Padrão da indústria com suporte nativo em todas as linguagens e frameworks
- Payload customizável permite carregar dados do usuário sem consultas extras ao banco

**Express-validator (Validação)**
- Integração nativa com Express: middleware declarativo e legível
- Validação e sanitização em uma única biblioteca, reduzindo superfície de ataque
- Mensagens de erro padronizadas melhoram a experiência do desenvolvedor e do usuário

### Coerência da Stack

Toda a stack compartilha um princípio: **JavaScript end-to-end**. Isso significa:
- Um único time pode trabalhar em qualquer camada
- Ferramentas de teste unificadas (Jest para frontend e backend)
- Deploy simplificado (Node.js em qualquer cloud ou container)
- Curva de aprendizado reduzida para novos colaboradores

---

## 6. Segurança e Performance (2 min)

### Medidas de Segurança

**Validação em camadas:**
- Frontend: validação inline (UX)
- Backend: validação rigorosa (segurança)
- Sanitização de dados antes de processar

**Rate Limiting:**
- Submissão de avaliações: 10 req/min por usuário
- Endpoints de insights: 30 req/min por IP
- Proteção contra abuso e spam

**Autenticação:**
- JWT com expiração configurável
- Rotas protegidas para operações de escrita
- HTTPS obrigatório em produção

### Otimizações de Performance

**Backend:**
- Cache de resultados de IA
- Queries otimizadas com índices
- Compressão gzip de respostas

**Frontend:**
- Lazy loading de componentes pesados
- Paginação de avaliações (10 por página)
- Debounce em busca de produtos

---

## 7. Roadmap e Métricas (2 min)

### Fase Atual: POC (Q1 2026)

**Objetivos:**
- ✅ Implementação completa das 4 funcionalidades core
- ✅ Testes unitários e de integração
- ✅ Validação de SLAs do motor de IA
- 🔄 Deploy em ambiente de staging

### Próximas Fases

**v1.0 — MVP Público (Q2 2026)**
- Catálogo inicial com 100 produtos
- Onboarding de early adopters
- Monitoramento de performance em produção

**v1.1 — Melhorias (Q3 2026)**
- Moderação de avaliações
- Respostas de fabricantes
- Notificações por e-mail

**v2.0 — Expansão (Q4 2026)**
- App mobile nativo
- Integração com redes sociais
- Avaliações de serviços (além de produtos)

### Métricas de Sucesso

**Técnicas:**
- SLA de IA: 95% das requisições dentro do tempo esperado
- Uptime: 99.5%
- Tempo de resposta API: < 200ms (p95)

**Negócio:**
- Tempo médio de decisão: redução de 80% vs. plataformas tradicionais
- Taxa de conversão: aumento de 25% em decisões de compra
- NPS: > 50 nos primeiros 6 meses

---

## 8. Diferenciais Competitivos (1 min)

### Por que InsightReview?

**1. IA Proprietária**
- Controle total sobre algoritmos
- Evolução contínua baseada em feedback
- Sem dependência de terceiros

**2. Foco em Clareza**
- Interface limpa e intuitiva
- Insights visuais (gráficos, badges, tags)
- Informação relevante, não volume

**3. Transparência**
- Score Inteligente explicável
- Distribuição de sentimentos visível
- Padrões identificados com evidências

**4. Performance Garantida**
- SLAs públicos e monitorados
- Cache inteligente
- Escalabilidade horizontal

---

## 9. Perguntas Frequentes

**P: Como o Score Inteligente difere da média simples?**
R: Ponderamos sentimento (40%), recência (30%) e padrões recorrentes (30%). Uma avaliação recente negativa tem mais peso que uma antiga positiva.

**P: A IA substitui a leitura de avaliações?**
R: Não. Ela complementa, oferecendo síntese rápida. Usuários ainda podem ler avaliações individuais filtradas por sentimento ou padrão.

**P: Como garantem a qualidade das análises de IA?**
R: Testes de propriedade (property-based testing) validam correção dos algoritmos. Monitoramento contínuo detecta anomalias.

**P: Qual o custo de infraestrutura?**
R: POC em SQLite (custo zero). Produção estimada: $200-500/mês (servidor + banco) para 10k usuários ativos.

---

## 10. Call to Action

### Para Investidores
- Mercado de e-commerce global: $5.7 trilhões (2023)
- Problema validado: 78% dos consumidores leem avaliações antes de comprar
- Solução escalável com IA proprietária

### Para Early Adopters
- Acesso antecipado ao MVP (Q2 2026)
- Influência no roadmap de features
- Comunidade de beta testers

### Para Desenvolvedores
- Stack moderna e bem documentada
- Testes automatizados (cobertura > 80%)
- Oportunidade de trabalhar com IA aplicada

---

## Contato

**Repositório:** [Link do GitHub]  
**Documentação Técnica:** `docs/PRD.md`  
**Mockups:** `docs/mock-product-page.png`  
**E-mail:** [seu-email]

---

**Obrigado pela atenção!**

*"Transformando avaliações em decisões inteligentes."*
