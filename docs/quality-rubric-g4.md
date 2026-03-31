# Rubrica de Qualidade - ConectaTalentos

**Projeto:** ConectaTalentos - Sistema de Ranqueamento de Currículos com IA  
**Grupo:** 4  
**Pontuação Total:** 100 pontos

---

## 📊 Distribuição de Pontos

| Categoria | Pontos | Peso |
|-----------|--------|------|
| Qualidade de Código | 30 | 30% |
| Clareza de Documentação | 20 | 20% |
| Segurança | 20 | 20% |
| Organização do Repositório GitHub | 30 | 30% |
| **TOTAL** | **100** | **100%** |

---

## 1. Qualidade de Código (30 pontos)

### 1.1 Padrões de Código (10 pontos)

**Critérios:**
- [ ] **Nomenclatura consistente** (2 pontos)
  - Classes em PascalCase
  - Funções/variáveis em snake_case
  - Constantes em UPPER_SNAKE_CASE
  
- [ ] **Formatação com Black** (2 pontos)
  - Código formatado automaticamente
  - Linha máxima: 88 caracteres
  - Sem erros de formatação

- [ ] **Linting com Ruff** (3 pontos)
  - Sem erros de linting (E, W, F)
  - Imports ordenados (isort)
  - Sem código deprecated (UP)

- [ ] **Type hints** (3 pontos)
  - Funções públicas com type hints
  - Uso de tipos modernos (list, dict ao invés de List, Dict)
  - Uso de X | None ao invés de Optional[X]

### 1.2 Arquitetura e Organização (10 pontos)

**Critérios:**
- [ ] **Separação de camadas** (4 pontos)
  - Controllers (rotas HTTP)
  - Services (lógica de negócio)
  - Repositories (acesso a dados)
  - Processors (processamento especializado)

- [ ] **Princípios SOLID** (3 pontos)
  - Single Responsibility
  - Dependency Injection
  - Interface Segregation

- [ ] **Estrutura de pastas** (3 pontos)
  - Organização lógica
  - Separação backend/frontend
  - Testes organizados (unit/integration)

### 1.3 Testes (10 pontos)

**Critérios:**
- [ ] **Cobertura de testes** (4 pontos)
  - Cobertura mínima: 70%
  - Testes unitários para services
  - Testes de integração para APIs

- [ ] **Qualidade dos testes** (3 pontos)
  - Testes focados em comportamento
  - Nomenclatura clara (test_comportamento_esperado)
  - Uso de fixtures e mocks apropriados

- [ ] **Testes automatizados** (3 pontos)
  - Pytest configurado
  - Testes executam sem erros
  - Property-based testing (hypothesis) quando aplicável

---

## 2. Clareza de Documentação (20 pontos)

### 2.1 README e Documentação Geral (8 pontos)

**Critérios:**
- [ ] **README completo** (3 pontos)
  - Descrição clara do projeto
  - Instruções de instalação
  - Como executar o projeto
  - Lista de integrantes

- [ ] **Documentação técnica** (3 pontos)
  - Arquitetura do sistema
  - Diagramas UML/fluxogramas
  - Decisões de design documentadas

- [ ] **Guias de contribuição** (2 pontos)
  - CONTRIBUTING.md
  - Padrões do projeto (PADROES.md)
  - Fluxo Git (Gitflow)

### 2.2 Documentação de Código (7 pontos)

**Critérios:**
- [ ] **Docstrings** (4 pontos)
  - Todas as funções públicas documentadas
  - Formato Google/NumPy style
  - Args, Returns, Raises documentados

- [ ] **Comentários úteis** (3 pontos)
  - Explicam "por quê", não "o quê"
  - Comentários atualizados
  - Sem comentários óbvios

### 2.3 Documentação de API (5 pontos)

**Critérios:**
- [ ] **Swagger/OpenAPI** (2 pontos)
  - Documentação automática gerada
  - Endpoints documentados
  - Schemas de request/response

- [ ] **Exemplos de uso** (2 pontos)
  - Exemplos de requisições
  - Casos de uso documentados
  - Códigos de erro explicados

- [ ] **Guia de instalação** (1 ponto)
  - Pré-requisitos claros
  - Passo a passo funcional
  - Troubleshooting comum

---

## 3. Segurança (20 pontos)

### 3.1 Conformidade LGPD (8 pontos)

**Critérios:**
- [ ] **Anonimização de dados** (4 pontos)
  - Microsoft Presidio implementado
  - Dados sensíveis anonimizados (CPF, nome, endereço)
  - Logs sem informações pessoais

- [ ] **Consentimento e transparência** (2 pontos)
  - Política de privacidade
  - Termos de uso
  - Informações sobre processamento de dados

- [ ] **Direitos do titular** (2 pontos)
  - Possibilidade de exclusão de dados
  - Acesso aos dados processados
  - Portabilidade de dados

### 3.2 Segurança de Aplicação (7 pontos)

**Critérios:**
- [ ] **Validação de entrada** (3 pontos)
  - Validação com Pydantic
  - Sanitização de inputs
  - Proteção contra injection

- [ ] **Gestão de credenciais** (2 pontos)
  - Variáveis de ambiente (.env)
  - Sem credenciais no código
  - .env.example atualizado

- [ ] **Tratamento de erros** (2 pontos)
  - Erros não expõem informações sensíveis
  - Logging apropriado
  - Mensagens de erro genéricas para usuário

### 3.3 Segurança de Arquivos (5 pontos)

**Critérios:**
- [ ] **Validação de PDFs** (3 pontos)
  - Verificação de magic number
  - Limite de tamanho
  - Limite de páginas

- [ ] **Armazenamento seguro** (2 pontos)
  - Arquivos fora do webroot
  - Nomes de arquivo sanitizados
  - Permissões apropriadas

---

## 4. Organização do Repositório GitHub (30 pontos)

### 4.1 Estrutura e Organização (10 pontos)

**Critérios:**
- [ ] **Estrutura de pastas** (3 pontos)
  - Organização lógica e clara
  - Separação adequada (app/, backend/, docs/, tests/)
  - Arquivos de configuração no lugar correto

- [ ] **Nomenclatura** (2 pontos)
  - Nomes de arquivos descritivos
  - Padrão consistente (snake_case, kebab-case)
  - Sem caracteres especiais problemáticos

- [ ] **Arquivos essenciais** (3 pontos)
  - README.md completo
  - .gitignore apropriado
  - requirements.txt atualizado
  - .env.example presente

- [ ] **Organização de branches** (2 pontos)
  - Gitflow implementado (main, develop, feature/*)
  - Branches com nomes descritivos
  - Branches antigas removidas

### 4.2 Issues e Project Management (10 pontos)

**Critérios:**
- [ ] **Issues bem estruturadas** (4 pontos)
  - Títulos claros e descritivos
  - Descrição detalhada com contexto
  - Labels apropriadas (bug, feature, docs, etc.)
  - Assignees definidos

- [ ] **GitHub Projects** (3 pontos)
  - Board configurado (To Do, In Progress, Done)
  - Issues vinculadas ao projeto
  - Progresso visível e atualizado

- [ ] **Milestones** (2 pontos)
  - Milestones criadas para entregas
  - Issues associadas a milestones
  - Datas de entrega definidas

- [ ] **Templates** (1 ponto)
  - Issue template configurado
  - Pull request template configurado

### 4.3 Pull Requests e Code Review (10 pontos)

**Critérios:**
- [ ] **Qualidade dos PRs** (4 pontos)
  - Títulos seguindo conventional commits
  - Descrição detalhada com contexto
  - Checklist de validação
  - Screenshots/exemplos quando aplicável

- [ ] **Code Review** (3 pontos)
  - PRs revisados antes do merge
  - Comentários construtivos
  - Aprovações registradas
  - Discussões técnicas documentadas

- [ ] **Histórico de commits** (2 pontos)
  - Commits semânticos (conventional commits)
  - Mensagens descritivas
  - Commits atômicos (uma mudança por commit)
  - Sem commits de "fix" ou "wip" no main/develop

- [ ] **Integração contínua** (1 ponto)
  - GitHub Actions configurado (se aplicável)
  - Testes automatizados em PRs
  - Status checks configurados

---

## 📋 Checklist de Avaliação

### Antes da Entrega

- [ ] Executar `ruff check .` sem erros críticos
- [ ] Executar `black .` para formatar código
- [ ] Executar `pytest --cov` com cobertura ≥ 70%
- [ ] Verificar todos os links da documentação
- [ ] Testar fluxo completo da aplicação
- [ ] Validar responsividade em diferentes dispositivos
- [ ] Revisar conformidade LGPD
- [ ] Verificar se não há credenciais expostas

### Critérios de Aprovação

| Pontuação | Conceito | Status |
|-----------|----------|--------|
| 90-100 | Excelente | ⭐⭐⭐⭐⭐ |
| 80-89 | Ótimo | ⭐⭐⭐⭐ |
| 70-79 | Bom | ⭐⭐⭐ |
| 60-69 | Satisfatório | ⭐⭐ |
| < 60 | Insatisfatório | ⭐ |

---

## 🎯 Metas de Qualidade

### Mínimo Aceitável (60 pontos)
- Código funcional sem erros críticos
- Documentação básica (README)
- Segurança básica (validação de inputs)
- Repositório organizado com estrutura básica

### Bom (70-79 pontos)
- Código bem estruturado
- Documentação completa
- Segurança implementada (LGPD básica)
- Repositório com issues e PRs organizados

### Ótimo (80-89 pontos)
- Código com padrões consistentes
- Documentação detalhada com exemplos
- Segurança robusta (LGPD completa)
- Repositório profissional com project board

### Excelente (90-100 pontos)
- Código exemplar (SOLID, testes, type hints)
- Documentação profissional
- Segurança de nível produção
- Repositório exemplar com CI/CD e gestão completa

---

## 📝 Notas

- Esta rubrica serve como guia de qualidade para o projeto
- Cada critério deve ser avaliado objetivamente
- Pontuações parciais podem ser atribuídas
- Feedback construtivo deve acompanhar a avaliação

---

**Última atualização:** 2026-03-30  
**Versão:** 1.0  
**Responsável:** Grupo 4 - ConectaTalentos