# Tasks: Persistent Session Storage and Restoration

**Input**: Design documents from `/specs/008-session-persistence/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. None are requested here, so tests are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (e.g. `src/providers/AuthProvider.tsx`, `src/services/storage/authSession.ts`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency checks, and configuration validation.

- [ ] T001 [P] Verify and ensure dependencies (specifically expo-secure-store, expo-router, and axios) are present in package.json
- [ ] T002 [P] Verify that app.json supports the necessary secure store build permissions/configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and wrappers that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Implement try-catch wrappers around expo-secure-store calls in src/services/storage/authSession.ts to prevent platform crashes
- [ ] T004 [P] Implement and export token format validation, payload decoding, and expiration helpers in src/providers/AuthProvider.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Session Persists Across App Restart (Priority: P1) 🎯 MVP

**Goal**: Automatically restore valid sessions when the app starts, and persist sessions upon login.

**Independent Test**: Sign in successfully → Close app → Reopen app → Verify automatic login redirects to home/profile screen without credentials prompt.

### Implementation for User Story 1

- [ ] T005 [US1] Set shouldRestorePersistentSession = true in src/providers/AuthProvider.tsx
- [ ] T006 [US1] Update bootstrapSession in src/providers/AuthProvider.tsx to load, format check, and validate expiration of secure storage token on startup
- [ ] T007 [US1] Implement offline cached fallback in src/providers/AuthProvider.tsx using decoded token claims if user profile hydration fails
- [ ] T008 [US1] Configure axios default Authorization header on successful token restoration in src/providers/AuthProvider.tsx
- [ ] T009 [US1] Update signIn in src/providers/AuthProvider.tsx to persist the JWT token using setSessionToken upon successful user authentication

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Expired Token Triggers Re-login (Priority: P1)

**Goal**: Prompt user to log in again and invalidate authentication states if the stored token has expired.

**Independent Test**: Sign in successfully → Wait for token to expire (or advance device clock/mock expiration) → Restart app → Verify app redirects to login screen instead of authenticating.

### Implementation for User Story 2

- [ ] T010 [US2] Update bootstrapSession in src/providers/AuthProvider.tsx to clear the token using clearSessionToken and set user state to null if the token is expired
- [ ] T011 [US2] Implement automatic logout redirection on token expiration/401 API failures in src/providers/AuthProvider.tsx

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Logout Clears Persisted Session (Priority: P1)

**Goal**: Completely remove the persisted JWT token from SecureStore when the user explicitly logs out.

**Independent Test**: Sign in successfully → Tap "Sign Out" → Close and reopen the app → Verify that no automated login occurs and login screen is displayed.

### Implementation for User Story 3

- [ ] T012 [US3] Update signOut in src/providers/AuthProvider.tsx to call clearSessionToken, delete axios Authorization header, and set user to null

**Checkpoint**: User Stories 1, 2, and 3 should now be fully functional.

---

## Phase 6: User Story 4 - Graceful Handling of SecureStore Unavailability (Priority: P2)

**Goal**: Degrade to in-memory session if SecureStore fails or is unavailable on the device, ensuring the app does not crash.

**Independent Test**: Mock SecureStore to throw errors (e.g. keychain unavailable) → Sign in → Verify that session works in memory but is not persisted on app restart.

### Implementation for User Story 4

- [ ] T013 [US4] Update bootstrapSession and storage call catch blocks in src/providers/AuthProvider.tsx to catch storage read/write exceptions and log warnings rather than crashing

**Checkpoint**: All user stories are now independently functional and robust.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, code quality, and formatting.

- [ ] T014 Run code linting, formatting, and type checks via npm run validate in package.json
- [ ] T015 Run quickstart.md validation steps in specs/008-session-persistence/quickstart.md to verify all user scenarios work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User Story 1 (P1) is the MVP and must be completed first.
  - User Story 2 (P1) and User Story 3 (P1) build on User Story 1.
  - User Story 4 (P2) is optional but should be completed after P1 stories.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories.
- **User Story 2 (P1)**: Can start after User Story 1 is functional, as it handles expired versions of the restored token.
- **User Story 3 (P1)**: Can start after User Story 1 is functional, as it requires session storage to be active before clearing.
- **User Story 4 (P2)**: Can start after User Story 1 is functional, as it implements fallback logic for session storage.

### Parallel Opportunities

- Setup tasks `T001` and `T002` can run in parallel.
- Foundational tasks `T003` and `T004` can run in parallel.
- Once Foundational phase is complete, different developers can theoretically work on stories, but because they heavily modify `src/providers/AuthProvider.tsx`, sequential implementation is recommended to avoid git merge conflicts.

---

## Parallel Example: User Story 1

```bash
# Setup tasks can run in parallel:
Task: "Verify and ensure dependencies (specifically expo-secure-store, expo-router, and axios) are present in package.json"
Task: "Verify that app.json supports the necessary secure store build permissions/configuration"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Verify auto-login persists across restarts

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories
