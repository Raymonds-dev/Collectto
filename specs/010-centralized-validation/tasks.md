---
description: 'Task list for centralizing input validation'
---

# Tasks: Centralize Input Validation for Auth & User

**Input**: Design documents from `/specs/010-centralized-validation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The tasks below include unit test tasks. Unit tests are required by Success Criterion SC-002 and the Implementation Plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- All paths refer to the frontend project root at `C:\Users\garam\.projetos\Collectto\frontend`
- Source files are under `src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test runner configuration

- [x] T001 Configure Jest and ts-jest dependencies and add test scripts in package.json
- [x] T002 Create Jest configuration file jest.config.js
- [x] T003 [P] Create validation utility file src/utils/validation.ts with TypeScript types ValidationResult and ValidatorFunction

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define empty validator functions (validateEmail, validateUsername, validatePassword, validateDate, validateBirthday) in src/utils/validation.ts conforming to contracts/validation.contract.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-time Email Validation (Priority: P1) 🎯 MVP

**Goal**: Centralize email validation logic and ensure it is consistently enforced across the signup and login forms.

**Independent Test**: Enter various email formats on the signup form and verify they are validated with the same rules in the login screen.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Create unit tests for validateEmail in src/utils/__tests__/validation.test.ts

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement validateEmail with Unicode regex and trim support in src/utils/validation.ts
- [x] T007 [P] [US1] Refactor signup step 1 in src/app/(auth)/user_create.tsx to use validateEmail
- [x] T008 [P] [US1] Refactor login form in src/app/(auth)/login.tsx to use validateEmail

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Username Format Consistency (Priority: P1)

**Goal**: Centralize username validation and ensure consistency across signup and profile edit forms.

**Independent Test**: Enter different username patterns on both the signup and profile edit screens and check they produce identical validation results.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US2] Create unit tests for validateUsername in src/utils/__tests__/validation.test.ts

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement validateUsername with length and character checks in src/utils/validation.ts
- [x] T011 [P] [US2] Refactor signup step 2 in src/app/(auth)/user_create.tsx to use validateUsername
- [x] T012 [P] [US2] Refactor profile edit in src/app/(tabs)/settings/account.tsx to use validateUsername

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Password Strength Requirements (Priority: P1)

**Goal**: Centralize password strength requirements and enforce a minimum of 8 characters (excluding empty/spaces-only passwords) uniformly across forms.

**Independent Test**: Attempt to sign up or log in with short or spaces-only passwords and verify they are rejected with a standardized error message.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US3] Create unit tests for validatePassword in src/utils/__tests__/validation.test.ts

### Implementation for User Story 3

- [x] T014 [P] [US3] Implement validatePassword in src/utils/validation.ts
- [x] T015 [P] [US3] Refactor signup step 2 in src/app/(auth)/user_create.tsx to use validatePassword
- [x] T016 [P] [US3] Refactor login form in src/app/(auth)/login.tsx to use validatePassword

**Checkpoint**: User Stories 1, 2, and 3 should now be functional and testable independently

---

## Phase 6: User Story 4 - Age Verification with Consistent Date Validation (Priority: P2)

**Goal**: Implement calendar date validation and ensure the user's age is at least 13 years (in UTC) on both signup and profile forms.

**Independent Test**: Verify birthday selection on signup and profile screens against yyyy-MM-dd format and 13-year age threshold (including boundary values).

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T017 [P] [US4] Create unit tests for validateDate and validateBirthday in src/utils/__tests__/validation.test.ts

### Implementation for User Story 4

- [x] T018 [P] [US4] Implement validateDate in src/utils/validation.ts
- [x] T019 [US4] Implement validateBirthday in src/utils/validation.ts using validateDate and UTC-based age calculation
- [x] T020 [P] [US4] Refactor signup step 1 in src/app/(auth)/user_create.tsx to use validateBirthday
- [x] T021 [P] [US4] Refactor profile edit in src/app/(tabs)/settings/account.tsx to use validateBirthday

**Checkpoint**: All user stories should now be independently functional up to US4

---

## Phase 7: User Story 5 - Global Validation Rule Updates (Priority: P3)

**Goal**: Demonstrate the ease of global maintenance by adding an uppercase constraint to the password validator in a single place.

**Independent Test**: Modify password validator, run tests, and check that both login and signup screens reject passwords without uppercase without any component code updates.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US5] Update password unit tests in src/utils/__tests__/validation.test.ts to require at least one uppercase letter

### Implementation for User Story 5

- [x] T023 [P] [US5] Update validatePassword in src/utils/validation.ts to enforce at least one uppercase letter

**Checkpoint**: All user stories should now be fully complete and verified

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 Ensure all validator functions in src/utils/validation.ts contain full JSDoc comments with examples
- [x] T025 Run type checks, linting, and formatting checks using npm run validate
- [x] T026 Audit project files to verify no inline validation regexes or local validation logic remains in components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3 to 7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Depends on User Story 3 being completed (since it updates the password validator implemented in US3)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Validator utility functions before screen integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1, 2, 3, and 4 can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Screen integrations within a story marked [P] can run in parallel (e.g. login and signup screens)

---

## Parallel Example: User Story 1

```bash
# Launch test creation and validator implementation:
Task: "Create unit tests for validateEmail in src/utils/__tests__/validation.test.ts"
Task: "Implement validateEmail with Unicode regex and trim support in src/utils/validation.ts"

# Refactor forms in parallel:
Task: "Refactor signup step 1 in src/app/(auth)/user_create.tsx to use validateEmail"
Task: "Refactor login form in src/app/(auth)/login.tsx to use validateEmail"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, and 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3, 4, 5: User Stories 1, 2, 3 (P1 requirements: email, username, password validation)
4. **STOP and VALIDATE**: Test core validators independently
5. Verify signup and login screens function correctly with P1 validators

### Incremental Delivery

1. Complete Setup + Foundational → Testing framework & validation skeleton ready
2. Add User Story 1 (Email) → Test independently → Verify in Signup & Login
3. Add User Story 2 (Username) → Test independently → Verify in Signup & Account
4. Add User Story 3 (Password) → Test independently → Verify in Signup & Login
5. Add User Story 4 (Date/Birthday) → Test independently → Verify in Signup & Account
6. Add User Story 5 (Password Uppercase Update) → Test globally → Verify changes automatically propagate

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Email) & User Story 3 (Password)
   - Developer B: User Story 2 (Username) & User Story 4 (Date/Birthday)
3. Developer A or B implements User Story 5 (Global password update verification)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
