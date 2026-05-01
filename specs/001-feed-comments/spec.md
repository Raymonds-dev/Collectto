# Feature Specification: Comentários no Feed

**Feature Branch**: `feature/001-feed-comments`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "preciso que você adicionar a seguinte função na tela de feed: - Permtir visualizar comentários (adicione mocks se necessário seguindo a skill de mocks), o usuário ao clicar no botão de comentário deve permitir criar e visualizar os comentários, deixei por padrão um cometário visivel em cada item do feed para gerar curiosidade"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Teaser de comentários no feed (Priority: P1)

Como usuário, quero ver um comentário visível em cada item do feed para sentir curiosidade e entender rapidamente que aquele conteúdo já tem interação social.

**Why this priority**: Esse é o comportamento base da experiência e cria a entrada visual necessária antes de qualquer ação do usuário.

**Independent Test**: Pode ser testado carregando o feed e verificando que cada item apresenta pelo menos um comentário visível sem abrir nenhuma interação extra.

**Acceptance Scenarios**:

1. **Given** um item do feed com conteúdo disponível, **When** a tela é exibida, **Then** o item mostra pelo menos um comentário visível por padrão.
2. **Given** um item do feed sem comentários reais, **When** a tela é exibida, **Then** o item mostra uma opção de adicionar um comentário.

---

### User Story 2 - Abrir e ler comentários (Priority: P1)

Como usuário, quero tocar no botão de comentário e visualizar a lista completa de comentários daquele item sem sair do feed.

**Why this priority**: A leitura dos comentários é a função principal pedida e deve estar disponível com o menor atrito possível.

**Independent Test**: Pode ser testado tocando no botão de comentário de um item e conferindo se a área de comentários abre com conteúdo legível e contexto do item.

**Acceptance Scenarios**:

1. **Given** um item do feed com comentários, **When** o usuário toca no botão de comentário, **Then** a interface exibe os comentários daquele item.
2. **Given** um item do feed, **When** o usuário fecha a visualização de comentários, **Then** ele retorna ao feed no mesmo ponto de leitura.

---

### User Story 3 - Criar comentário no contexto do feed (Priority: P2)

Como usuário, quero escrever e publicar um comentário no próprio fluxo de comentários para interagir sem perder o contexto do item.

**Why this priority**: Criar comentário adiciona participação social, mas depende da capacidade de abrir e visualizar comentários primeiro.

**Independent Test**: Pode ser testado abrindo comentários, inserindo um texto e verificando se o comentário aparece imediatamente na lista.

**Acceptance Scenarios**:

1. **Given** a visualização de comentários aberta, **When** o usuário envia um comentário válido, **Then** o novo comentário aparece na lista do item.
2. **Given** a visualização de comentários aberta, **When** o usuário tenta enviar um comentário vazio, **Then** a ação não é concluída e a interface orienta o preenchimento.

---

### Edge Cases

- O item não possui comentários reais: a tela ainda mostra um comentário de demonstração para manter o teaser visual.
- O usuário abre comentários em um item com muitos comentários: a visualização deve continuar navegável sem bloquear a leitura do feed inteiro.
- O usuário tenta publicar texto vazio ou apenas espaços: o envio deve ser bloqueado.
- Os dados simulados não existem para um item: a interface deve manter a experiência do feed sem quebrar a tela.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O feed MUST exibir pelo menos um comentário visível em cada item para indicar atividade social de forma imediata.
- **FR-002**: O usuário MUST conseguir abrir a visualização de comentários ao tocar no botão de comentário de um item do feed.
- **FR-003**: A visualização de comentários MUST mostrar os comentários relacionados ao item atual sem trocar o usuário para uma área confusa ou sem contexto.
- **FR-004**: O usuário MUST conseguir escrever e publicar um novo comentário a partir da visualização de comentários.
- **FR-005**: Comentários vazios ou compostos apenas por espaços MUST ser rejeitados.
- **FR-006**: A experiência MUST funcionar com dados reais ou com comentários de demonstração quando não houver conteúdo suficiente para exibição.
- **FR-007**: Os comentários de demonstração MUST ser reutilizáveis quando a fonte de dados real não estiver disponível.
- **FR-008**: O comportamento de abertura, leitura e criação de comentários MUST preservar o contexto do item do feed.

### Key Entities _(include if feature involves data)_

- **Feed Item**: representa um conteúdo exibido no feed, incluindo referência para comentários associados e um comentário visível por padrão.
- **Comment**: representa uma mensagem curta vinculada a um item do feed, com autor, texto e tempo relativo ou indicação equivalente.
- **Comment Thread**: representa o conjunto de comentários de um item específico, incluindo a lista visível, o campo de criação e o estado de abertura.
- **Mock Comment Data**: representa os dados simulados usados para preencher a experiência quando não houver comentários reais suficientes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos itens do feed exibem ao menos um comentário visível quando a tela é carregada.
- **SC-002**: Pelo menos 90% dos usuários conseguem abrir a visualização de comentários com um único toque no botão de comentário.
- **SC-003**: Pelo menos 90% dos usuários conseguem publicar um comentário válido sem sair do contexto do item.
- **SC-004**: Nenhum item do feed fica visualmente sem interação social quando não houver comentários reais disponíveis.
- **SC-005**: O fluxo principal de visualizar e criar comentários pode ser concluído sem abrir uma nova tela desnecessária.

## Assumptions

- O feed já possui itens suficientes para exibir comentário teaser em cada cartão ou bloco.
- A primeira versão pode usar dados de demonstração reutilizáveis para simular comentários quando a fonte real ainda não estiver pronta.
- O comportamento prioritário é manter o usuário no contexto do feed, com navegação leve e abertura contextual.
- A experiência inicial é mobile-first e deve priorizar leitura rápida, toque confortável e retorno visual imediato.
