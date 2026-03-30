# Lint e Formatação — InsightReview

## Ferramentas

| Ferramenta | Versão | Função |
|---|---|---|
| ESLint | ^8.57.1 | Análise estática de código (lint) |
| Prettier | ^3.8.1 | Formatação automática de código |
| eslint-config-prettier | ^10.1.8 | Desabilita regras do ESLint que conflitam com Prettier |

A configuração é centralizada na raiz do monorepo e compartilhada entre frontend e backend.

---

## ESLint

Arquivo de configuração: `eslint.config.js` (flat config, ESM).

### Plugins

| Plugin | Escopo | Função |
|---|---|---|
| eslint-plugin-react | Frontend (`frontend/**`) | Regras específicas para React/JSX |
| eslint-plugin-react-hooks | Frontend (`frontend/**`) | Regras para hooks do React |
| eslint-config-prettier | Global | Desativa regras de formatação que conflitam com Prettier |

### Regras Globais (backend + frontend)

| Regra | Nível | Detalhe |
|---|---|---|
| `no-unused-vars` | warn | Ignora variáveis/argumentos prefixados com `_` |
| `no-console` | off | `console.log` permitido |
| `no-undef` | error | Variáveis não declaradas são erro |
| `prefer-const` | warn | Preferir `const` quando possível |
| `no-var` | error | Proibido usar `var` |
| `eqeqeq` | error | Obrigatório usar `===` e `!==` (sempre) |

### Regras React (frontend)

| Regra | Nível | Detalhe |
|---|---|---|
| `react/react-in-jsx-scope` | off | Não exige import do React (React 18+) |
| `react/prop-types` | off | PropTypes não são exigidos |
| `react/jsx-no-target-blank` | error | Proibido `target="_blank"` sem `rel="noreferrer"` |
| `react/jsx-uses-vars` | error | Evita falsos positivos de variáveis não usadas em JSX |
| `react-hooks/rules-of-hooks` | error | Hooks devem seguir as regras do React |
| `react-hooks/exhaustive-deps` | warn | Alerta sobre dependências faltantes em hooks |

### Regras para Testes

Arquivos `*.test.js`, `*.test.jsx` e `__tests__/**` recebem:
- Globais do Jest/Vitest (`describe`, `it`, `expect`, `vi`, etc.) como `readonly`
- `no-unused-vars` desabilitado

### Arquivos Ignorados pelo ESLint

- `**/node_modules/**`
- `**/dist/**`
- `**/build/**`
- `**/coverage/**`

---

## Prettier

Arquivo de configuração: `.prettierrc`

| Opção | Valor | Descrição |
|---|---|---|
| `semi` | `true` | Ponto e vírgula obrigatório |
| `singleQuote` | `true` | Aspas simples para strings JS |
| `trailingComma` | `"es5"` | Vírgula final em objetos/arrays (compatível ES5) |
| `printWidth` | `100` | Largura máxima da linha: 100 caracteres |
| `tabWidth` | `2` | Indentação com 2 espaços |
| `arrowParens` | `"always"` | Parênteses sempre em arrow functions: `(x) => x` |
| `endOfLine` | `"lf"` | Quebra de linha Unix (LF) |
| `bracketSpacing` | `true` | Espaço dentro de chaves: `{ foo }` |
| `jsxSingleQuote` | `false` | Aspas duplas em atributos JSX |

### Arquivos Ignorados pelo Prettier (`.prettierignore`)

- `node_modules`
- `dist`
- `build`
- `coverage`
- `package-lock.json`
- `*.md`

---

## Comandos Disponíveis

### Raiz do monorepo

```bash
npm run lint          # Executa ESLint em todo o projeto
npm run lint:fix      # Executa ESLint com correção automática
npm run format        # Formata todo o projeto com Prettier
npm run format:check  # Verifica formatação sem alterar arquivos
```

### Frontend (`frontend/`)

```bash
npm run lint          # ESLint em src/
npm run lint:fix      # ESLint com fix em src/
npm run format        # Prettier em src/
npm run format:check  # Verifica formatação em src/
```

### Backend (`backend/`)

```bash
npm run lint          # ESLint em src/
npm run lint:fix      # ESLint com fix em src/
npm run format        # Prettier em src/
npm run format:check  # Verifica formatação em src/
```

---

## Convenções Adotadas

- `var` é proibido — usar `const` (preferencial) ou `let`
- Comparações sempre com `===` / `!==`
- Strings JS com aspas simples, atributos JSX com aspas duplas
- Indentação: 2 espaços
- Linha máxima: 100 caracteres
- Ponto e vírgula obrigatório
- Quebra de linha: LF (Unix)
- PropTypes não são exigidos (projeto não usa TypeScript nem PropTypes)
- `console.log` é permitido (útil para debug em fase de POC)
- Variáveis prefixadas com `_` são ignoradas pelo lint de variáveis não usadas
