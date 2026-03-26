# PRD — InsightReview: Plataforma Inteligente de Avaliação de Produtos

**Versão:** 1.0
**Status:** Em desenvolvimento (POC)
**Última atualização:** Março 2026

---

## 1. Problema

### Contexto

O mercado de avaliações de produtos online enfrenta uma crise de confiança e usabilidade. Consumidores dependem cada vez mais de opiniões de outros usuários para tomar decisões de compra, mas o modelo atual de avaliações apresenta falhas estruturais que comprometem sua utilidade.

### Problemas Identificados

**Sobrecarga de informação**
Produtos populares acumulam centenas ou milhares de avaliações. O usuário não tem como processar esse volume de forma eficiente, resultando em decisões baseadas apenas nas primeiras avaliações exibidas ou na nota média — que pode ser enganosa.

**Falta de síntese confiável**
A média aritmética de notas não reflete a qualidade real de um produto. Uma nota 3.5 pode representar tanto um produto mediano quanto um produto polarizador com metade dos usuários adorando e metade odiando. Sem contexto, a nota isolada não informa.

**Dificuldade em identificar padrões**
Problemas recorrentes (ex: "bateria fraca", "atraso na entrega") e qualidades consistentes (ex: "ótimo custo-benefício") estão diluídos no texto das avaliações. O usuário precisa ler dezenas de comentários para identificar esses padrões manualmente.

**Avaliações sem contexto emocional**
Não há distinção visual entre uma avaliação entusiasmada, neutra ou negativa. O usuário precisa ler o texto completo para entender o tom de cada opinião.

### Impacto

Esses problemas resultam em:
- Decisões de compra mal informadas
- Desconfiança generalizada em plataformas de avaliação
- Tempo excessivo gasto na pesquisa de produtos
- Frustração pós-compra por expectativas não alinhadas

---

## 2. Personas

### Persona 1 — O Consumidor Pesquisador

**Nome fictício:** Carlos, 34 anos
**Perfil:** Profissional que pesquisa extensivamente antes de qualquer compra relevante. Lê múltiplas fontes, compara opções e valoriza informações objetivas.

**Comportamento:**
- Acessa a plataforma para consultar avaliações antes de decidir uma compra
- Quer entender rapidamente os pontos fortes e fracos de um produto
- Não tem tempo para ler todas as avaliações individualmente
- Desconfia de notas médias sem contexto

**Necessidades:**
- Resumo claro dos pontos positivos e negativos
- Indicador de confiabilidade da nota (não apenas média simples)
- Filtros para encontrar avaliações relevantes para seu caso de uso
- Visualização rápida da distribuição de opiniões

**Frustrações atuais:**
- Perder tempo lendo avaliações repetitivas
- Não saber se a nota reflete a maioria ou é distorcida por extremos
- Dificuldade em identificar se um problema específico é recorrente ou isolado

---

### Persona 2 — O Avaliador Engajado

**Nome fictício:** Ana, 28 anos
**Perfil:** Usuária ativa de plataformas digitais que gosta de contribuir com a comunidade compartilhando suas experiências de compra.

**Comportamento:**
- Submete avaliações detalhadas após usar produtos
- Quer que sua opinião seja valorizada e encontrada por outros usuários
- Verifica se sua avaliação foi publicada corretamente
- Retorna à plataforma para ver novas avaliações de produtos que já avaliou

**Necessidades:**
- Processo simples e rápido para submeter avaliações
- Confirmação visual de que sua avaliação foi publicada
- Feedback sobre a classificação de sentimento da sua avaliação
- Conta pessoal para gerenciar suas contribuições

**Frustrações atuais:**
- Formulários de avaliação complexos ou com muitos campos obrigatórios
- Falta de feedback após submissão
- Não saber se sua avaliação está sendo lida por outros usuários

---

### Persona 3 — O Cadastrador de Produtos

**Nome fictício:** Roberto, 42 anos
**Perfil:** Empreendedor ou entusiasta que quer adicionar produtos à plataforma para receber avaliações da comunidade.

**Comportamento:**
- Cadastra produtos que ainda não estão na plataforma
- Acompanha as avaliações e insights dos produtos que cadastrou
- Usa os insights de IA para entender a percepção do mercado

**Necessidades:**
- Formulário simples para cadastro de produtos com informações essenciais
- Visibilidade imediata do produto após cadastro
- Acesso aos insights gerados pela IA sobre o produto

**Frustrações atuais:**
- Produtos que deseja avaliar não estão disponíveis na plataforma
- Falta de dados agregados sobre percepção de produtos

---

## 3. Escopo Funcional

### 3.1 Autenticação e Gestão de Conta

Controle de acesso à plataforma com cadastro, login e logout de usuários.

| Funcionalidade | Descrição | Prioridade |
|---|---|---|
| Cadastro de usuário | Criação de conta com nome, e-mail e senha | Alta |
| Login | Autenticação com e-mail e senha, retorno de sessão JWT | Alta |
| Logout | Encerramento de sessão e redirecionamento | Alta |
| Proteção de rotas | Acesso a funcionalidades de escrita apenas para autenticados | Alta |

### 3.2 Catálogo de Produtos

Busca, visualização e cadastro de produtos na plataforma.

| Funcionalidade | Descrição | Prioridade |
|---|---|---|
| Busca de produtos | Pesquisa por nome ou categoria com resultados em tempo real | Alta |
| Página de detalhes | Exibição de nome, descrição, categoria, imagem e insights | Alta |
| Cadastro de produto | Adição de novos produtos por usuários autenticados | Média |
| Estado vazio | Mensagem amigável quando busca não retorna resultados | Alta |

### 3.3 Avaliações

Submissão, listagem, filtragem e ordenação de avaliações de produtos.

| Funcionalidade | Descrição | Prioridade |
|---|---|---|
| Submissão de avaliação | Texto (mín. 20 chars) + nota (1–5) por usuário autenticado | Alta |
| Listagem paginada | Avaliações ordenadas por data, 10 por página | Alta |
| Filtro por sentimento | Exibir apenas avaliações positivas, neutras ou negativas | Alta |
| Ordenação por nota | Reordenar avaliações por nota crescente ou decrescente | Média |
| Filtros combinados | Aplicar sentimento e ordenação simultaneamente | Média |
| Badge de sentimento | Indicador visual colorido por classificação em cada avaliação | Alta |

### 3.4 Motor de IA — Insights Automáticos

Processamento assíncrono de avaliações para geração de insights. Todos os processos ocorrem no backend sem dependência de serviços externos.

| Funcionalidade | Descrição | SLA | Threshold |
|---|---|---|---|
| Análise de sentimento | Classificação automática: positiva / neutra / negativa | 30s | 1 avaliação |
| Distribuição percentual | Percentual de cada sentimento no total de avaliações | 30s | 1 avaliação |
| Score Inteligente | Pontuação ponderada 0–10 (sentimento + recência + padrões) | 30s | 3 avaliações |
| Resumo automático | Síntese dos principais pontos positivos e negativos | 60s | 5 avaliações |
| Detecção de padrões | Tags de problemas e qualidades recorrentes | 120s | 10 avaliações |

### 3.5 Fora do Escopo (v1.0)

- Moderação de avaliações por administradores
- Respostas de fabricantes às avaliações
- Notificações por e-mail além da confirmação de cadastro
- Integração com redes sociais
- Avaliações de serviços (apenas produtos físicos/digitais)
- App mobile nativo

---

## 4. Critérios de Aceite

### CA-01: Cadastro de Usuário

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Usuário submete nome, e-mail válido e senha com mínimo 8 caracteres | Conta criada com sucesso; e-mail de confirmação enviado |
| 2 | Usuário tenta cadastrar com e-mail já existente | Mensagem de erro: "E-mail já está em uso" |
| 3 | Usuário submete e-mail com formato inválido | Mensagem de validação inline no campo e-mail |
| 4 | Usuário submete senha com menos de 8 caracteres | Mensagem de validação inline no campo senha |

### CA-02: Login e Logout

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Usuário submete credenciais válidas | Autenticado com sucesso; redirecionado para página principal |
| 2 | Usuário submete credenciais inválidas | Mensagem de erro: "Credenciais incorretas" (sem indicar qual campo) |
| 3 | Usuário autenticado clica em logout | Sessão encerrada; redirecionado para página de login |
| 4 | Usuário não autenticado tenta acessar rota protegida | Redirecionado para página de login |

### CA-03: Busca e Visualização de Produtos

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Usuário digita termo que corresponde a nome ou categoria de produto | Lista de produtos correspondentes exibida |
| 2 | Usuário digita termo sem correspondência | Mensagem: "Nenhum resultado encontrado" |
| 3 | Usuário seleciona produto na lista | Página de detalhes exibida com nome, descrição, categoria e imagem |
| 4 | Usuário autenticado cadastra produto com dados válidos | Produto disponível para busca e avaliação imediatamente |

### CA-04: Submissão de Avaliações

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Usuário autenticado submete texto ≥ 20 chars e nota entre 1–5 | Avaliação salva e exibida na página do produto |
| 2 | Usuário não autenticado tenta submeter avaliação | Redirecionado para página de login |
| 3 | Usuário submete texto com menos de 20 caracteres | Mensagem de validação: "Texto muito curto, detalhe mais sua experiência" |
| 4 | Usuário submete nota fora do intervalo 1–5 | Submissão rejeitada com mensagem de erro |

### CA-05: Análise de Sentimento

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Nova avaliação é salva | Sentimento classificado (positiva/neutra/negativa) em até 30 segundos |
| 2 | Usuário acessa página de produto com avaliações classificadas | Badge de sentimento exibido ao lado de cada avaliação |
| 3 | Usuário acessa página de produto | Distribuição percentual de sentimentos exibida (positivas X%, neutras Y%, negativas Z%) |
| 4 | Motor de IA falha ao classificar avaliação | Avaliação exibida sem badge; erro registrado no log do sistema |

### CA-06: Resumo Automático

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Produto atinge 5 avaliações | Resumo automático gerado em até 60 segundos com pontos positivos e negativos |
| 2 | Nova avaliação adicionada a produto com resumo existente | Resumo regenerado em até 60 segundos |
| 3 | Produto tem resumo disponível | Resumo exibido no topo da seção de avaliações |
| 4 | Produto tem menos de 5 avaliações | Mensagem: "Resumo disponível após mais avaliações" |

### CA-07: Detecção de Padrões Recorrentes

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Produto atinge 10 avaliações | Padrões recorrentes identificados em até 120 segundos |
| 2 | Padrões disponíveis | Tags exibidas separadas em "Pontos Fortes" e "Pontos Fracos" |
| 3 | Usuário clica em uma tag de padrão | Lista filtrada exibindo apenas avaliações que mencionam o padrão |
| 4 | Nova avaliação adicionada a produto com ≥ 10 avaliações | Padrões reanalisados em até 120 segundos |

### CA-08: Score Inteligente

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Produto atinge 3 avaliações | Score Inteligente calculado (ponderando sentimento, recência e padrões) em até 30 segundos |
| 2 | Score disponível | Exibido na escala 0–10 com uma casa decimal, ao lado da média aritmética simples |
| 3 | Nova avaliação adicionada | Score recalculado em até 30 segundos |
| 4 | Produto tem menos de 3 avaliações | Apenas média aritmética exibida com mensagem: "Score Inteligente disponível após 3 avaliações" |

### CA-09: Listagem e Filtragem de Avaliações

| # | Cenário | Resultado Esperado |
|---|---|---|
| 1 | Usuário acessa página de produto | Avaliações exibidas ordenadas por data decrescente, 10 por página |
| 2 | Usuário seleciona filtro de sentimento | Apenas avaliações com o sentimento selecionado são exibidas |
| 3 | Usuário seleciona ordenação por nota crescente | Avaliações reordenadas da menor para a maior nota |
| 4 | Usuário seleciona ordenação por nota decrescente | Avaliações reordenadas da maior para a menor nota |
| 5 | Usuário aplica filtro de sentimento e ordenação por nota simultaneamente | Ambos os critérios aplicados nos resultados exibidos |

---

## Restrições Técnicas

- Motor de IA integrado ao backend (sem chamadas a serviços externos de IA)
- Rate limiting obrigatório: 10 req/min por usuário em submissão de avaliações; 30 req/min por IP em endpoints de insights
- Validação de entrada obrigatória tanto no frontend (UX) quanto no backend (segurança)
- Stack traces não devem ser expostos em ambiente de produção
- Cache de resultados de IA para evitar reprocessamento desnecessário
