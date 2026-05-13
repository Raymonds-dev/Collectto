# Tasks: Debug Mode

**Input**: Design documents from `/specs/003-debug-mode/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding for DEBUG mode services and shared API-shaped seed data

- [x] T001 Create the DEBUG service scaffold and shared debug types in src/services/debug/ and src/types/debug.ts
- [x] T002 [P] Add API-shaped DEBUG seed data in src/mocks/debug-seed.ts with seed profile, collections, items, and media placeholders
- [x] T003 [P] Export the debug seed and service entrypoints from src/mocks/index.ts and src/services/debug/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and session primitives required before any user story wiring begins

**Independent Test**: The app can import the canonical debug models and create a session object without touching UI screens.

- [x] T004 Refactor the shared domain types to the API-aligned field names in src/types/auth.ts, src/types/collections.ts, src/types/items.ts, and src/types/comments.ts
- [x] T005 [P] Implement the in-memory DEBUG session singleton and mutation API in src/services/debug/debugSession.ts
- [x] T006 [P] Implement the post derivation helper in src/services/debug/postDerivation.ts using the canonical PostProjection shape
- [x] T007 [P] Add DEBUG environment guards and session lifecycle helpers in src/services/debug/debugFlags.ts and src/services/debug/sessionLifecycle.ts

**Checkpoint**: The debug model, seed data, and in-memory session layer are ready for the feature stories.

---

## Phase 3: User Story 1 - Ativar sessão de teste offline efêmera (Priority: P1) 🎯 MVP

**Goal**: Start the app in DEBUG mode with seed credentials and no dependency on external network calls.

**Independent Test**: With DEBUG=true and no connectivity, the app opens directly into the authenticated experience, the login screen is bypassed, and a full restart clears the session.

### Implementation for User Story 1

- [x] T008 [P] [US1] Update src/app/_layout.tsx to detect DEBUG at boot and route through the debug-aware auth flow
- [x] T009 [P] [US1] Update src/providers/AuthProvider.tsx to hydrate the seed user and expose DEBUG session state from src/services/debug/debugSession.ts
- [x] T010 [P] [US1] Implement src/services/debug/mockAuthService.ts with seed-credential validation and current-user lookup
- [x] T011 [US1] Update src/app/(auth)/login.tsx so DEBUG mode bypasses manual authentication while preserving the existing non-DEBUG flow

**Checkpoint**: User Story 1 should boot offline, authenticate with seed data, and discard state on full app restart.

---

## Phase 4: User Story 2 - Persistir mudanças entre telas durante a sessão (Priority: P1)

**Goal**: Keep collection, item, and profile mutations synchronized across screens within the same DEBUG session.

**Independent Test**: Create a collection, add an item, and update profile media; then navigate across profile, collections, and item flows and confirm the changes are visible immediately.

### Implementation for User Story 2

- [x] T012 [P] [US2] Wire src/providers/CollectionContextProvider.tsx to the DEBUG session store and implement the collection mutation bridge in src/services/debug/mockCollectionService.ts
- [x] T013 [P] [US2] Wire src/providers/ItemContextProvider.tsx to the DEBUG session store and implement the item mutation bridge in src/services/debug/mockItemService.ts
- [x] T014 [P] [US2] Update src/hooks/useCollectionCreation.ts and src/hooks/useItemSave.ts to call the DEBUG services using collectionId, coverImageUrl, and imageFilesUrls
- [x] T015 [P] [US2] Update src/components/create-item/CreateItemFlow.tsx, src/components/create-item/CollectionSelector.tsx, src/components/create-item/CollectionCreationForm.tsx, and src/components/create-item/ItemSaveFlow.tsx to consume API-shaped models
- [x] T016 [P] [US2] Update src/components/profile-header/ProfileHeader.tsx, src/components/collections-grid/CollectionsGrid.tsx, src/components/collection-items-grid/CollectionItemsGrid.tsx, src/app/(tabs)/profile.tsx, and src/app/(tabs)/collections/[collectionId].tsx to reflect session mutations immediately

**Checkpoint**: Collection and item changes should stay in sync across every screen in the same session.

---

## Phase 5: User Story 3 - Exibir posts derivados dos itens da coleção (Priority: P2)

**Goal**: Derive feed posts from the current session items and keep them ordered by createdAt descending.

**Independent Test**: Create a new item, refresh the feed, and confirm the derived post appears at the top with the correct author and item snapshot.

### Implementation for User Story 3

- [x] T017 [US3] Create src/services/debug/mockPostService.ts to expose getFeed(), which maps debugSession.items to PostProjection using derivePostFromItem.
- [x] T018 [US3] Create src/providers/PostContextProvider.tsx and wire it to the DEBUG session via mockPostService.ts.
- [x] T019 [US3] Update src/app/(tabs)/index.tsx (or feed.tsx) to consume usePostService().getFeed() and map the unified post shapes to PostFeed.
- [x] T020 [US3] Ensure post-level interactions (like/unlike, comment count) correctly mutate the underlying item in debugSession and refresh the feed immediately.

**Checkpoint**: The feed should now reflect the session items without requiring any API calls.

---

## Phase 6: User Story 4 - Preparar transição para API real (Priority: P2)

**Goal**: Keep the debug implementation swappable with a future API-backed implementation without changing the UI contracts.

**Independent Test**: Replace the debug service implementation behind the same contracts and verify the screens continue to compile and behave the same way.

### Implementation for User Story 4

- [x] T021 [P] [US4] Align src/types/photo-storage.ts and src/services/photo-storage/factory.ts, src/services/photo-storage/local-provider.ts, and src/services/photo-storage/index.ts with the canonical API-shaped media and cache metadata fields from the debug data model
- [x] T022 [P] [US4] Normalize src/mocks/collections/index.ts, src/mocks/items/index.ts, src/mocks/collections.ts, and src/mocks/items/fixtures.ts to emit the same canonical IDs, timestamps, visibility values, and media field names used by the debug contracts
- [x] T023 [P] [US4] Align src/services/api/api.ts and src/services/api/integrationReference.ts with the future contract boundaries described in specs/003-debug-mode/contracts/
- [x] T024 [US4] Consolidate the import surfaces in src/mocks/index.ts and src/services/debug/index.ts so each domain has one canonical entrypoint

**Checkpoint**: The debug mode should now be ready for a future swap to a real API implementation with minimal UI churn.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across the feature

- [x] T025 Update specs/003-debug-mode/quickstart.md with any final implementation notes and boot instructions after wiring is complete
- [x] T026 Run npm run validate and fix any lint, type, or formatting issues introduced by the DEBUG mode wiring
- [x] T027 [P] Implement DEBUG image cache cleanup and URI bookkeeping in src/services/photo-storage/local-provider.ts and src/services/debug/sessionLifecycle.ts
- [x] T028 [P] Add console-only DEBUG logging helpers and instrumentation in src/services/debug/logger.ts, src/services/debug/debugSession.ts, and src/services/debug/mockAuthService.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies - can start immediately
- Foundational (Phase 2): Depends on Setup completion - blocks all user stories
- User Stories (Phase 3+): Depend on Foundational phase completion
- Polish (Final Phase): Depends on the desired user stories being complete

### User Story Dependencies

- User Story 1 (P1): Can start after Foundational completion
- User Story 2 (P1): Can start after Foundational completion and should remain independently testable even when implemented alongside User Story 1
- User Story 3 (P2): Can start after Foundational completion and depends on the debug session data shape established by the earlier phases
- User Story 4 (P2): Can start after Foundational completion and acts as the migration-safety layer for the other stories

### Within Each User Story

- Shared debug models and session primitives before service wiring
- Services before screen updates
- Screen updates before polish or validation tasks
- Each story should be usable on its own before moving to the next priority

### Parallel Opportunities

- T002 and T003 can run in parallel because they touch different files
- T005, T006, and T007 can run in parallel after T004 is in place
- T008, T009, and T010 can run in parallel once the foundational session layer exists
- T012, T013, T014, and T015 can run in parallel after the debug session contract is stable
- T017 and T018 can run in parallel once the feed derivation shape is defined
- T021, T022, and T023 can run in parallel because they are separate refactor surfaces

---

## Parallel Example: User Story 2

```bash
Task: Update src/providers/CollectionContextProvider.tsx and src/services/debug/mockCollectionService.ts
Task: Update src/providers/ItemContextProvider.tsx and src/services/debug/mockItemService.ts
Task: Update src/hooks/useCollectionCreation.ts and src/hooks/useItemSave.ts
Task: Update src/components/create-item/CreateItemFlow.tsx, src/components/create-item/CollectionSelector.tsx, src/components/create-item/CollectionCreationForm.tsx, and src/components/create-item/ItemSaveFlow.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the offline boot and authentication path
5. Stop and demo if needed

### Incremental Delivery

1. Complete Setup + Foundational to establish the canonical debug model
2. Add User Story 1 to make the app boot offline in DEBUG mode
3. Add User Story 2 to make session changes reflect across screens
4. Add User Story 3 to make the feed derive posts from items
5. Add User Story 4 to keep the debug mode swappable with the future API
6. Finish with validation and quickstart cleanup

### Parallel Team Strategy

1. One developer can own the auth boot path in User Story 1
2. Another developer can wire collection and item propagation in User Story 2
3. Another developer can implement the feed projection and rendering in User Story 3
4. Another developer can align the shared types and migration surfaces in User Story 4

---

## Notes

- [P] tasks can run in parallel when they touch different files and do not depend on unfinished work
- User story tasks should stay independently testable
- Keep the debug implementation API-shaped so the future backend swap does not require UI rewrites
- Prefer the existing component and provider structure over creating duplicate views
- Finish with `npm run validate` before considering the feature ready
