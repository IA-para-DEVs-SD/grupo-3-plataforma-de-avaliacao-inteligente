# Evidência de Prompts — InsightReview

Registro dos prompts utilizados durante o desenvolvimento do projeto com auxílio de IA (Kiro).

---

## Prompt 1 — Plano de ação para implementação

**Ferramenta:** Kiro (Spec Workflow)

**Prompt:**
> Baseado na documentação do projeto, especificações e tecnologias a serem utilizadas, monte o plano de ação para implementação. Partiremos de features individuais/tasklists.

**Resultado:** Geração do `design.md` com arquitetura, modelos de dados, 24 propriedades de corretude e estratégia de testes, e do `tasks.md` com 9 features progressivas cobrindo backend, frontend e testes para cada funcionalidade.

---

## Prompt 2 — Commit e criação de branch

**Ferramenta:** Kiro (Git)

**Prompt:**
> Agora eu quero que vc faça o commit destas atualizações. Crie uma branch chamada feature/tasks e faça o commit nela.

**Resultado:** Branch `feature/tasks` criada localmente e publicada no repositório remoto com os arquivos `design.md`, `tasks.md` e `.config.kiro`.

---

## Prompt 3 — Commit de todos os arquivos atualizados

**Ferramenta:** Kiro (Git)

**Prompt:**
> Faça o commit de todos os meus arquivos atualizados/criados para a branch feature/tasks.

**Resultado:** Commit dos steering files (`product.md`, `structure.md`, `tech.md`) e `README.md` na branch `feature/tasks`, seguido de push para o repositório remoto.

---

## Prompt 4 — Instalação do Git Flow

**Ferramenta:** Kiro (Terminal)

**Prompt:**
> Instale o git flow.

**Resultado:** Identificado que o Git Flow não estava instalado. Foram apresentadas duas opções de instalação: via Git Bash (gitflow-avh) ou via Chocolatey. A instalação não foi concluída automaticamente por requerer permissão de administrador.

---

## Prompt 5 — Estrutura base do projeto e ajustes na documentação

**Ferramenta:** Kiro (Geração de código e documentação)

**Prompt:**
> Baseado no arquivo `estrutura.md`, crie a estrutura base do projeto para o backend e o frontend. Além disso, faça também os ajustes na documentação. Adicione os nomes dos componentes do grupo, que são: Emesson Cavalcante, Denis Mendes Valgas, Lucas Almeida, Marco Aurélio Alencastro, Diego Roberto da Silva.

**Resultado:**
- Estrutura de diretórios do `backend` criada (`routes`, `controllers`, `services`, `models`, `ai-engine`, `middleware`, `database`) com `package.json`, `server.js` e `.env.example`
- Estrutura de diretórios do `frontend` criada (`components`, `hooks`, `contexts`, `services`, `utils`) com `package.json` e `App.jsx`
- `README.md` atualizado com sumário, estrutura de diretórios, tecnologias, instruções de instalação e tabela de integrantes
- Commit e push realizados na branch `feature/atualizacao-de-projeto`

---

## Prompt 6 — Geração do PRD

**Ferramenta:** Kiro (Documentação de produto)

**Prompt:**
> Você é um PM Senior, e com base nas user stories do arquivo requirements.md, gere um arquivo PRD.md. Seções solicitadas: problema, personas, escopo funcional, critérios de aceite.

**Resultado:** Arquivo `docs/PRD.md` criado com:
- Seção de problema com 4 problemas identificados e impacto
- 3 personas (Carlos — consumidor pesquisador, Ana — avaliadora engajada, Roberto — cadastrador de produtos)
- Escopo funcional em 5 módulos com tabelas de prioridade e SLAs
- 9 grupos de critérios de aceite (CA-01 a CA-09) mapeados diretamente dos requisitos
- Commit e push realizados

---

## Prompt 7 — Commit e PR para develop

**Ferramenta:** Kiro (Git)

**Prompt:**
> Faça o commit na branch atual e depois faça o PR para a branch develop.

**Resultado:** Verificado que não havia arquivos pendentes. PR criado via GitHub CLI da branch `feature/atualizacao-de-projeto` para `develop` (PR #17).

---

## Prompt 8 — Criação do arquivo de evidência de prompts

**Ferramenta:** Kiro (Documentação)

**Prompt:**
> Quero que vc crie um arquivo chamado prompts.md que será a evidência dos prompts usados até o momento.

**Resultado:** Este arquivo (`docs/prompts.md`).
