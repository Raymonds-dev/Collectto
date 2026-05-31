# Tasks: Centralize HTTP Client with Interceptors

**Input**: Design documents from `/specs/007-http-client-centralization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit and integration tests (Skipped per user request).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume a single project structure under the `src/` directory.
- Test files are placed in `src/services/api/__tests__/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install Jest, ts-jest, and testing dependencies in package.json (Skipped)
- [x] T002 Configure Jest and mock settings in jest.config.js (Skipped)
- [x] T003 [P] Configure TypeScript paths and compiler options for tests in tsconfig.json (Skipped)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define type interfaces for ApiError and HttpClient methods in src/services/api/types.ts
- [x] T005 [P] Create configuration defaults and constants in src/services/api/config.ts
- [x] T006 [P] Initialize base environment loading template in src/services/api/env.ts
- [x] T007 Implement HttpClientProvider context provider in src/providers/HttpClientProvider.tsx
- [x] T008 [P] Integrate HttpClientProvider into application root in App.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic Authentication Header Injection (Priority: P1) 🎯 MVP

**Goal**: Automatically inject Authorization bearer header on all outgoing authenticated requests from session storage.

**Independent Test**: Mock session storage to return a valid token, call the client, and assert the outgoing Request headers contain the `Authorization: Bearer <token>` header.

### Tests for User Story 1

- [x] T009 [P] [US1] Write unit tests for request token injection in src/services/api/__tests__/auth_interceptor.test.ts (Skipped)

### Implementation for User Story 1

- [x] T010 [US1] Implement HttpClient core class and token injection request interceptor in src/services/api/client.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Network Error Retry with Exponential Backoff (Priority: P1)

**Goal**: Automatically retry transient network failures up to 3 times with exponential backoff (1s, 2s, 4s).

**Independent Test**: Mock the HTTP server to throw a network error on attempts 1 and 2, and succeed on 3. Verify request succeeds without UI intervention.

### Tests for User Story 2

- [x] T011 [P] [US2] Write unit and integration tests for exponential backoff retry in src/services/api/__tests__/retry_interceptor.test.ts (Skipped)

### Implementation for User Story 2

- [x] T012 [US2] Implement RetryInterceptor with backoff calculation and check logic in src/services/api/interceptors.ts
- [x] T013 [US2] Register RetryInterceptor in HttpClient axios instance within src/services/api/client.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Unified Error Response Mapping (Priority: P1)

**Goal**: Intercept all outgoing response errors and normalize them into a single, predictable `ApiError` interface structure.

**Independent Test**: Call an endpoint that returns 401, 500, or a network failure. Assert that the thrown error is an instance of `ApiError` with proper `code` and `message` properties.

### Tests for User Story 3

- [x] T014 [P] [US3] Write unit tests for response error mapping to ApiError in src/services/api/__tests__/error_interceptor.test.ts (Skipped)

### Implementation for User Story 3

- [x] T015 [US3] Implement ErrorInterceptor to transform errors into normalized ApiError in src/services/api/interceptors.ts
- [x] T016 [US3] Register ErrorInterceptor in HttpClient axios instance within src/services/api/client.ts

**Checkpoint**: User Stories 1, 2, and 3 should work independently and handle errors consistently.

---

## Phase 6: User Story 4 - Environment-Based Base URL Configuration (Priority: P2)

**Goal**: Configure API base URL using `process.env.EXPO_PUBLIC_API_BASE_URL` with a secure default fallback.

**Independent Test**: Start client with varied env configurations and verify that HTTP requests target the correct base URL.

### Tests for User Story 4

- [x] T017 [P] [US4] Write unit tests for environment loading and base URL validation in src/services/api/__tests__/env.test.ts (Skipped)

### Implementation for User Story 4

- [x] T018 [US4] Update environment configuration loader to use EXPO_PUBLIC_API_BASE_URL in src/services/api/env.ts
- [x] T019 [US4] Load and set base URL dynamically on startup in src/providers/HttpClientProvider.tsx

**Checkpoint**: Base URL is fully configurable and tested under different environment options.

---

## Phase 7: User Story 5 - Request Timeout Configuration (Priority: P2)

**Goal**: Set a default timeout of 15 seconds for all requests, allowing request-specific overrides.

**Independent Test**: Mock a hanging endpoint. Verify that the client throws a timeout error after 15 seconds.

### Tests for User Story 5

- [x] T020 [P] [US5] Write unit tests for request timeout and override behavior in src/services/api/__tests__/timeout.test.ts (Skipped)

### Implementation for User Story 5

- [x] T021 [US5] Implement 15-second default timeout and request-specific timeout overrides in src/services/api/client.ts

**Checkpoint**: Request timeouts are enforced globally and configurable per call.

---

## Phase 8: User Story 6 - 100% API Call Centralization (Priority: P1)

**Goal**: Migrate all existing HTTP calls throughout the codebase to the centralized client, removing direct Axios and Fetch dependencies.

**Independent Test**: Verify that there are zero direct fetch or standalone axios calls in `src/` outside the client wrapper and external direct uploads.

### Implementation for User Story 6

- [x] T022 [US6] Refactor user-related API endpoints to use HttpClient instead of direct Axios in src/services/api/api.ts
- [x] T023 [US6] Refactor social explore API methods to use HttpClient in src/services/api/explore.ts
- [x] T024 [US6] Refactor profile API updates and token checks to use HttpClient in src/services/profileService.ts
- [x] T025 [US6] Migrate all remaining functions and delete old API file src/services/api/api.ts

**Checkpoint**: All user stories should now be independently functional and 100% centralized.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T026 [P] Document HttpClient usage, errors, and interceptors in src/services/api/README.md
- [x] T027 Code cleanup, verify lint, types, and formatting via npm run validate
- [x] T028 Run and verify all unit and integration tests via npm test (Skipped)
- [x] T029 Perform final codebase audit to ensure no direct Axios or fetch calls remain
