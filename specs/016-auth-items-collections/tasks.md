# Tasks: Melhorias em Autenticação, Itens e Coleções

**Input**: Design/Specification documents from `/specs/016-auth-items-collections/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure updates

- [x] T001 Update TypeScript definitions for update item requests in src/types/items.ts
- [x] T002 [P] Update TypeScript definitions for collection request/response in src/types/collections.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement secure refresh token functions (set/get/clear) in src/services/storage/authSession.ts
- [x] T004 Expose the post `/auth/refresh` route in the API client src/services/api/api.ts
- [x] T005 Implement the API-based `performRefresh` logic in src/services/auth/sessionRefreshManager.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Fluxo de Autenticação com Refresh Token (Priority: P1) 🎯 MVP

**Goal**: Silent session refresh when access token expires using token rotation and request queueing in axios interceptors.

**Independent Test**: Log in using valid credentials, receive access and refresh tokens. Verify that when the access token expires, a request to a protected endpoint triggers the `/auth/refresh` route and re-executes the failed requests seamlessly without forcing the user to log in again.

### Implementation for User Story 1

- [x] T006 [US1] Update src/providers/AuthProvider.tsx to persist refreshToken on login, pass it to sessionRefreshManager, and clean all tokens on logout
- [x] T007 [US1] Implement request queueing and silent refresh trigger in 401 error handler in src/services/api/interceptors.ts
- [x] T008 [US1] Update src/services/debug/mockAuthService.ts to simulate refresh token response and session rotation logic in debug mode

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Mover Itens para uma Coleção Diferente (Priority: P1)

**Goal**: Move item to another collection via edit screen selector triggering PATCH `/items/update/{itemId}`.

**Independent Test**: Open the edit form of an item, select a different target collection from the list, save, and confirm that the item moves to the new collection and displays correctly.

### Implementation for User Story 2

- [x] T009 [US2] Update apiItemService.moveItem and apiItemService.moveItemsBulk in src/services/api/crudServices.ts to execute PATCH requests
- [x] T010 [US2] Modify src/hooks/useItemEdit.ts to track collectionId in the item form data state
- [x] T011 [US2] Verify and adjust the move item modal and save triggers in the edit item screen src/app/collections/edit-item/[itemId].tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Definir Visibilidade ao Criar Coleção (Priority: P2)

**Goal**: Allow choosing visibility (PUBLIC, PRIVATE, FRIENDS) in CollectionCreationForm when creating collection.

**Independent Test**: Click to create a new collection, select "FRIENDS" visibility, save, and verify that the collection is successfully created and has the selected visibility status.

### Implementation for User Story 3

- [x] T012 [US3] Add a visibility dropdown (PRIVATE, PUBLIC, FRIENDS) to the collection creation form in src/components/create-item/CollectionCreationForm.tsx
- [x] T013 [US3] Update collection creation mock handler in src/services/debug/mockCollectionService.ts to persist visibility

**Checkpoint**: All user stories should now be independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 Run validation command npm run validate to ensure zero compilation or styling issues
- [x] T015 Run quickstart.md validation to verify all scenarios work as expected

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Parallel Opportunities

- T002 can run in parallel with T001.
- T006, T007, and T008 can be developed in parallel once Phase 2 is complete.
- Phase 3, Phase 4, and Phase 5 can be worked on in parallel by different developers since they touch distinct files and concerns.

---

## Parallel Example: User Story 1

```bash
# Developer A implements auth provider token persistence:
Task: "Update src/providers/AuthProvider.tsx to persist refreshToken on login..."

# Developer B implements interceptor request queueing:
Task: "Implement request queueing and silent refresh trigger in 401 error handler in src/services/api/interceptors.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Silent Refresh)
4. Complete Phase 4: User Story 2 (Mover Itens)
5. **STOP and VALIDATE**: Test both MVP features independently.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (Silent Refresh MVP)
3. Add User Story 2 → Test independently (Mover Itens MVP)
4. Add User Story 3 → Test independently (Visibilidade)
5. Run Polish tasks and finalize.
