# Feature Specification: integrate-social-feed

**Feature Branch**: `feature/017-integrate-social-feed`  
**Created**: 2026-06-11  
**Status**: Draft  
**Input**: User description: "Quero integrar a tela de feed/home. Onde aparecerá os itens e as pessoas poderam interagir dando curtidas, comentando e compartilhando. ALém de ser direcionadas para a coleção do item."

## Clarifications

### Session 2026-06-11

- Q: Visibilidade de itens de coleções privadas no feed → A: A API do backend já é responsável por gerenciar e filtrar a visibilidade de itens privados/públicos.
- Q: Formato do Compartilhamento de Itens → A: Apenas o texto descritivo e título do item (sem link).
- Q: Moderação e Exclusão de Comentários no Feed → A: Autores podem apenas excluir seus comentários (edição indisponível no MVP).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visualização de Itens no Feed Principal (Priority: P1)

Como colecionador autenticado, quero visualizar um feed com os itens recentemente adicionados por outros colecionadores, para descobrir novas coleções e itens interessantes.

**Why this priority**: É a funcionalidade central do feed. Sem a exibição correta dos itens, não há conteúdo para as interações sociais.

**Independent Test**: Pode ser testado abrindo o aplicativo na tela Home (Feed) e verificando se os itens cadastrados no sistema aparecem listados com imagem, título, autor e descrição básica.

**Acceptance Scenarios**:

1. **Given** que o usuário está autenticado e na tela inicial, **When** o feed carrega, **Then** o sistema exibe uma lista de itens em ordem cronológica reversa (mais recentes primeiro).
2. **Given** que a lista de itens está vazia, **When** o usuário acessa o feed, **Then** o sistema exibe uma mensagem amigável informando que nenhum item foi encontrado e sugere explorar ou adicionar itens.
3. **Given** que o usuário rola a tela para baixo, **When** atinge o limite inferior, **Then** o sistema carrega mais itens de forma paginada e não destrutiva (mantendo a posição atual do scroll).
4. **Given** que o usuário está no meio do feed, **When** ele puxa a lista para baixo (Pull-to-refresh), **Then** o sistema recarrega e adiciona apenas novos posts no topo, sem apagar o feed atual se não houver novidades.

---

### User Story 2 - Curtir Itens no Feed (Priority: P1)

Como colecionador autenticado, quero dar "curtida" nos itens do feed, para demonstrar apreço por um item ou coleção de outro usuário.

**Why this priority**: É a interação social mais básica e direta que promove engajamento entre os usuários.

**Independent Test**: Pode ser testado tocando no botão de curtir (coração) em um item no feed, verificando se o ícone muda de estado visualmente (ex: cor) e o contador de curtidas incrementa ou decrementa corretamente.

**Acceptance Scenarios**:

1. **Given** que um item não está curtido pelo usuário ativo, **When** o usuário toca no botão de curtir, **Then** o sistema altera o ícone para o estado ativo e incrementa o contador de curtidas em 1.
2. **Given** que um item já está curtido pelo usuário ativo, **When** o usuário toca no botão de curtir (descurtir), **Then** o sistema altera o ícone para o estado inativo e decrementa o contador de curtidas em 1.
3. **Given** que o usuário interage rapidamente com o botão de curtir, **When** ocorre uma falha na requisição ao backend, **Then** o sistema reverte o estado visual e o contador para o valor anterior e exibe uma mensagem amigável de erro.

---

### User Story 3 - Comentar em Itens (Priority: P2)

Como colecionador autenticado, quero comentar nos itens exibidos no feed, para trocar informações sobre o item, fazer perguntas ou elogiar a coleção do colega.

**Why this priority**: Comentários permitem a comunicação direta entre os usuários, enriquecendo o aspecto de comunidade do aplicativo.

**Independent Test**: Pode ser testado tocando no botão de comentário de um item, o que deve abrir a janela de comentários (modal ou bottom sheet), permitindo ler os comentários existentes e enviar um novo.

**Acceptance Scenarios**:

1. **Given** que o usuário toca no botão de comentário de um item, **When** a interface de comentários abre, **Then** o sistema carrega a lista de comentários específicos daquele item em ordem cronológica.
2. **Given** que a interface de comentários está aberta, **When** o usuário escreve um comentário válido e envia, **Then** o comentário é adicionado à lista em tempo real e o contador de comentários no feed é atualizado.
3. **Given** que o usuário tenta enviar um comentário vazio, **When** toca em enviar, **Then** o sistema desabilita o envio ou avisa que o comentário não pode estar vazio.

---

### User Story 4 - Compartilhar Itens (Priority: P2)

Como colecionador, quero compartilhar um item do feed com amigos fora da plataforma, para divulgar itens raros ou interessantes.

**Why this priority**: O compartilhamento externo ajuda na atração de novos usuários e engajamento fora do ecossistema do app.

**Independent Test**: Pode ser testado tocando no botão de compartilhar de um item no feed, verificando se a folha de compartilhamento nativa do sistema operacional (Android/iOS) é exibida.

**Acceptance Scenarios**:

1. **Given** que o usuário toca no botão de compartilhar em um item, **When** o sistema aciona o compartilhamento, **Then** a folha de compartilhamento nativa do sistema operacional é exibida com um texto contendo informações sobre o item e o autor.

---

### User Story 5 - Redirecionamento para a Coleção do Item (Priority: P1)

Como colecionador, quero tocar no nome da coleção associada a um item no feed e ser direcionado para a tela de detalhes dessa coleção, para ver todos os outros itens relacionados.

**Why this priority**: Crucial para a descoberta de conteúdo dentro do app, permitindo ao usuário aprofundar-se no acervo do colecionador.

**Independent Test**: Pode ser testado tocando na etiqueta/nome da coleção no card do item no feed e verificando se o app navega com sucesso para a rota daquela coleção específica.

**Acceptance Scenarios**:

1. **Given** que o usuário está visualizando um card de item no feed, **When** ele toca no nome da coleção ou no botão correspondente, **Then** o sistema redireciona o usuário para a tela de detalhes da respectiva coleção (`/collections/[collectionId]`).

---

### Edge Cases

- **Sem Conexão com a Internet**: O sistema deve exibir indicadores de que está offline, desabilitar ações de alteração de estado (como curtir e comentar) e exibir as imagens em cache sempre que possível.
- **Redirecionamento para Coleção Privada ou Inexistente**: Caso o dono da coleção a tenha tornado privada ou excluído após o feed carregar, ao tentar navegar, o usuário deve receber uma mensagem de erro ("Coleção indisponível") e permanecer no feed.
- **Scroll Infinito com Conexão Lenta**: Se o usuário rolar rapidamente e a próxima página de itens demorar para carregar, um esqueleto (skeleton component) ou indicador de progresso deve ser exibido, impedindo requisições duplicadas.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma lista de itens postados por usuários da plataforma em ordem cronológica de publicação (feed).
- **FR-002**: Cada item do feed DEVE apresentar informações básicas: foto do autor, nome/username do autor, imagem do item, título do item, nome da coleção associada, descrição (se houver), quantidade de curtidas, quantidade de comentários e data de publicação amigável (ex: "há 2 horas").
- **FR-003**: O sistema DEVE permitir que um usuário autenticado curta ou descurta qualquer item no feed (ação reversível), atualizando a contagem imediatamente na interface.
- **FR-004**: O sistema DEVE fornecer um modal ou aba dedicada para visualização, publicação e exclusão de comentários, sendo a exclusão de uso exclusivo do próprio autor do comentário.
- **FR-005**: O sistema DEVE permitir o compartilhamento de um item contendo título, descrição e autor por meio de texto simples na API de compartilhamento nativa do sistema operacional (Android/iOS), sem links externos.
- **FR-006**: O sistema DEVE redirecionar o usuário para a rota `/collections/[collectionId]` ao clicar no nome da coleção associada ao item.
- **FR-007**: A paginação do feed DEVE ser implementada utilizando paginação sob demanda (`onEndReached` e `onEndReachedThreshold`) com tratamento para evitar requisições in-flight duplicadas.
- **FR-008**: O recarregamento do feed via gesto "pull-to-refresh" DEVE atualizar os itens sem perda abrupta da posição do usuário se nenhum post novo for adicionado.

### Key Entities _(include if feature involves data)_

- **FeedPost (Post)**: Representa uma publicação no feed associada a um item de uma coleção.
  - Atributos: `id`, `authorId`, `itemId`, `content`, `createdAt`, `likesCount`, `commentsCount`.
- **Item**: O item que foi catalogado pelo usuário e está sendo exibido.
  - Atributos: `id`, `name`, `description`, `collectionId`, `imageFilesUrls`.
- **Collection (Coleção)**: O grupo/pasta que contém o item.
  - Atributos: `id`, `name`, `userId`, `isPrivate`.
- **Comment (Comentário)**: Representa uma interação textual em um item do feed.
  - Atributos: `id`, `postId`, `userId`, `content`, `createdAt`.
- **Like (Curtida)**: Relação entre um usuário e uma publicação do feed para controle de engajamento.
  - Atributos: `id`, `postId`, `userId`, `createdAt`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: O feed deve renderizar os primeiros posts na tela em menos de 1,5 segundos a partir do momento em que a aba Home é aberta em conexões estáveis.
- **SC-002**: A navegação da tela de feed para a tela de detalhes da coleção (`/collections/[collectionId]`) deve ocorrer em menos de 500 milissegundos após o clique do usuário.
- **SC-003**: 98% das interações de curtidas devem ser persistidas com sucesso na API e refletidas sem erros de concorrência ou inconsistência visual.
- **SC-004**: O consumo de dados móveis deve ser otimizado através de compressão de imagens em cache e carregamento em lotes (máximo de 10 itens por página inicial).

## Assumptions

- Presume-se que o usuário já esteja autenticado na plataforma para realizar ações de curtir e comentar. Usuários convidados podem visualizar o feed e compartilhar itens, mas são direcionados ao login ao tentar curtir/comentar.
- Os serviços de backend para likes, comentários e dados das coleções estão disponíveis e possuem endpoints documentados correspondentes.
- A navegação utiliza o Expo Router seguindo a estrutura de rotas baseadas em arquivos existente no projeto.
- As imagens dos itens no feed serão servidas por uma CDN ou serviço de storage que suporta cache local no dispositivo do usuário para evitar downloads repetidos.
- A API do backend é responsável por filtrar a visibilidade dos itens de coleções privadas, garantindo que o feed retorne apenas itens que o usuário ativo tem permissão para visualizar.
