# Tasks: Error Boundary for AuthProvider

**Input**: Design documents from `/specs/011-auth-error-boundary/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. The project requires unit and integration tests to verify critical behavior such as SecureStore errors, token parsing errors, network offline/online changes, API timeouts, and retry limits.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume a single project structure under the `src/` directory.
- Test files are placed in `src/components/__tests__/` or `src/services/storage/__tests__/` or `src/services/api/__tests__/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install @react-native-community/netinfo dependency in package.json
- [ ] T002 Configure Jest and mock settings for Expo and NetInfo in jest.config.js
- [ ] T003 [P] Configure TypeScript compiler options and NetInfo definitions in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define typescript types and interfaces (AuthErrorType, AuthErrorInfo, RetryState) in src/types/authError.ts
- [ ] T005 Update AuthProvider to capture async errors in state and re-throw them in its render scope in src/providers/AuthProvider.tsx
- [ ] T006 Create base skeleton of AuthErrorBoundary component in src/components/AuthErrorBoundary.tsx
- [ ] T007 Create base skeleton of AuthFallbackUI component in src/components/AuthFallbackUI.tsx
- [ ] T008 [P] Integrate AuthErrorBoundary and wrap AuthProvider in the root layout file src/app/_layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - SecureStore Unavailability Recovery (Priority: P1) 🎯 MVP

**Goal**: When the device's SecureStore becomes unavailable (permission revoked, file corrupted, hardware issue), AuthProvider crashes during token retrieval. Error boundary catches the crash and displays fallback UI with recovery options, allowing user to retry or clear data.

**Independent Test**: Mock SecureStore to throw unavailability error, observe AuthProvider crash capture by error boundary, and verify fallback UI appears with "Try Again" and "Clear Auth Data" buttons.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write unit tests for catching SecureStore errors and displaying fallback UI in src/components/__tests__/AuthErrorBoundary.test.tsx
- [ ] T010 [P] [US1] Write unit tests for fallback UI button actions in src/components/__tests__/AuthFallbackUI.test.tsx

### Implementation for User Story 1

- [ ] T011 [US1] Implement SecureStore error handling, logging, and recovery state transitions in src/components/AuthErrorBoundary.tsx
- [ ] T012 [US1] Implement fallback UI rendering, styling, and action triggers for retry and clear data in src/components/AuthFallbackUI.tsx
- [ ] T013 [US1] Implement Clear Auth Data storage wipe logic using SecureStore.deleteItemAsync in src/services/storage/authSession.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Token Parsing Failure Recovery (Priority: P1)

**Goal**: When stored token contains corrupted or unparseable data (invalid base64, malformed JSON, encoding issues), AuthProvider crashes during token decode. Error boundary catches the error and offers user option to clear data and start fresh without manual data deletion.

**Independent Test**: Can be fully tested by storing corrupted token data in SecureStore, launching app, and verifying error boundary displays fallback UI with clear recovery path.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US2] Write unit tests for catching corrupted token parse errors and recovering via data clear in src/components/__tests__/AuthErrorBoundary.test.tsx

### Implementation for User Story 2

- [ ] T015 [US2] Implement token payload parsing validation and base64 decode check in src/services/storage/authSession.ts
- [ ] T016 [US2] Map parsing errors to the PARSING error type and update error state in src/components/AuthErrorBoundary.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Network Error Auto-Recovery (Priority: P1)

**Goal**: When network is unavailable during AuthProvider's token validation API call, the request times out or fails. Error boundary displays offline fallback UI and automatically retries when network reconnects, providing seamless recovery without user intervention.

**Independent Test**: Can be fully tested by simulating network unavailability during app startup, verifying error boundary displays offline message, simulating network return, and verifying automatic retry without user action.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US3] Write unit and integration tests for network state monitoring and auto-retry on reconnect in src/components/__tests__/AuthErrorBoundary.test.tsx

### Implementation for User Story 3

- [ ] T018 [US3] Integrate NetInfo connection listener and subscribe/unsubscribe lifecycle hooks in src/components/AuthErrorBoundary.tsx
- [ ] T019 [US3] Implement network error type detection, message mapping, and auto-retry trigger in src/components/AuthErrorBoundary.tsx
- [ ] T020 [US3] Implement offline state UI indicators and manual retry handler in src/components/AuthFallbackUI.tsx

**Checkpoint**: User Stories 1, 2, and 3 should now be independently functional

---

## Phase 6: User Story 4 - Backend Timeout Recovery (Priority: P2)

**Goal**: When backend is unreachable or extremely slow during bootstrap, AuthProvider times out waiting for response. Error boundary displays timeout error UI with offline indication and manual retry option. Auto-retry only works if network error (not backend down).

**Independent Test**: Can be fully tested by simulating slow backend (30+ second delay), observing timeout error in error boundary, and verifying retry mechanism.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US4] Write unit tests for Axios timeout detection and timeout error type mapping in src/components/__tests__/AuthErrorBoundary.test.tsx

### Implementation for User Story 4

- [ ] T022 [US4] Configure axios instance timeout to 15 seconds in src/services/api/client.ts
- [ ] T023 [US4] Implement axios error code (ECONNABORTED) and timeout error classification mapping in src/components/AuthErrorBoundary.tsx
- [ ] T024 [US4] Display user-friendly "Backend Unavailable" messages for timeouts in src/components/AuthFallbackUI.tsx

**Checkpoint**: User Stories 1, 2, 3, and 4 should now be independently functional

---

## Phase 7: User Story 5 - Retry Limit Prevention (Priority: P2)

**Goal**: Error boundary implements intelligent retry logic with maximum 3 auto-retry attempts before stopping. This prevents infinite loops when error condition is persistent (corrupted data, bad API state). After 3 attempts, UI shows persistent error with manual recovery options.

**Independent Test**: Can be fully tested by mocking AuthProvider to fail consistently, observing error boundary retry counter behavior, and verifying UI changes after 3 attempts.

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US5] Write unit tests for retry counter limiting and transition to persistent error state in src/components/__tests__/AuthErrorBoundary.test.tsx

### Implementation for User Story 5

- [ ] T026 [US5] Implement retry limit check (maximum 3 attempts) and backoff delay helper in src/components/AuthErrorBoundary.tsx
- [ ] T027 [US5] Update fallback UI to hide "Try Again" button and show "Contact Support" option after 3 failed attempts in src/components/AuthFallbackUI.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T028 [P] Add Premium feel animations using MotionView (fade & slideUp) and AnimatedPressable in src/components/AuthFallbackUI.tsx
- [ ] T029 [P] Add accessibility labels and accessibility role attributes to all buttons in src/components/AuthFallbackUI.tsx
- [ ] T030 Ensure error logging is zero-PII and contains no secrets in src/components/AuthErrorBoundary.tsx
- [ ] T031 Run validation checks, ESLint, prettier, and type checking in package.json and modified src files
- [ ] T032 Run unit tests and ensure coverage is >= 80% on AuthErrorBoundary and AuthFallbackUI in src/components/
- [ ] T033 Run quickstart.md validation scenarios to verify overall feature in specs/011-auth-error-boundary/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US3 but should be independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Manages retry bounds for all previous user stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/types before services
- Services/logic before UI presentation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1, US2, and US3 can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit tests for catching SecureStore errors and displaying fallback UI in src/components/__tests__/AuthErrorBoundary.test.tsx"
Task: "Write unit tests for fallback UI button actions in src/components/__tests__/AuthFallbackUI.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently
