# Especificação de Funcionalidade: Melhorias em Autenticação, Itens e Coleções (Frontend)

**Branch da Funcionalidade**: `016-auth-items-collections`  
**Criado**: 2026-06-09  
**Status**: Draft  
**Input**: Descrição do usuário: "Quero implementar os seguintes pontos: - Aplicar o refresh token que foi implementadado em /auth/refresh esse endpoint valida o refresh e o /auth/login retorna agora o \"refreshToken\". - Agora é possível mover itens mudando o \"collectionId\" passando o uuid da nova coleção atráves do PATCH do endpoint /items/{itemId} - Ao criar uma coleção agora é possível escolher a visibilidade dela, antes só poderia alterar via PATCH."

## Esclarecimentos

### Sessão 2026-06-09
- Q: Como o frontend gerencia requisições de API concorrentes feitas enquanto a chamada de `/auth/refresh` está ativa? → A: Fila de Espera (Queue): enfileirar todas as requisições subsequentes e reexecutá-las sequencialmente com o novo token após o sucesso do refresh.
- Q: Como o usuário deve interagir com a interface para mover um item para outra coleção? → A: Tela de Edição do Item: A seleção da coleção de destino é feita por meio de um seletor (dropdown/picker) dentro do formulário da tela de Edição do Item.
- Q: O aplicativo deve permitir realizar ações offline e sincronizá-las posteriormente, ou deve exigir conexão ativa? → A: Apenas Online: Exibir mensagem de erro ou desabilitar ações de criação e edição se o dispositivo estiver offline.

## Cenários de Usuário & Testes *(obrigatório)*

### Caso de Uso 1 - Fluxo de Autenticação com Refresh Token (Prioridade: P1)

Como usuário do aplicativo, quero que minha sessão permaneça ativa sem a necessidade de reinserir minhas credenciais constantemente, para que eu tenha uma experiência de uso contínua e fluida.

**Por que esta prioridade**: Alto valor para segurança e experiência do usuário (UX). Impede a expiração da sessão ativa enquanto mantém o tempo de vida do token de acesso curto.

**Teste Independente**: Fazer login com credenciais válidas, receber tokens de acesso (accessToken) e atualização (refreshToken). Usar o refresh token para solicitar um novo accessToken sem reinserir usuário/senha.

**Cenários de Aceitação**:

1. **Dado** um usuário registrado, **Quando** ele solicitar o login via `/auth/login` com credenciais corretas, **Então** o sistema retornará um `accessToken` e um `refreshToken` no corpo da resposta.
2. **Dado** um `accessToken` expirado e um `refreshToken` válido, **Quando** o cliente chamar o endpoint `/auth/refresh` enviando o `refreshToken`, **Então** o sistema retornará um novo `accessToken` válido e um novo `refreshToken` (comportamento de rotação de token).
3. **Dado** um `refreshToken` inválido ou já utilizado anteriormente no processo de rotação, **Quando** o cliente chamar `/auth/refresh`, **Então** o sistema retornará um status 401 Unauthorized.

---

### Caso de Uso 2 - Mover Itens para uma Coleção Diferente (Prioridade: P1)

Como usuário do aplicativo, quero abrir a tela de edição de um item e alterar sua coleção associada através de um seletor para movê-lo de pasta.

**Por que esta prioridade**: Funcionalidade essencial para organização de conteúdo. Evita o retrabalho de excluir e recriar itens em outras pastas.

**Teste Independente**: Abrir o formulário de edição de um item, alterar o seletor de coleção para outra coleção de destino, salvar e verificar se o item foi movido.

**Cenários de Aceitação**:

1. **Dado** que o usuário está na tela de Edição de um item na Coleção A, **Quando** ele selecionar a Coleção B no campo de seleção e salvar as alterações, **Então** o app enviará uma requisição PATCH para `/items/{itemId}` contendo o novo `collectionId` e atualizará o item para a Coleção B com sucesso.
2. **Dado** um item existente, **Quando** o usuário tentar atualizar o item via PATCH para `/items/{itemId}` com um `collectionId` inexistente ou inválido (não UUID), **Então** o sistema retornará um erro 404 Not Found ou 400 Bad Request e o item permanecerá na coleção original.
3. **Dado** uma Coleção B pertencente a outro usuário (sem compartilhamento), **Quando** o usuário tentar mover um item para essa Coleção B via PATCH, **Então** o sistema retornará um erro 403 Forbidden.

---

### Caso de Uso 3 - Definir Visibilidade ao Criar Coleção (Prioridade: P2)

Como usuário do aplicativo, quero definir a visibilidade da minha coleção no momento da criação, para evitar exposição acidental ou a necessidade de uma requisição separada de configuração.

**Por que esta prioridade**: Otimiza a jornada de criação de coleções e garante a privacidade/compartilhamento correto desde o início.

**Teste Independente**: Enviar uma requisição POST de criação de coleção especificando visibilidade como "FRIENDS", e verificar se a coleção é persistida com o status correto.

**Cenários de Aceitação**:

1. **Dado** um usuário autenticado, **Quando** ele fizer uma requisição POST para criar uma coleção com `visibility` igual a "PUBLIC" ou "FRIENDS", **Então** a coleção será criada imediatamente com a visibilidade escolhida.
2. **Dado** um usuário autenticado, **Quando** ele fizer uma requisição POST para criar uma coleção sem especificar o campo `visibility`, **Então** a coleção será criada por padrão com visibilidade "PRIVATE".
3. **Dado** um usuário autenticado, **Quando** ele tentar criar uma coleção com um valor de `visibility` inválido (diferente de PUBLIC, PRIVATE ou FRIENDS), **Então** o sistema retornará um erro 400 Bad Request.

---

### Casos de Borda

- **Refresh Token Expirado/Inexistente**: Como o sistema lida se o refresh token expirar? O cliente será forçado a se autenticar novamente com credenciais.
- **Formato de Visibilidade Incorreto**: Como o sistema trata maiúsculas/minúsculas no campo `visibility` (ex: "public" vs "PUBLIC")? Deve aceitar de forma insensível a maiúsculas/minúsculas (case-insensitive) ou padronizar em caixa alta na validação.
- **Movimentação Concorrente**: Se o item for apagado ou movido simultaneamente por outro dispositivo, a operação atual de movimentação deve retornar um erro amigável de não encontrado (404).
- **Requisições Simultâneas no Refresh**: Requisições de API disparadas enquanto o refresh silencioso está em andamento são suspensas em uma fila de espera para evitar múltiplas requisições de refresh concorrentes que violariam a rotação de token.
- **Ausência de Conexão (Offline)**: Se o NetInfo detectar que o dispositivo está offline, as ações de mover itens e criar coleções devem ser desabilitadas ou exibir um aviso claro de falha de conexão.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE retornar tanto o `accessToken` quanto o `refreshToken` na resposta de sucesso do endpoint `/auth/login`.
- **FR-002**: O endpoint `/auth/refresh` DEVE validar o `refreshToken` fornecido e retornar um novo `accessToken` válido.
- **FR-003**: O endpoint `/auth/refresh` DEVE aplicar a rotação de token, gerando um novo `refreshToken` a cada requisição de refresh e invalidando o refresh token anterior.
- **FR-004**: O backend NÃO realizará a revogação de tokens de forma persistente; ao efetuar logout, a remoção dos tokens ocorrerá exclusivamente no lado do cliente (frontend).
- **FR-005**: O endpoint PATCH `/items/{itemId}` DEVE aceitar a alteração do campo `collectionId`.
- **FR-006**: O endpoint PATCH `/items/{itemId}` DEVE validar se a coleção de destino existe e pertence ao mesmo usuário autenticado antes de processar a alteração.
- **FR-007**: O endpoint de criação de coleção (POST `/collections`) DEVE aceitar o campo `visibility` na carga da requisição (payload).
- **FR-008**: O endpoint de criação de coleção DEVE aceitar e validar os seguintes níveis de visibilidade: `PUBLIC`, `PRIVATE` e `FRIENDS`.
- **FR-009**: Caso o campo `visibility` seja omitido na criação de uma coleção, a visibilidade padrão DEVE ser configurada como `PRIVATE`.
- **FR-010**: O frontend DEVE enfileirar requisições de API subsequentes ou que falharem com 401 enquanto uma operação de refresh de token estiver ativa, executando-as em sequência com o novo token após a conclusão bem-sucedida do refresh.
- **FR-011**: O frontend DEVE fornecer um seletor de coleções (picker/dropdown) na tela de Edição do Item para permitir que o usuário altere a coleção do item.
- **FR-012**: O frontend DEVE desabilitar as ações de movimentação de itens e criação de coleções ou exibir uma mensagem de erro apropriada caso o dispositivo não possua conexão ativa com a internet.

### Entidades Principais

- **Sessão/Tokens**:
  - `accessToken`: JWT de curta duração para acesso aos recursos protegidos.
  - `refreshToken`: Token rotativo de longa duração usado para obter novos accessTokens.
- **Item**:
  - `itemId`: Identificador único UUID do item.
  - `collectionId`: Chave estrangeira que define a qual coleção o item está associado.
- **Coleção**:
  - `collectionId`: Identificador único UUID da coleção.
  - `visibility`: Enumeração de visibilidade (`PUBLIC`, `PRIVATE`, `FRIENDS`).

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: 100% das sessões expiradas podem ser renovadas silenciosamente via `/auth/refresh` em menos de 300ms, sem interrupção para o usuário.
- **SC-002**: Mover um item para outra coleção é concluído em uma única chamada de API (PATCH `/items/{itemId}`), eliminando a necessidade de múltiplas etapas de remoção e recriação.
- **SC-003**: Usuários podem definir a visibilidade das coleções no ato da criação em uma única etapa, reduzindo o número de interações/requisições necessárias de 2 para 1.

## Premissas e Suposições

- O frontend implementará o fluxo de exclusão local dos tokens no ato do logout do usuário.
- A modelagem do banco de dados para coleções suporta o tipo enumerado contendo `PUBLIC`, `PRIVATE` e `FRIENDS`.
- A mudança de coleção de um item atualiza exclusivamente a relação lógica, sem a necessidade de mover arquivos físicos no servidor.
- O aplicativo requer uma conexão activa com a internet para realizar alterações nos itens e coleções (criação e movimentação offline estão fora do escopo).
