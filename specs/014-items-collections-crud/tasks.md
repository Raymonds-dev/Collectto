# Tasks: Items & Collections CRUD Integration

**Input**: Design documents from `/specs/014-items-collections-crud/`
**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required for user stories), [research.md](research.md), [data-model.md](data-model.md)

**Tests**: Manual validation scenarios are included under each user story's verification task. No automated TDD test tasks are added as they were not explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies within the same phase)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `src/` at repository root
- Routes: `src/app/`
- Components: `src/components/`
- Services: `src/services/`
- Types: `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create collection contracts file in specs/014-items-collections-crud/contracts/collection.ts
- [X] T002 [P] Create item contracts file in specs/014-items-collections-crud/contracts/item.ts
- [X] T003 [P] Verify debug flag configurations in src/services/debug/debugFlags.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and services that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define request types in src/types/collections.ts
- [X] T005 [P] Define request types in src/types/items.ts
- [X] T006 Implement collection endpoints in src/services/api/api.ts
- [X] T007 [P] Implement item endpoints in src/services/api/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Collections (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create, view, update, and delete collections.

**Independent Test**: Create a collection using the form, verify it is displayed on the profile page, edit it, and delete it with confirmation.

### Implementation for User Story 1

- [X] T008 [US1] Update CollectionCreationForm to support edit mode in src/components/create-item/CollectionCreationForm.tsx
- [X] T009 [P] [US1] Update CollectionEditForm component in src/components/collection/CollectionEditForm.tsx
- [X] T010 [US1] Wire collection edit and delete buttons in src/app/(tabs)/profile.tsx
- [X] T011 [US1] Add collection delete confirmation modal using existing modal in src/app/(tabs)/profile.tsx
- [X] T012 [US1] Verify collection CRUD functionality in mock and real modes via src/app/(tabs)/profile.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Create and Manage Items Within Collections (Priority: P1)

**Goal**: Enable users to create, update, and delete items within their collections.

**Independent Test**: Add an item with a required image to a collection, edit its metadata, and delete it with confirmation.

### Implementation for User Story 2

- [X] T013 [US2] Create edit item route handler in src/app/collections/edit-item/[itemId].tsx
- [X] T014 [US2] Update ItemForm to support edit mode in src/components/create-item/ItemForm.tsx
- [X] T015 [US2] Update ItemSaveFlow to support editing and required image validation in src/components/create-item/ItemSaveFlow.tsx
- [X] T016 [US2] Add delete action and confirmation modal for items in src/app/collections/[collectionId].tsx
- [X] T017 [US2] Verify item CRUD functionality in mock and real modes via src/app/collections/[collectionId].tsx

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Profile Reflects Real-Time Collection and Item Changes (Priority: P2)

**Goal**: Ensure the user profile page always displays the current state of their collections and items.

**Independent Test**: Perform CRUD operations and verify that collections list, items list, and counts update instantly.

### Implementation for User Story 3

- [X] T018 [US3] Add collections and items reload triggers in src/services/profileService.ts
- [X] T019 [US3] Implement optimistic UI for collection creation and updates in src/app/(tabs)/profile.tsx
- [X] T020 [US3] Implement optimistic UI for item updates in src/app/collections/[collectionId].tsx
- [X] T021 [US3] Verify real-time profile synchronization in mock and real modes via src/app/(tabs)/profile.tsx

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T022 Run full code verification and type-checking using npm run validate
- [X] T023 Update requirements checklist in specs/014-items-collections-crud/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phases 3 to 5)**: All depend on Foundational phase completion.
  - User Story 1 (P1) is the MVP and should be completed first.
  - User Story 2 (P1) can run after Foundational completion.
  - User Story 3 (P2) depends on User Story 1 & 2 UI integration.
- **Polish (Phase 6)**: Depends on all user stories being completed.

### Parallel Opportunities

- Within Phase 1: T002 and T003 can be worked on in parallel.
- Within Phase 2: T005 and T007 can be worked on in parallel.
- Once Phase 2 is complete, US1 and US2 can be implemented concurrently by different developers, with final integration in US3.

---

## Parallel Example: User Story 1

```bash
# Implement collection creation and collection editing forms in parallel:
Task: "Update CollectionCreationForm to support edit mode in src/components/create-item/CollectionCreationForm.tsx"
Task: "Update CollectionEditForm component in src/components/collection/CollectionEditForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Test User Story 1 independently in both mock and real mode.

### Incremental Delivery

1. Foundation ready (Setup + Foundational complete).
2. Collection CRUD ready (US1 complete) -> Test and Demo (MVP!).
3. Item CRUD ready (US2 complete) -> Test and Demo.
4. Real-time Profile Synchronization ready (US3 complete) -> Test and Demo.
5. Quality validation (Polish complete) -> Final PR ready.
