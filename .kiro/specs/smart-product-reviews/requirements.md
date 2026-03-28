# Documento de Requisitos

## Introdução

Plataforma web inteligente de avaliação de produtos que utiliza IA para organizar avaliações, gerar insights automáticos e ajudar usuários a tomar decisões de compra mais seguras. A plataforma combate o problema de avaliações falsas ou enviesadas, desorganização de informações e falta de clareza sobre pontos positivos e negativos dos produtos. Construída com React (frontend) e Node.js (backend).

## Glossário

- **Plataforma**: A aplicação web de avaliação de produtos, composta por frontend React e backend Node.js
- **Usuário**: Pessoa que acessa a Plataforma para consultar ou submeter avaliações de produtos
- **Avaliação**: Registro textual e numérico (nota de 1 a 5) submetido por um Usuário sobre um Produto
- **Produto**: Item de qualquer marca cadastrado na Plataforma que pode receber Avaliações
- **Motor_de_IA**: Componente do backend responsável por processar Avaliações usando inteligência artificial
- **Resumo_Automático**: Síntese gerada pelo Motor_de_IA a partir de múltiplas Avaliações de um Produto
- **Análise_de_Sentimento**: Classificação gerada pelo Motor_de_IA que categoriza uma Avaliação como positiva, neutra ou negativa
- **Score_Inteligente**: Pontuação calculada pelo Motor_de_IA que pondera fatores como sentimento, recência e padrões detectados, resultando em uma nota mais confiável que a média aritmética simples
- **Padrão_Recorrente**: Problema ou qualidade identificado pelo Motor_de_IA que aparece com frequência significativa nas Avaliações de um Produto
- **Badge_de_Sentimento**: Indicador visual colorido exibido ao lado de cada Avaliação que representa a classificação de sentimento (verde para positiva, cinza para neutra, vermelho para negativa)
- **Cache_de_IA**: Armazenamento temporário em memória dos resultados processados pelo Motor_de_IA para evitar reprocessamento desnecessário
- **Rate_Limiting**: Mecanismo de controle de taxa de requisições que limita o número de chamadas por período de tempo para proteger o sistema contra abuso

## Requisitos

### Requisito 1: Cadastro e Autenticação de Usuários

**User Story:** Como um Usuário, eu quero me cadastrar e autenticar na Plataforma, para que eu possa submeter e gerenciar minhas Avaliações.

#### Critérios de Aceitação

1. WHEN um Usuário submete dados válidos de cadastro (nome não vazio, e-mail com formato válido e senha com mínimo de 8 caracteres), THE Plataforma SHALL criar a conta e enviar um e-mail de confirmação
2. WHEN um Usuário submete credenciais válidas no formulário de login, THE Plataforma SHALL autenticar o Usuário e redirecionar para a página principal
3. IF um Usuário submete credenciais inválidas, THEN THE Plataforma SHALL exibir uma mensagem de erro informando que as credenciais estão incorretas, sem revelar qual campo está errado
4. IF um Usuário tenta cadastrar um e-mail já existente, THEN THE Plataforma SHALL exibir uma mensagem informando que o e-mail já está em uso
5. WHEN um Usuário autenticado solicita logout, THE Plataforma SHALL encerrar a sessão e redirecionar para a página de login
6. IF um Usuário submete um e-mail com formato inválido no cadastro, THEN THE Plataforma SHALL exibir uma mensagem de validação inline no campo e-mail
7. IF um Usuário submete uma senha com menos de 8 caracteres no cadastro, THEN THE Plataforma SHALL exibir uma mensagem de validação inline no campo senha
8. IF um Usuário não autenticado tenta acessar uma rota protegida, THEN THE Plataforma SHALL redirecionar o Usuário para a página de login

### Requisito 2: Cadastro e Busca de Produtos

**User Story:** Como um Usuário, eu quero buscar e visualizar produtos na Plataforma, para que eu possa encontrar o produto que desejo avaliar ou consultar.

#### Critérios de Aceitação

1. WHEN um Usuário digita um termo no campo de busca, THE Plataforma SHALL retornar uma lista de Produtos cujo nome ou categoria corresponda ao termo pesquisado
2. WHEN um Usuário seleciona um Produto na lista de resultados, THE Plataforma SHALL exibir a página de detalhes do Produto com nome, descrição, categoria e imagem
3. IF nenhum Produto corresponder ao termo pesquisado, THEN THE Plataforma SHALL exibir uma mensagem informando que nenhum resultado foi encontrado
4. WHEN um Usuário autenticado submete os dados de um novo Produto (nome, descrição, categoria e imagem), THE Plataforma SHALL cadastrar o Produto e torná-lo disponível para busca e avaliação

### Requisito 3: Submissão de Avaliações

**User Story:** Como um Usuário autenticado, eu quero submeter avaliações sobre produtos, para que eu possa compartilhar minha experiência com outros Usuários.

#### Critérios de Aceitação

1. WHILE um Usuário está autenticado, THE Plataforma SHALL permitir a submissão de uma Avaliação contendo texto (mínimo 20 caracteres) e nota (1 a 5) para um Produto
2. WHEN um Usuário submete uma Avaliação válida, THE Plataforma SHALL salvar a Avaliação e exibi-la na página do Produto
3. IF um Usuário não autenticado tenta submeter uma Avaliação, THEN THE Plataforma SHALL redirecionar o Usuário para a página de login
4. IF o texto da Avaliação contém menos de 20 caracteres, THEN THE Plataforma SHALL exibir uma mensagem de validação solicitando um texto mais detalhado
5. IF a nota submetida está fora do intervalo de 1 a 5, THEN THE Plataforma SHALL rejeitar a submissão e exibir uma mensagem de erro

### Requisito 4: Análise de Sentimento das Avaliações

**User Story:** Como um Usuário, eu quero ver a classificação de sentimento das avaliações, para que eu possa identificar rapidamente opiniões positivas e negativas.

#### Critérios de Aceitação

1. WHEN uma nova Avaliação é salva, THE Motor_de_IA SHALL classificar a Avaliação como positiva, neutra ou negativa em até 30 segundos
2. THE Plataforma SHALL exibir um Badge_de_Sentimento ao lado de cada Avaliação na página do Produto, utilizando cores distintas: verde para positiva, cinza para neutra e vermelho para negativa
3. WHEN um Usuário acessa a página de um Produto, THE Plataforma SHALL exibir a distribuição percentual de Avaliações positivas, neutras e negativas
4. IF o Motor_de_IA não conseguir classificar uma Avaliação, THEN THE Plataforma SHALL exibir a Avaliação sem classificação de sentimento e registrar o erro no log do sistema

### Requisito 5: Resumo Automático de Avaliações

**User Story:** Como um Usuário, eu quero ver um resumo automático das avaliações de um produto, para que eu possa entender rapidamente os pontos principais sem ler todas as avaliações.

#### Critérios de Aceitação

1. WHEN um Produto possui 5 ou mais Avaliações, THE Motor_de_IA SHALL gerar um Resumo_Automático contendo os principais pontos positivos e negativos
2. WHEN uma nova Avaliação é adicionada a um Produto que já possui Resumo_Automático, THE Motor_de_IA SHALL regenerar o Resumo_Automático em até 60 segundos
3. THE Plataforma SHALL exibir o Resumo_Automático no topo da seção de avaliações na página do Produto
4. IF o Produto possui menos de 5 Avaliações, THEN THE Plataforma SHALL exibir uma mensagem informando que o resumo estará disponível após mais avaliações

### Requisito 6: Detecção de Padrões Recorrentes

**User Story:** Como um Usuário, eu quero ver padrões recorrentes identificados nas avaliações, para que eu possa entender problemas e qualidades frequentes de um produto.

#### Critérios de Aceitação

1. WHEN um Produto possui 10 ou mais Avaliações, THE Motor_de_IA SHALL identificar Padrões_Recorrentes nas Avaliações do Produto
2. THE Plataforma SHALL exibir os Padrões_Recorrentes como tags na página do Produto, separados em "Pontos Fortes" e "Pontos Fracos"
3. WHEN um Usuário clica em um Padrão_Recorrente, THE Plataforma SHALL exibir as Avaliações que mencionam o padrão selecionado
4. WHEN uma nova Avaliação é adicionada a um Produto com 10 ou mais Avaliações, THE Motor_de_IA SHALL reanalisar os Padrões_Recorrentes em até 120 segundos

### Requisito 7: Score Inteligente de Produto

**User Story:** Como um Usuário, eu quero ver um score inteligente do produto, para que eu possa confiar em uma avaliação mais precisa do que a média simples das notas.

#### Critérios de Aceitação

1. WHEN um Produto possui 3 ou mais Avaliações, THE Motor_de_IA SHALL calcular o Score_Inteligente ponderando sentimento, recência e padrões detectados
2. THE Plataforma SHALL exibir o Score_Inteligente na página do Produto em uma escala de 0 a 10 com uma casa decimal
3. WHEN uma nova Avaliação é adicionada, THE Motor_de_IA SHALL recalcular o Score_Inteligente do Produto em até 30 segundos
4. THE Plataforma SHALL exibir a média aritmética simples ao lado do Score_Inteligente para comparação
5. IF o Produto possui menos de 3 Avaliações, THEN THE Plataforma SHALL exibir apenas a média aritmética simples e informar que o Score_Inteligente requer mais avaliações

### Requisito 8: Listagem e Filtragem de Avaliações

**User Story:** Como um Usuário, eu quero filtrar e ordenar as avaliações de um produto, para que eu possa encontrar as opiniões mais relevantes para minha decisão.

#### Critérios de Aceitação

1. WHEN um Usuário acessa a página de um Produto, THE Plataforma SHALL exibir as Avaliações ordenadas por data de criação (mais recentes primeiro) com paginação de 10 itens por página
2. WHEN um Usuário seleciona um filtro de sentimento (positiva, neutra ou negativa), THE Plataforma SHALL exibir apenas as Avaliações com a classificação selecionada
3. WHEN um Usuário seleciona ordenação por nota, THE Plataforma SHALL reordenar as Avaliações pela nota atribuída (crescente ou decrescente)
4. WHEN um Usuário aplica filtros e ordenação simultaneamente, THE Plataforma SHALL combinar os critérios e exibir os resultados correspondentes

### Requisito 9: Rate Limiting de Requisições

**User Story:** Como operador da Plataforma, eu quero limitar a taxa de requisições por usuário e por IP, para que o sistema fique protegido contra abuso e sobrecarga.

#### Critérios de Aceitação

1. THE Plataforma SHALL limitar a submissão de Avaliações a 10 requisições por minuto por Usuário autenticado
2. THE Plataforma SHALL limitar o acesso aos endpoints de insights de IA a 30 requisições por minuto por endereço IP
3. IF um Usuário excede o limite de taxa de requisições, THEN THE Plataforma SHALL retornar um erro HTTP 429 com mensagem informando que o limite foi excedido
4. THE Plataforma SHALL aplicar Rate_Limiting de forma independente por endpoint, sem que o consumo de um endpoint afete o limite de outro

### Requisito 10: Cache de Resultados de IA

**User Story:** Como operador da Plataforma, eu quero que os resultados processados pelo Motor de IA sejam armazenados em cache, para que o sistema evite reprocessamento desnecessário e responda com menor latência.

#### Critérios de Aceitação

1. THE Plataforma SHALL armazenar em Cache_de_IA os resultados de Análise_de_Sentimento, Resumo_Automático, Padrões_Recorrentes e Score_Inteligente de cada Produto
2. WHEN uma nova Avaliação é adicionada a um Produto, THE Plataforma SHALL invalidar o Cache_de_IA do Produto correspondente para forçar o reprocessamento
3. WHEN um Usuário solicita insights de um Produto cujo Cache_de_IA está válido, THE Plataforma SHALL retornar os resultados do cache sem acionar o Motor_de_IA
4. THE Plataforma SHALL registrar no campo de data de atualização do cache o momento do último processamento bem-sucedido

### Requisito 11: Validação Dupla de Entrada

**User Story:** Como operador da Plataforma, eu quero que todas as entradas de dados sejam validadas tanto no frontend quanto no backend, para que a experiência do Usuário seja fluida e o sistema esteja protegido contra dados malformados.

#### Critérios de Aceitação

1. THE Plataforma SHALL validar todas as entradas de formulários no frontend com mensagens de validação inline antes do envio ao servidor
2. THE Plataforma SHALL validar todas as entradas recebidas no backend independentemente da validação do frontend, retornando erro HTTP 422 com detalhes dos campos inválidos
3. IF o backend detecta dados inválidos que passaram pela validação do frontend, THEN THE Plataforma SHALL rejeitar a requisição e registrar o evento no log do sistema
4. THE Plataforma SHALL sanitizar todas as entradas de texto no backend antes de processar ou persistir os dados
