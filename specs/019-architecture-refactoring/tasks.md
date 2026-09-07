# Tasks: Architecture Refactoring and Service Decoupling

**Input**: Design documents from `/specs/019-architecture-refactoring/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [x] T001 Verify project environment and git branch `feature/019-architecture-refactoring`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Audit codebase for symbol usages to guarantee zero regressions

- [x] T002 Audit global exports and usages of JWT, user mapper, post service, and notification helpers across `src/`

---

## Phase 3: User Story 1 - Clean Social Feed & Post Strategy Separation (Priority: P1) 🎯 MVP

**Goal**: Decouple live API post operations from debug mock logic so live network errors do not fall back to mock data and mock files remain pure.

**Independent Test**: Switch `EXPO_PUBLIC_DEBUG_MODE` between `true` and `false`. In debug mode, posts/comments are served from memory. In live mode, all actions execute through `apiPostService` hitting live HTTP endpoints.

### Implementation for User Story 1

- [x] T003 [P] [US1] Define `PostService` interface contract in `src/types/posts.ts`
- [x] T004 [P] [US1] Create `apiPostService` HTTP implementation in `src/services/api/postService.ts`
- [x] T005 [US1] Refactor `mockPostService` in `src/services/debug/mockPostService.ts` to be purely in-memory with zero HTTP logic or API fallbacks
- [x] T006 [US1] Update post service exports in `src/services/debug/index.ts` to resolve strategy dynamically via `isDebugModeEnabled()`

**Checkpoint**: User Story 1 complete — Feed and post services strictly separated between live API and debug mock.

---

## Phase 4: User Story 2 - Modular Authentication Provider & Utilities (Priority: P2)

**Goal**: Extract non-React JWT parsing, user profile mapping, form validation, and photo URL resolution out of `AuthProvider.tsx` into clean utility modules.

**Independent Test**: Perform login, registration, session restoration, and profile updates. All user state transitions function seamlessly with `AuthProvider.tsx` reduced from 850+ to ~300 lines.

### Implementation for User Story 2

- [x] T007 [P] [US2] Create JWT parsing, decoding, and validation utilities in `src/utils/jwt.ts`
- [x] T008 [P] [US2] Create user profile normalization and photo URL resolution utilities in `src/utils/userMappers.ts`
- [x] T009 [P] [US2] Create register data validation utilities in `src/utils/validation.ts`
- [x] T010 [US2] Refactor `src/providers/AuthProvider.tsx` to delegate JWT, user mapping, and validation to utilities while consolidating `updateUserProfile`

**Checkpoint**: User Story 2 complete — `AuthProvider.tsx` is modularized, clean, and focused solely on React state and context.

---

## Phase 5: User Story 3 - Unified Notification Service Strategy (Priority: P3)

**Goal**: Unify notification API calls into `apiNotificationService` and simplify `NotificationProvider.tsx` to select the service strategy once during initialization.

**Independent Test**: Fetch notifications and handle follow requests (accept/decline/mark all read) in both debug and live API modes, verifying consistent state updates without inline `if (isDebugModeEnabled())` checks.

### Implementation for User Story 3

- [x] T011 [P] [US3] Create `apiNotificationService` implementation in `src/services/api/notificationService.ts`
- [x] T012 [P] [US3] Align `mockNotificationService` in `src/services/debug/mockNotificationService.ts` to implement `NotificationService` interface
- [x] T013 [US3] Refactor `src/providers/NotificationProvider.tsx` to resolve service strategy once upon initialization

**Checkpoint**: User Story 3 complete — Notification service strategy unified and provider cleaned of scattered conditionals.

---

## Phase 6: Polish & Quality Gates

**Purpose**: Validate code quality, zero broken references, and test execution

- [x] T014 Run symbol import audit across `src/` to ensure zero broken references or missing exports
- [x] T015 Run full validation gate command `npm run validate`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion
- **User Story 3 (Phase 5)**: Depends on Foundational completion
- **Polish (Phase 6)**: Depends on all user stories completion

### Parallel Opportunities

- T003 (`src/types/posts.ts`) and T004 (`src/services/api/postService.ts`) can run in parallel.
- T007 (`src/utils/jwt.ts`), T008 (`src/utils/userMappers.ts`), and T009 (`src/utils/validation.ts`) can run in parallel.
- T011 (`src/services/api/notificationService.ts`) and T012 (`src/services/debug/mockNotificationService.ts`) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup & Foundational symbol audit.
2. Complete User Story 1 (Social Feed & Post Strategy Separation).
3. **VALIDATE**: Test live vs debug feed behavior.

### Incremental Delivery

1. Deliver User Story 1 (Post Service Strategy).
2. Deliver User Story 2 (AuthProvider Modularization).
3. Deliver User Story 3 (Notification Service Strategy).
4. Run full quality gate (`npm run validate`).
