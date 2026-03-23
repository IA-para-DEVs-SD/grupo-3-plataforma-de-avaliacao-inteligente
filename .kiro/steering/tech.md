---
inclusion: always
---

# Stack Tecnológica

## Frontend
- React (functional components com hooks)
- Gerenciamento de estado: Context API ou hooks nativos
- Estilização: CSS modules ou styled-components
- Requisições HTTP: fetch ou axios

## Backend
- Node.js com Express
- API RESTful
- Validação de entrada: express-validator ou joi
- Tratamento de erros centralizado

## Motor de IA
Componente integrado ao backend responsável por:
- Análise de sentimento: classificação em positiva/neutra/negativa (SLA: 30s)
- Geração de resumos: síntese automática de avaliações (SLA: 60s)
- Detecção de padrões: identificação de problemas/qualidades recorrentes (SLA: 120s)
- Score inteligente: cálculo ponderado 0-10 (SLA: 30s)

## Idioma e Localização

- Documentação: Português brasileiro
- Comentários de código: Português brasileiro
- Mensagens de usuário: Português brasileiro
- Nomes de variáveis/funções: inglês (convenção padrão)
- Commits: português brasileiro

## Convenções de Código

### React
- Usar functional components com hooks
- Props: desestruturação no parâmetro da função
- Nomenclatura de componentes: PascalCase
- Nomenclatura de arquivos de componentes: PascalCase.jsx
- Handlers de eventos: prefixo "handle" (ex: handleClick)
- Custom hooks: prefixo "use" (ex: useReviews)

### Node.js
- Usar async/await ao invés de callbacks
- Nomenclatura de arquivos: kebab-case
- Nomenclatura de funções/variáveis: camelCase
- Constantes: UPPER_SNAKE_CASE
- Modularização: separar rotas, controllers, services, models

## Validação e Segurança

- Validar todas as entradas no frontend (UX)
- Validar todas as entradas no backend (segurança)
- Sanitizar dados antes de processar
- Implementar rate limiting para endpoints de IA
- Usar HTTPS em produção
- Não expor stack traces em produção

## Performance

- Implementar cache para resultados de IA quando apropriado
- Lazy loading de componentes React pesados
- Otimizar queries de banco de dados
- Comprimir respostas HTTP (gzip)

## Comandos

Projeto em fase inicial - comandos serão adicionados conforme implementação avança.
