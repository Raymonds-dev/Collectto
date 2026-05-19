# Feature Specification: Collection and Item Management

**Feature Branch**: `005-collection-item-management`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "Quero poder editar as minhas coleções e itens existente que são da minha propriedade, na tela respectiva de cada um.

Quero poder clicar nos tres pontos e editar minha coleção podendo alterar visibilidade, nome, descrição, foto de capa e tags, além de poder excluir uma coleção inteira podendo mover os itens para a coleção "sem categoria" ou excluir todos os itens. Quero poder editar meus itens podendo alterar, nome, atributos/caracteristica, data de acquisição, data de uso, tags, descrição e adiconar ou remover fotos, além de poder excluir aquele item ou mover para uma nova coleção ou uma existente.

---

Quero que a tela de edição do iten seja similar a tela de criação para fazer a edição.
Quero que a tela de categoria seja similiar ao modal de criação de categoria, porém como cheia.

---

Na tela de editar a coleção quero poder ver todos os itens e selecionar varios deles podendo excluir em massa ou mover em massa."

## Clarifications

### Session 2026-05-18

- Q: Como deve ser a visibilidade das coleções? → A: Opção A — enum `PUBLIC` / `PRIVATE` / `FRIENDS` (Default: `PRIVATE`).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Editar e excluir minha coleção (Priority: P1)

Como pessoa proprietária de uma coleção, quero abrir o menu de três pontos na tela da coleção e editar nome, descrição, visibilidade, foto de capa e tags, para manter minhas coleções corretas ao longo do tempo.

**Why this priority**: A coleção é a unidade principal de organização. Sem a edição da coleção, o usuário não consegue corrigir metadados nem ajustar o conteúdo associado.

**Independent Test**: A pessoa proprietária abre a tela da coleção, acessa a edição pelo menu de três pontos, altera os dados permitidos, salva e vê a coleção atualizada. Também consegue iniciar a exclusão da coleção e escolher o destino dos itens.

**Acceptance Scenarios**:

1. **Given** que a pessoa é dona da coleção, **When** abre o menu de ações da coleção, **Then** vê opções de editar e excluir.
2. **Given** que a pessoa está editando uma coleção, **When** altera nome, descrição, visibilidade, foto de capa e tags e salva, **Then** a coleção é atualizada com os novos valores.
3. **Given** que a pessoa escolhe excluir uma coleção com itens, **When** confirma a exclusão, **Then** o sistema permite mover os itens para a coleção "sem categoria" ou para outra coleção existente, ou excluir todos os itens junto com a coleção.
4. **Given** que a pessoa não é dona da coleção, **When** abre a tela da coleção, **Then** não vê ações de edição ou exclusão.

---

### User Story 2 - Editar e excluir meu item (Priority: P1)

Como pessoa proprietária de um item, quero abrir o menu de três pontos na tela do item e editar seus dados em uma tela parecida com a de criação, para corrigir ou enriquecer as informações sem perder contexto.

**Why this priority**: A edição de itens é essencial para manter dados úteis e atualizados, especialmente porque o usuário pode descobrir novas informações depois da criação.

**Independent Test**: A pessoa abre o item, entra na edição, altera campos permitidos, adiciona ou remove fotos, salva e vê as mudanças refletidas imediatamente. Também consegue mover o item para outra coleção ou excluí-lo.

**Acceptance Scenarios**:

1. **Given** que a pessoa é dona do item, **When** abre o menu de ações do item, **Then** vê opções de editar, mover e excluir.
2. **Given** que a pessoa está na tela de edição do item, **When** altera nome, atributos, data de aquisição, data de uso, tags, descrição e fotos, **Then** as alterações são salvas no item.
3. **Given** que a pessoa edita um item, **When** escolhe mover para uma coleção nova ou existente, **Then** o item passa a pertencer à coleção selecionada.
4. **Given** que a pessoa confirma a exclusão de um item, **When** conclui a ação, **Then** o item é removido do acervo da pessoa.
5. **Given** que a pessoa não é dona do item, **When** abre a tela do item, **Then** não vê ações de edição, movimentação ou exclusão.

---

### User Story 3 - Gerenciar itens em massa dentro da coleção (Priority: P2)

Como pessoa proprietária de uma coleção, quero visualizar todos os itens da coleção na tela de edição e selecionar vários deles para mover ou excluir em massa, para organizar grandes volumes de itens com menos esforço.

**Why this priority**: O gerenciamento em massa reduz trabalho repetitivo e é especialmente importante em coleções grandes, mas depende da edição individual já estar funcionando.

**Independent Test**: A pessoa abre a tela de edição da coleção, seleciona vários itens, executa uma ação em massa e confirma que todos os itens selecionados sofreram o mesmo resultado.

**Acceptance Scenarios**:

1. **Given** que a pessoa está editando uma coleção, **When** a tela carrega, **Then** todos os itens dessa coleção aparecem disponíveis para seleção.
2. **Given** que a pessoa selecionou vários itens, **When** escolhe mover em massa, **Then** o sistema permite escolher uma coleção de destino e aplica a mudança a todos os itens selecionados.
3. **Given** que a pessoa selecionou vários itens, **When** escolhe excluir em massa, **Then** o sistema solicita confirmação e remove todos os itens selecionados.
4. **Given** que nenhum item está selecionado, **When** a pessoa tenta executar uma ação em massa, **Then** a ação fica indisponível ou é bloqueada com feedback claro.

---

### Edge Cases

- O que acontece quando a pessoa tenta editar uma coleção ou item que não é dela? A interface deve ficar em modo somente leitura e esconder ações destrutivas.
- O que acontece quando a pessoa exclui uma coleção que possui itens? O sistema deve exigir a escolha entre mover os itens para "sem categoria" ou outra coleção ou excluir todos antes de confirmar.
- O que acontece quando a pessoa remove todas as fotos de um item? O sistema deve impedir o salvamento até que pelo menos uma foto permaneça ou seja adicionada outra.
- O que acontece quando a pessoa tenta mover um item para a mesma coleção atual? O sistema deve tratar a operação como sem efeito e evitar duplicidade de mudança.
- O que acontece quando há muitos itens na coleção? A lista deve continuar utilizável e permitir seleção múltipla sem perda de estado.
- O que acontece quando a coleção de destino não existe mais? O sistema deve cancelar a ação e informar o erro sem perder a edição em andamento.
- O que acontece quando a pessoa cancela a edição depois de alterar vários campos? O sistema deve descartar as mudanças não salvas e manter os dados originais.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema MUST permitir que a pessoa proprietária abra as ações de uma coleção por meio do menu de três pontos na tela respectiva da coleção.
- **FR-002**: O sistema MUST ocultar ou desabilitar ações de edição, movimentação e exclusão para pessoas que não sejam proprietárias da coleção ou do item.
- **FR-003**: A tela de edição da coleção MUST permitir atualização de visibilidade, nome, descrição, foto de capa e tags.
- **FR-004**: A tela de edição da coleção MUST apresentar uma lista completa dos itens pertencentes à coleção para seleção individual e múltipla.
- **FR-005**: O sistema MUST permitir que a exclusão de uma coleção seja concluída apenas após a escolha de como tratar seus itens vinculados: mover para "sem categoria" ou outra coleção ou excluir todos os itens.
- **FR-006**: O sistema MUST aplicar a decisão escolhida na exclusão de coleção a todos os itens vinculados de forma consistente.
- **FR-007**: A tela de edição do item MUST reutilizar a estrutura principal da tela de criação, já preenchida com os dados atuais do item.
- **FR-008**: A tela de edição do item MUST permitir atualização de nome, atributos/características, data de aquisição, data de uso, tags, descrição e fotos.
- **FR-009**: A tela de edição do item MUST permitir adicionar novas fotos e remover fotos existentes antes de salvar.
- **FR-010**: A tela de edição do item MUST permitir mover o item para uma coleção nova ou para uma coleção existente.
- **FR-011**: O sistema MUST permitir a exclusão de um item somente após confirmação explícita da pessoa proprietária.
- **FR-012**: O sistema MUST permitir seleção múltipla de itens na tela de edição de coleção para ações em massa.
- **FR-013**: O sistema MUST permitir mover em massa os itens selecionados para outra coleção ou para "sem categoria".
- **FR-014**: O sistema MUST permitir excluir em massa os itens selecionados após confirmação explícita.
- **FR-015**: O sistema MUST impedir ações em massa quando nenhum item estiver selecionado e deve exibir feedback claro.
- **FR-016**: O sistema MUST preservar os dados originais da coleção ou do item até que a pessoa confirme o salvamento das alterações.
- **FR-017**: O sistema MUST manter a integridade da tela de edição quando houver falha na operação de carregamento ou de salvamento, exibindo erro recuperável.
- **FR-018**: O sistema MUST garantir que os itens movidos para "sem categoria" fiquem acessíveis em um agrupamento padrão de organização do usuário.

### Key Entities

- **Collection**: Agrupador de itens pertencente a uma pessoa, com nome, descrição, visibilidade, foto de capa, tags e itens associados.
- **Item**: Unidade individual do acervo, com nome, descrição, atributos, tags, datas, fotos e vínculo com uma coleção.
- **BulkSelection**: Conjunto transitório de itens marcados na tela de edição de coleção para mover ou excluir em massa.
- **Ownership**: Relação entre a pessoa autenticada e a coleção ou item, usada para liberar ou bloquear ações de edição e exclusão.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% das ações de edição e exclusão ficam disponíveis apenas para a pessoa proprietária do item ou da coleção.
- **SC-002**: Pelo menos 95% das pessoas conseguem abrir a tela de edição de coleção ou item e chegar ao formulário correto em até 2 segundos.
- **SC-003**: 100% das alterações salvas em coleção ou item aparecem refletidas na tela respectiva imediatamente após a confirmação.
- **SC-004**: Pessoas conseguem editar um item com seus campos principais e concluir a tarefa em menos de 2 minutos na maioria dos casos de uso.
- **SC-005**: A exclusão de uma coleção sempre oferece e aplica corretamente as duas opções de tratamento dos itens vinculados, sem perda silenciosa de dados.
- **SC-006**: A seleção e execução de ações em massa em uma coleção funcionam corretamente para grupos de até 50 itens sem deixar itens parcialmente processados.
- **SC-007**: Pelo menos 90% dos usuários que usam a tela de edição da coleção conseguem localizar e operar as ações em massa sem ajuda adicional.

## Assumptions

- Apenas a pessoa dona da coleção ou do item pode editar, mover ou excluir aquele recurso.
- "Sem categoria" existe como destino padrão gerenciado pelo sistema para receber itens removidos de uma coleção excluída.
- A tela de edição do item usa a mesma estrutura visual da criação, com campos já preenchidos a partir dos dados atuais.
- A exclusão de item é definitiva após confirmação; não há lixeira ou restauração nesta entrega.
- A edição de item mantém a regra de que deve existir pelo menos uma foto salva ao confirmar as alterações.
- A movimentação de item sempre aponta para uma única coleção de destino por vez.
- A listagem de itens na edição da coleção é finita e pode ser percorrida sem quebrar a seleção múltipla.
- Falhas de rede, sessão ou carregamento devem preservar o que a pessoa já digitou até a recuperação ou cancelamento explícito.
