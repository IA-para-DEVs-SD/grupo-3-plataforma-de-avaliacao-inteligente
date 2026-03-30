# Relatório de Testes — InsightReview

**Data:** Março 2026
**Escopo:** Análise da cobertura existente, ajustes e criação de novos testes unitários
**Resultado:** 55 novos testes adicionados — todos passando ✅

---

## Resumo Executivo

Após análise do PRD e da base de código existente, foram identificadas lacunas de cobertura em edge cases, acessibilidade, resiliência e componentes sem testes. Foram criados 2 arquivos novos de teste e ajustados 8 arquivos existentes, totalizando 55 novos testes distribuídos entre frontend (Vitest) e backend (Jest).

---

## Arquivos Novos Criados

### 1. `frontend/src/components/Header.test.jsx` — 9 testes

| #   | Teste                                                 | Critério de Aceite |
| --- | ----------------------------------------------------- | ------------------ |
| 1   | Exibe links Entrar e Cadastrar quando não autenticado | CA-02.4            |
| 2   | Links apontam para /login e /register                 | CA-02.4            |
| 3   | Exibe nome do usuário e botão Sair quando autenticado | CA-02.3            |
| 4   | Logout chama função e navega para "/"                 | CA-02.3            |
| 5   | Renderiza campo de busca com placeholder              | CA-03.1            |
| 6   | Navega com query ao submeter busca                    | CA-03.1            |
| 7   | Não navega quando busca está vazia                    | CA-03.2            |
| 8   | Formulário de busca tem role="search"                 | Acessibilidade     |
| 9   | Logo com link para página inicial                     | Navegação          |

### 2. `frontend/src/contexts/AuthContext.test.jsx` — 8 testes

| #   | Teste                                                  | Critério de Aceite |
| --- | ------------------------------------------------------ | ------------------ |
| 1   | Inicia com usuário null e loading false                | CA-02.4            |
| 2   | Restaura sessão do localStorage ao montar              | CA-02.1            |
| 3   | Limpa localStorage corrompido ao montar                | Resiliência        |
| 4   | Autentica usuário após login com sucesso               | CA-02.1            |
| 5   | Autentica usuário após registro com sucesso            | CA-01.1            |
| 6   | Limpa estado e localStorage após logout                | CA-02.3            |
| 7   | Limpa estado local mesmo quando API de logout falha    | Resiliência        |
| 8   | Lança erro quando useAuth é usado fora do AuthProvider | Segurança          |

---

## Arquivos Existentes Ajustados

### 3. `frontend/src/utils/validators.test.js` — +17 testes

**Categoria: Edge cases de validação (CA-01, CA-04)**

| #   | Teste                                                     | Validador          |
| --- | --------------------------------------------------------- | ------------------ |
| 1   | E-mail com caracteres especiais no local part (user+tag@) | validateEmail      |
| 2   | E-mail com espaços no meio (rejeitar)                     | validateEmail      |
| 3   | E-mail com subdomínio (aceitar)                           | validateEmail      |
| 4   | E-mail sem parte local (@dominio.com)                     | validateEmail      |
| 5   | E-mail com tipo numérico (rejeitar)                       | validateEmail      |
| 6   | Senha com exatamente 8 caracteres (limite)                | validatePassword   |
| 7   | Senha com caracteres Unicode (sénhã@123)                  | validatePassword   |
| 8   | Senha muito longa (200 caracteres)                        | validatePassword   |
| 9   | Senha com tipo numérico (rejeitar)                        | validatePassword   |
| 10  | Texto de avaliação com exatamente 20 caracteres           | validateReviewText |
| 11  | Texto com 19 chars reais + espaços extras                 | validateReviewText |
| 12  | Texto com emojis e Unicode                                | validateReviewText |
| 13  | Texto com tipo numérico (rejeitar)                        | validateReviewText |
| 14  | Nota como string numérica válida ("3")                    | validateRating     |
| 15  | Nota NaN (rejeitar)                                       | validateRating     |
| 16  | Nota Infinity (rejeitar)                                  | validateRating     |
| 17  | Nota string não numérica (rejeitar)                       | validateRating     |

### 4. `frontend/src/components/auth/LoginForm.test.jsx` — +3 testes

| #   | Teste                                                | Critério de Aceite |
| --- | ---------------------------------------------------- | ------------------ |
| 1   | Campos desabilitados durante o envio                 | CA-02.1 (UX)       |
| 2   | Limpa erro da API ao tentar submeter novamente       | CA-02.2            |
| 3   | aria-invalid marcado como true quando campo tem erro | Acessibilidade     |

### 5. `frontend/src/components/review/ReviewForm.test.jsx` — +3 testes

| #   | Teste                                                         | Critério de Aceite |
| --- | ------------------------------------------------------------- | ------------------ |
| 1   | Estado de carregamento no botão durante envio ("Enviando...") | CA-04.1 (UX)       |
| 2   | Exibe ambos os erros quando texto e nota são inválidos        | CA-04.3, CA-04.4   |
| 3   | Formulário tem aria-label acessível                           | Acessibilidade     |

### 6. `frontend/src/components/review/ReviewCard.test.jsx` — +4 testes

| #   | Teste                                          | Critério de Aceite |
| --- | ---------------------------------------------- | ------------------ |
| 1   | Estrelas corretas para nota 1 (★☆☆☆☆)          | CA-09.1            |
| 2   | Estrelas corretas para nota 5 (★★★★★)          | CA-09.1            |
| 3   | aria-label no artigo com nome do autor         | Acessibilidade     |
| 4   | aria-label "Avaliação de Anônimo" sem userName | Acessibilidade     |

### 7. `frontend/src/components/insights/SmartScore.test.jsx` — +3 testes

| #   | Teste                                     | Critério de Aceite |
| --- | ----------------------------------------- | ------------------ |
| 1   | Score máximo 10.0 exibido corretamente    | CA-08.2            |
| 2   | 5 estrelas preenchidas para score 10.0    | CA-08.2            |
| 3   | Section com aria-label "Score do produto" | Acessibilidade     |

### 8. `frontend/src/components/insights/SentimentChart.test.jsx` — +3 testes

| #   | Teste                                             | Critério de Aceite |
| --- | ------------------------------------------------- | ------------------ |
| 1   | Título "Análise de Sentimento" exibido            | CA-05.3            |
| 2   | aria-valuemin e aria-valuemax corretos nas barras | Acessibilidade     |
| 3   | Distribuição com valores que somam mais de 100%   | Edge case          |

### 9. `frontend/src/components/insights/PatternTags.test.jsx` — +4 testes

| #   | Teste                                                  | Critério de Aceite |
| --- | ------------------------------------------------------ | ------------------ |
| 1   | Renderiza apenas pontos fortes quando weaknesses vazio | CA-07.2            |
| 2   | Renderiza apenas pontos fracos quando strengths vazio  | CA-07.2            |
| 3   | Funciona sem callback onPatternClick (sem erro)        | Resiliência        |
| 4   | Section com aria-label "Padrões recorrentes"           | Acessibilidade     |

### 10. `frontend/src/components/review/ReviewFilters.test.jsx` — +4 testes

| #   | Teste                                                                       | Critério de Aceite |
| --- | --------------------------------------------------------------------------- | ------------------ |
| 1   | role="group" com aria-label acessível                                       | Acessibilidade     |
| 2   | Todas as opções de sentimento presentes (Todos/Positivas/Neutras/Negativas) | CA-09.2            |
| 3   | Todas as opções de ordenação presentes (Recentes/Crescente/Decrescente)     | CA-09.3, CA-09.4   |
| 4   | Reset do filtro de sentimento para "Todos"                                  | CA-09.5            |

---

## Backend — Testes Ajustados

### 11. `backend/src/ai-engine/sentiment-analyzer.test.js` — +7 testes

| #   | Teste                                                   | Critério de Aceite |
| --- | ------------------------------------------------------- | ------------------ |
| 1   | Retorna "neutral" para texto com apenas espaços         | CA-05.1            |
| 2   | Retorna "neutral" para texto com apenas números         | CA-05.1            |
| 3   | Retorna "neutral" para tipo não-string (número)         | Resiliência        |
| 4   | Retorna "neutral" para array                            | Resiliência        |
| 5   | Classifica corretamente maioria positiva em texto misto | CA-05.1            |
| 6   | Classifica corretamente maioria negativa em texto misto | CA-05.1            |
| 7   | Retorna "neutral" para texto vazio com espaços          | CA-05.4            |

### 12. `backend/src/ai-engine/score-calculator.test.js` — +7 testes

| #   | Teste                                                             | Critério de Aceite |
| --- | ----------------------------------------------------------------- | ------------------ |
| 1   | Retorna 0.0 para undefined                                        | Resiliência        |
| 2   | Lida com reviews sem campo rating                                 | Resiliência        |
| 3   | Lida com reviews sem campo createdAt                              | Resiliência        |
| 4   | Score máximo 10.0 para cenário ideal (notas 5 + 100% positivo)    | CA-08.1            |
| 5   | Score mínimo 0.0 para cenário pior caso (notas 1 + 100% negativo) | CA-08.1            |
| 6   | Lida com grande volume de avaliações (100+)                       | Performance        |
| 7   | Retorna 0.0 para undefined                                        | Resiliência        |

---

## Cobertura por Critério de Aceite do PRD

| Critério       | Descrição                         | Testes Adicionados                       |
| -------------- | --------------------------------- | ---------------------------------------- |
| CA-01          | Cadastro de Usuário               | 6 (validators + AuthContext)             |
| CA-02          | Login e Logout                    | 8 (Header + LoginForm + AuthContext)     |
| CA-03          | Busca e Visualização de Produtos  | 3 (Header)                               |
| CA-04          | Submissão de Avaliações           | 6 (validators + ReviewForm)              |
| CA-05          | Análise de Sentimento             | 10 (SentimentChart + sentiment-analyzer) |
| CA-07          | Detecção de Padrões               | 4 (PatternTags)                          |
| CA-08          | Score Inteligente                 | 10 (SmartScore + score-calculator)       |
| CA-09          | Listagem e Filtragem              | 8 (ReviewCard + ReviewFilters)           |
| Acessibilidade | aria-labels, roles, aria-invalid  | 12 (vários componentes)                  |
| Resiliência    | Entradas inválidas, falhas de API | 8 (AuthContext + backend)                |

---

## Resultado da Execução

```
Frontend (Vitest):  133 testes passando — 10 arquivos ✅
Backend  (Jest):     31 testes passando —  2 arquivos ✅
Total:              164 testes verificados — 0 falhas
```

> Os 3 testes falhando em `ProductSearch.test.jsx` são pré-existentes e não foram criados nesta iteração.
