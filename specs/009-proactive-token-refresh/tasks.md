# Tasks: Proactive Token Expiration Handling (Silent Refresh + Logout)

**Input**: Design documents from `/specs/009-proactive-token-refresh/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. As the feature specification does not request automated test coverage, verification is based on manual test runs, mock-based verification via debug mode, and custom token expiration testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Paths are relative to the project root `frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create type definitions for AuthenticationSession and RefreshAttempt in src/types/auth-refresh.d.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Define ISessionRefreshManager interface and implement the manager skeleton in src/services/auth/sessionRefreshManager.ts
- [x] T003 [P] Update JWT decoding helper to parse exp in src/providers/AuthProvider.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Extended Session with Background Refresh (Priority: P1) 🎯 MVP

**Goal**: Keep user authenticated indefinitely during active usage via silent background token refreshes.

**Independent Test**: Simulate a 1-hour session, verify background validation at T=55 minutes, confirm authenticated through T=70 minutes.

### Implementation for User Story 1

- [x] T004 [US1] Implement event-driven scheduler (setTimeout) in src/services/auth/sessionRefreshManager.ts
- [x] T005 [US1] Implement asynchronous token validation API request calling /users/me in src/services/auth/sessionRefreshManager.ts
- [x] T006 [US1] Integrate SessionRefreshManager initialization and session start in src/providers/AuthProvider.tsx
- [x] T007 [US1] Implement stored token expiration check and timer scheduling on app startup in src/providers/AuthProvider.tsx
- [x] T008 [P] [US1] Update mockAuthService to generate debug tokens with customized exp claims in src/services/debug/mockAuthService.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Offline Expiration with Graceful Recovery (Priority: P1)

**Goal**: Force silent logout and redirect when token expires offline.

**Independent Test**: Toggle connectivity offline, advance past token expiration, reconnect, attempt action, verify silent redirect to login.

### Implementation for User Story 2

- [x] T009 [US2] Configure centralized Axios response interceptor for 401 status in src/services/api/api.ts
- [x] T010 [US2] Implement silent session clearing (tokens, state) without displaying error dialogs in src/providers/AuthProvider.tsx
- [x] T011 [US2] Route intercepted 401 errors to trigger handleUnauthorized in src/services/auth/sessionRefreshManager.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Continuous Activity Maintains Session (Priority: P1)

**Goal**: Reschedule refresh timers upon user actions to extend the session.

**Independent Test**: Simulate activity every 10 minutes over a 3-hour period, verify refresh timer is rescheduled and session remains active.

### Implementation for User Story 3

- [x] T012 [US3] Implement timer rescheduling on user actions in src/services/auth/sessionRefreshManager.ts
- [x] T013 [US3] Reschedule refresh timer after user actions (signIn, profile update) in src/providers/AuthProvider.tsx

**Checkpoint**: User Stories 1, 2, and 3 should now be independently functional

---

## Phase 6: User Story 4 - Failed Refresh Detection & Recovery (Priority: P2)

**Goal**: Fallback to 401 reactive logout if background refresh fails and token expires.

**Independent Test**: Inject network fault at T=55 minutes, allow token to expire, restore network, attempt action, verify logout occurs in <1s.

### Implementation for User Story 4

- [x] T014 [US4] Implement log recording for refresh attempts with failure reasons in src/services/auth/sessionRefreshManager.ts
- [x] T015 [US4] Defer background refresh requests when offline and log as failed without clearing session in src/services/auth/sessionRefreshManager.ts
- [x] T016 [US4] Implement single-trigger guard for handleUnauthorized to prevent duplicate logouts on concurrent 401s in src/services/auth/sessionRefreshManager.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 Implement AppState change listeners to reconcile session state upon app foreground transitions in src/services/auth/sessionRefreshManager.ts
- [x] T018 Implement log array cap of 50 entries to prevent memory growth in src/services/auth/sessionRefreshManager.ts
- [x] T019 Ensure cancellation of scheduled timers on logout and unmount in src/providers/AuthProvider.tsx
- [x] T020 Run quickstart.md validation scenarios to verify silent refresh and logout behaviors in src/services/auth/sessionRefreshManager.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable

### Within Each User Story

- Models/interfaces before services
- Services before UI/Provider integrations
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Tasks within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch mockAuthService update and type definitions in parallel:
Task: "Update mockAuthService to generate debug tokens with customized exp claims in src/services/debug/mockAuthService.ts"
Task: "Create type definitions for AuthenticationSession and RefreshAttempt in src/types/auth-refresh.d.ts"
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
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3 & 4
3. Stories complete and integrate independently

