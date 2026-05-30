# Tasks: Structured Logging for Authentication Events

**Input**: Design documents from `/specs/012-auth-structured-logging/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated test suites are requested in the spec or configured in the project. Verification is done via runtime checking and manual scenario validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (as per plan.md)
- All paths are relative to the frontend directory: `src/utils/authLogging.ts` and `src/providers/AuthProvider.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial file structure and TypeScript typing setup

- [x] T001 Create files and folders structure for the structured logging feature in src/utils/authLogging.ts
- [x] T002 Configure TypeScript interface contracts and type exports in src/utils/authLogging.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logging infrastructure shell that MUST be completed before any user story work can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement the basic AuthLogger class skeleton and exports in src/utils/authLogging.ts
- [x] T004 Implement the LogBuffer in-memory circular buffer with max 100 capacity and FIFO eviction in src/utils/authLogging.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Debug Production Auth Failures (Priority: P1) 🎯 MVP

**Goal**: Log all authentication operations with detailed context (timestamp, module, action, status, retryCount) to diagnose failures without exposing credentials.

**Independent Test**: Trigger various authentication failure modes (token expiration, API failures, network errors) and verify that complete logs are recorded in the buffer containing the necessary debug fields.

### Implementation for User Story 1

- [x] T005 [P] [US1] Implement startOperation and completeOperation methods in src/utils/authLogging.ts
- [x] T006 [P] [US1] Implement track helper method in src/utils/authLogging.ts
- [x] T007 [US1] Integrate AuthLogger in AuthProvider bootstrapSession, signIn, signUp, and signOut methods in src/providers/AuthProvider.tsx
- [x] T008 [US1] Verify AuthLogger captures auth failures and success states in src/providers/AuthProvider.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Support Team Diagnosis Without Data Access (Priority: P1)

**Goal**: Anonymize user IDs and redact sensitive data (JWTs, email addresses, base64 credentials, and key-value entries) from the logs.

**Independent Test**: Verify that logs do not contain raw passwords, tokens, or email addresses, and that user IDs are successfully anonymized/hashed.

### Implementation for User Story 2

- [x] T009 [P] [US2] Implement redactText regex-based sanitization for JWTs, Emails, and Base64 basic credentials in src/utils/authLogging.ts
- [x] T010 [P] [US2] Implement redactObject recursive key-based redaction for sensitive keys in src/utils/authLogging.ts
- [x] T011 [US2] Implement user ID anonymization/hashing mechanism for log entries in src/utils/authLogging.ts
- [x] T012 [US2] Integrate redaction and anonymization logic into completeOperation in src/utils/authLogging.ts

**Checkpoint**: User Stories 1 and 2 are functional, and all log entries are fully sanitized.

---

## Phase 5: User Story 3 - Performance Issue Diagnosis (Priority: P2)

**Goal**: Measure duration of auth operations and flag those exceeding 1000ms with warning severity.

**Independent Test**: Simulate slow authentication operations (> 1000ms) and verify they are recorded with `severity: 'warn'` and contain accurate duration.

### Implementation for User Story 3

- [x] T013 [US3] Implement duration calculation and warning severity thresholding for operations taking longer than 1000ms in src/utils/authLogging.ts
- [x] T014 [US3] Ensure startOperation and completeOperation measure time difference accurately using Date.now in src/utils/authLogging.ts

**Checkpoint**: User Stories 1, 2, and 3 are functional and include duration tracking.

---

## Phase 6: User Story 4 - Log Inspection Without Persistent Data (Priority: P2)

**Goal**: Maintain logs entirely in memory (100 capacity, FIFO rotation), clear them on restart, and provide accessors for support teams.

**Independent Test**: Generate more than 100 logs to verify oldest are evicted (FIFO), and check that logs do not persist to disk and are cleared on restart.

### Implementation for User Story 4

- [x] T015 [US4] Implement getLogs and clearLogs methods in src/utils/authLogging.ts
- [x] T016 [US4] Ensure there is no persistence to disk/storage in src/utils/authLogging.ts
- [x] T017 [US4] Implement FIFO rotation logic verification for buffer capacity of exactly 100 entries in src/utils/authLogging.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification, code quality, and final cleanup

- [x] T018 Run validation checks including linter, formatting, and typescript compiler checks on src/utils/authLogging.ts and src/providers/AuthProvider.tsx
- [x] T019 [P] Add documentation comments and update the Developer Quickstart verification in specs/012-auth-structured-logging/quickstart.md
- [x] T020 Run manual scenarios validation as described in specs/012-auth-structured-logging/quickstart.md to verify compliance with specifications

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all User Stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion. Can run sequentially (US1 → US2 → US3 → US4) or in parallel.
- **Polish (Phase 7)**: Depends on all user stories being completed.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Can start after Phase 2.
- **User Story 2 (P1)**: Can run in parallel with or after US1, but redaction integrates with logs generated in US1.
- **User Story 3 (P2)**: Extends timing measurements to operations implemented in US1.
- **User Story 4 (P2)**: Exposes operations and buffer implemented in US1.

### Parallel Opportunities

- Setup tasks T001 and T002.
- Basic complete/track implementations (T005, T006) and initial AuthProvider integration (T007, T008).
- Sanitizer utilities (T009, T010).
- Documentation (T019).

---

## Parallel Example: User Story 1

```bash
# Implement the logging and timing utilities in parallel:
Task: "T005 [P] [US1] Implement startOperation and completeOperation methods in src/utils/authLogging.ts"
Task: "T006 [P] [US1] Implement track helper method in src/utils/authLogging.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (Critical - blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Test User Story 1 independently.

### Incremental Delivery

1. Setup + Foundation.
2. User Story 1 (P1 - MVP).
3. User Story 2 (P1 - Security/Sanitization).
4. User Story 3 (P2 - Performance).
5. User Story 4 (P2 - Buffering & In-Memory Inspection).
6. Polish & Final Verification.

---

## Notes

- [P] tasks = different files or decoupled functions, no dependencies.
- [Story] labels map tasks to specific user stories for traceability.
- Each user story is independently completable and testable.
- Commit after each task or logical group of tasks.

