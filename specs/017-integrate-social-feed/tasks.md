# Tasks: integrate-social-feed

**Input**: Design documents from `/specs/017-integrate-social-feed/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Apenas testes de fluxo manual e integração local foram especificados como parte das User Stories no spec.md. Os testes automatizados não foram explicitamente solicitados para o MVP, portanto, o foco está na validação através do quickstart.md.

**Organization**: As tarefas são agrupadas por histórias de usuário para permitir a implementação independente de cada fluxo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação da infraestrutura do projeto e gates de qualidade.

- [x] T001 Verify project structure and configuration files per plan.md
- [x] T002 [P] Verify ESLint and TypeScript compilation quality gate running npm run validate

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Garantir que as configurações básicas (como URL da API) estão corretas antes de iniciar as histórias de usuário.

**⚠️ CRITICAL**: Nenhuma alteração de UI de User Story pode começar antes desta fase estar concluída.

- [x] T003 Confirm DEFAULT_BASE_URL is set to 'https://api.collectto.app' in src/services/api/config.ts

**Checkpoint**: Base de endpoints configurada. As histórias de usuário podem ser implementadas.

---

## Phase 3: User Story 1 - Visualização de Itens no Feed Principal (Priority: P1) 🎯 MVP

**Goal**: Exibir os itens do feed paginados em ordem cronológica a partir do endpoint `/social/feed`.

**Independent Test**: Abrir a aba principal (Home) e verificar se os itens públicos carregam e paginam corretamente.

### Implementation for User Story 1

- [x] T004 [US1] Map FeedSummary and ItemResponse attributes to frontend types in src/types/debug.ts
- [x] T005 [US1] Update PostService interface and implementation in src/services/debug/mockPostService.ts to fetch from GET /social/feed
- [x] T006 [US1] Update FeedScreen component in src/app/(tabs)/index.tsx to consume the updated feed items mapping from PostService

**Checkpoint**: User Story 1 funcional. O feed deve carregar itens reais paginados.

---

## Phase 4: User Story 2 - Curtir Itens no Feed (Priority: P1)

**Goal**: Curtir e descurtir posts do feed atualizando o estado visual de forma otimista.

**Independent Test**: Tocar no coração de um post, verificar mudança visual imediata e envio da requisição POST/DELETE correspondente.

### Implementation for User Story 2

- [X] T007 [P] [US2] Update PostService implementation in src/services/debug/mockPostService.ts to call POST /items/like/{itemId} and DELETE /items/like/{itemId}
- [X] T008 [US2] Verify toggle like optimistic state update and error fallback in FeedScreen at src/app/(tabs)/index.tsx

**Checkpoint**: User Story 2 funcional. Curtidas e descurtidas integradas e persistidas na API.

---

## Phase 5: User Story 5 - Redirecionamento para a Coleção do Item (Priority: P1)

**Goal**: Redirecionar o usuário para a rota da coleção ao clicar na etiqueta de coleção do card do item.

**Independent Test**: Clicar no título da coleção no card e verificar se navega para a rota correta.

### Implementation for User Story 5

- [X] T009 [US5] Ensure item card name press handler in src/components/post/Post.tsx correctly navigates to the collections routing pathname
- [X] T010 [US5] Verify FeedScreen redirection parameter passing and back navigation in src/app/(tabs)/index.tsx

**Checkpoint**: Navegação entre feed e detalhes de coleção funcional.

---

## Phase 6: User Story 3 - Comentar em Itens (Priority: P2)

**Goal**: Permitir comentar, ver comentários paginados, excluir comentários do próprio usuário e subir a tela com teclado.

**Independent Test**: Abrir modal de comentários, digitar com comportamento de tela ajustado, enviar e excluir o próprio comentário com confirmação de segurança.

### Implementation for User Story 3

- [X] T011 [US3] Implement KeyboardAvoidingView in CommentThread at src/components/comments/CommentThread.tsx to prevent keyboard blocking input on iOS and Android
- [X] T012 [US3] Add deleteCommentFromPost mock mutation in src/mocks/comments.ts and call DELETE /items/comment/{commentId} via service
- [X] T013 [P] [US3] Add trash-bin icon button with accessibility props to own comments in src/components/comments/Comment.tsx
- [X] T014 [US3] Connect comment deletion callback with Alert confirmation dialog in CommentThread at src/components/comments/CommentThread.tsx

**Checkpoint**: Comentários completos com suporte a exclusão e ajuste de teclado.

---

## Phase 7: User Story 4 - Compartilhar Itens (Priority: P2)

**Goal**: Compartilhar item no feed usando a folha nativa com texto simples.

**Independent Test**: Tocar no botão de compartilhar e verificar texto enviado.

### Implementation for User Story 4

- [X] T015 [US4] Update handleSharePost callback in src/app/(tabs)/index.tsx to share item text description without external links

**Checkpoint**: Compartilhamento simples de texto de itens concluído.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finos de qualidade e validações completas de regressão.

- [X] T016 Verify quality and format checks by running npm run validate
- [X] T017 [P] Verify local test scenarios from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - inicia imediatamente.
- **Foundational (Phase 2)**: Depende do Setup (Fase 1) - BLOQUEIA todas as histórias de usuário.
- **User Stories (Phase 3+)**: Dependem da conclusão da Fase 2. Podem rodar em sequência de prioridade (P1 -> P2).
- **Polish (Phase N)**: Depende de todas as User Stories estarem concluídas.

### Parallel Opportunities

- As tarefas T001 e T002 podem rodar em paralelo.
- Após a conclusão da Fase Foundational, as fases de User Story de mesma prioridade (US1, US2 e US5) podem ser implementadas em paralelo.
- As tarefas de UI/Visual (`T013`) e lógica do mock (`T012`) na história US3 podem rodar em paralelo.

---

## Parallel Example: User Story 3

```bash
# Executa tarefas paralelas da história de comentário
Task: "Add deleteCommentFromPost mock mutation in src/mocks/comments.ts"
Task: "Add trash-bin icon button with accessibility props to own comments in src/components/comments/Comment.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1, 2, 5)

1. Concluir Fase 1 (Setup) e Fase 2 (Foundational).
2. Concluir Fase 3 (US1 - Exibição), Fase 4 (US2 - Curtidas) e Fase 5 (US5 - Redirecionamento).
3. **STOP and VALIDATE**: Testar o feed básico com likes e navegação.

### Incremental Delivery

1. Entregar MVP (Exibição + Likes + Navegação).
2. Adicionar Fase 6 (US3 - Comentários e Teclado).
3. Adicionar Fase 7 (US4 - Compartilhar).
4. Rodar regressão e linting completo (Fase N).
