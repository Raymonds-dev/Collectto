# Tasks: Improve Error Messages and HTTP Error Mapping

**Input**: Design documents from `specs/013-error-message-mapping/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests and integration tests are required as specified in the testing strategy.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test framework configuration and initial project configuration for error mapping

- [ ] T001 Install Jest, jest-expo, and @types/jest in package.json
- [ ] T002 [P] Create Jest and Babel config files in jest.config.js and babel.config.js
- [ ] T003 [P] Add TypeScript test types configuration in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralized types, error mapping skeleton, Axios error interceptor hook, and basic ErrorAlert component

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create error mapping types and interfaces in src/types/error.ts
- [ ] T005 Implement base mapErrorToMessage mapping function skeleton in src/utils/errorMapping.ts
- [ ] T006 [P] Create initial unit test suite structure in tests/unit/errorMapping.test.ts
- [ ] T007 Create reusable ErrorAlert UI component in src/components/ui/ErrorAlert.tsx
- [ ] T008 [P] Configure timeout (30 seconds) on Axios instance in src/services/api/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Wrong Password During Login (Priority: P1) 🎯 MVP

**Goal**: Display a specific error message and forgot password/recovery link when wrong password is used for login without leaking email existence

**Independent Test**: Attempt login with incorrect credentials. Verify "Email ou senha incorretos. Tente novamente ou redefina sua senha" is shown, forgot password link is visible, and no dynamic input is echoed.

### Tests for User Story 1

- [ ] T009 [P] [US1] Write unit tests for wrong password (401) login mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 1

- [ ] T010 [US1] Add login wrong password (401) message mapping and AUTH_INVALID_CREDS code in src/utils/errorMapping.ts
- [ ] T011 [US1] Update AuthProvider signIn to map caught errors to MappedError with 'login' context in src/providers/AuthProvider.tsx
- [ ] T012 [US1] Integrate ErrorAlert component and display wrong password message in src/app/(auth)/login.tsx
- [ ] T013 [US1] Add "Forgot Password?" redirect link to password reset flow in src/app/(auth)/login.tsx

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Email Already Registered During Signup (Priority: P1)

**Goal**: Show that the email is already registered and provide direct login navigation link

**Independent Test**: Attempt signup with a registered email. Verify "Este email já está registrado. Faça login com sua conta existente" is displayed with a clickable login redirect link.

### Tests for User Story 2

- [ ] T014 [P] [US2] Write unit tests for email conflict (409) signup mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 2

- [ ] T015 [US2] Add email conflict (409) message mapping and CONFLICT_EMAIL_TAKEN code in src/utils/errorMapping.ts
- [ ] T016 [US2] Update AuthProvider signUp to map caught errors with 'signup' context in src/providers/AuthProvider.tsx
- [ ] T017 [US2] Integrate ErrorAlert component and show email conflict error with redirect login link in src/app/(auth)/user_create.tsx
- [ ] T018 [US2] Implement error clearing on email input change as user types in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 2 is functional and testable independently.

---

## Phase 5: User Story 3 - No Internet Connection (Priority: P1)

**Goal**: Detect network offline state and show a clear connection error message

**Independent Test**: Disconnect from internet and submit form. Verify "Sem conexão de internet. Verifique sua conexão e tente novamente" message is shown.

### Tests for User Story 3

- [ ] T019 [P] [US3] Write unit tests for network offline mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 3

- [ ] T020 [US3] Add network offline mapping and NETWORK_OFFLINE code in src/utils/errorMapping.ts
- [ ] T021 [US3] Implement network listener or interceptor to handle connection state in src/utils/errorMapping.ts
- [ ] T022 [US3] Update login screen to show network offline warning in src/app/(auth)/login.tsx
- [ ] T023 [US3] Update signup screen to show network offline warning in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 3 is functional and testable independently.

---

## Phase 6: User Story 4 - Server Down or Overloaded (Priority: P1)

**Goal**: Detect HTTP 500/503 errors and show server unavailable message with retry count limit and Contact Support link

**Independent Test**: Mock HTTP 500/503 response. Verify "Serviço temporariamente indisponível. Tente novamente em alguns minutos" is shown, with retry button that limits to 3 attempts, then offers "Contact Support".

### Tests for User Story 4

- [ ] T024 [P] [US4] Write unit tests for server errors (500/503) mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 4

- [ ] T025 [US4] Add server error mapping and SERVER_ERROR code in src/utils/errorMapping.ts
- [ ] T026 [US4] Implement retry logic with count threshold and Support redirect in src/app/(auth)/login.tsx
- [ ] T027 [US4] Implement retry logic with count threshold and Support redirect in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 4 is functional and testable independently.

---

## Phase 7: User Story 5 - Invalid Email Format During Signup (Priority: P1)

**Goal**: Display field-level validation and format example when invalid email is entered

**Independent Test**: Submit signup with invalid email format. Verify validation message "Insira um email válido (exemplo: voce@dominio.com)" is displayed immediately, and clears when corrected.

### Tests for User Story 5

- [ ] T028 [P] [US5] Write unit tests for email format validation mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 5

- [ ] T029 [US5] Implement email format validation message mapping in src/utils/errorMapping.ts
- [ ] T030 [US5] Update signup screen to display invalid email message as field-level error in src/app/(auth)/user_create.tsx
- [ ] T031 [US5] Clear the email error immediately as user types a valid format in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 5 is functional and testable independently.

---

## Phase 8: User Story 6 - Username Already Taken During Signup (Priority: P1)

**Goal**: Display username-taken error as field-level validation and preserve rest of form state

**Independent Test**: Attempt signup with a username that is already taken. Verify "Este nome de usuário já está sendo usado. Tente outro" appears next to username field, and form data (email, name) remains intact.

### Tests for User Story 6

- [ ] T032 [P] [US6] Write unit tests for username conflict (409) mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 6

- [ ] T033 [US6] Add username conflict field validation mapping in src/utils/errorMapping.ts
- [ ] T034 [US6] Update signup screen to display username-taken field-level error in src/app/(auth)/user_create.tsx
- [ ] T035 [US6] Ensure form state is preserved when retry occurs in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 6 is functional and testable independently.

---

## Phase 9: User Story 7 - Request Timeout (Priority: P2)

**Goal**: Detect request timeouts (longer than 30s) and show a clear retry suggestion

**Independent Test**: Mock request exceeding 30s. Verify "A solicitação levou muito tempo. Verifique sua conexão e tente novamente" message is shown, and retry button triggers fresh attempt.

### Tests for User Story 7

- [ ] T036 [P] [US7] Write unit tests for timeout detection in tests/unit/errorMapping.test.ts

### Implementation for User Story 7

- [ ] T037 [US7] Implement timeout mapping and NETWORK_TIMEOUT code in src/utils/errorMapping.ts
- [ ] T038 [US7] Integrate timeout handling with retry button on login screen in src/app/(auth)/login.tsx
- [ ] T039 [US7] Integrate timeout handling with retry button on signup screen in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 7 is functional and testable independently.

---

## Phase 10: User Story 8 - Invalid Profile Data During Update (Priority: P2)

**Goal**: Display field-level validation errors with formatting examples on the profile edit form

**Independent Test**: Submit profile edit with invalid name/username. Verify field-level error messages are displayed simultaneously and form updates successfully when corrected.

### Tests for User Story 8

- [ ] T040 [P] [US8] Write unit tests for profile update validation mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 8

- [ ] T041 [US8] Add profile update field validation mapping in src/utils/errorMapping.ts
- [ ] T042 [US8] Update updateProfile service helper to map caught errors with 'profile_update' context in src/services/profileService.ts
- [ ] T043 [US8] Update AccountScreen profile update handler to catch and display fieldErrors in src/app/(tabs)/settings/account.tsx

**Checkpoint**: User Story 8 is functional and testable independently.

---

## Phase 11: User Story 9 - Ambiguous 400 Error (Priority: P2)

**Goal**: Map unhandled/generic 400 bad request errors to a helpful fallback message with Contact Support link

**Independent Test**: Mock 400 bad request with empty message. Verify "Dados inválidos. Verifique suas informações e tente novamente" is shown, with a Contact Support link if it occurs multiple times.

### Tests for User Story 9

- [ ] T044 [P] [US9] Write unit tests for generic 400 fallback mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 9

- [ ] T045 [US9] Add generic 400 fallback mapping and BAD_REQUEST_GENERIC code in src/utils/errorMapping.ts
- [ ] T046 [US9] Update ErrorAlert component to include fallback Support link in src/components/ui/ErrorAlert.tsx
- [ ] T047 [US9] Integrate generic 400 fallback in login and signup screens in src/app/(auth)/login.tsx and src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 9 is functional and testable independently.

---

## Phase 12: User Story 10 - Rate Limiting (Too Many Requests) (Priority: P2)

**Goal**: Detect 429 status code, parse Retry-After header, show countdown timer, and disable retry button

**Independent Test**: Mock HTTP 429 with `Retry-After: 45`. Verify "Muitas tentativas. Aguarde alguns minutos e tente novamente. Tente novamente em 45 segundos" is shown, and action button is disabled for 45 seconds.

### Tests for User Story 10

- [ ] T048 [P] [US10] Write unit tests for 429 status code and Retry-After header parsing in tests/unit/errorMapping.test.ts

### Implementation for User Story 10

- [ ] T049 [US10] Implement rate limit mapping and Retry-After parsing in src/utils/errorMapping.ts
- [ ] T050 [US10] Implement retry button disablement and countdown timer in src/app/(auth)/login.tsx
- [ ] T051 [US10] Implement retry button disablement and countdown timer in src/app/(auth)/user_create.tsx

**Checkpoint**: User Story 10 is functional and testable independently.

---

## Phase 13: User Story 11 - Session Expired During Form Submission (Priority: P3)

**Goal**: Detect 401 on post-auth actions, show session expired alert, preserve form state locally, and redirect to login

**Independent Test**: Mock 401 error during profile update. Verify "Sua sessão expirou. Faça login novamente" message is shown, form data is preserved, and user is redirected to login.

### Tests for User Story 11

- [ ] T052 [P] [US11] Write unit tests for 401 session expired mapping in tests/unit/errorMapping.test.ts

### Implementation for User Story 11

- [ ] T053 [US11] Add session expired (401) mapping for non-login contexts in src/utils/errorMapping.ts
- [ ] T054 [US11] Implement local state preservation and redirection on 401 in src/app/(tabs)/settings/account.tsx

**Checkpoint**: User Story 11 is functional and testable independently.

---

## Phase 14: User Story 12 - Error Code for Support Diagnostics (Priority: P3)

**Goal**: Append a small, unobtrusive diagnostic error code to user-facing alerts for support reference

**Independent Test**: Force any error. Verify that the diagnostic code (e.g. AUTH_INVALID_CREDS) is displayed in small gray text within the error box.

### Tests for User Story 12

- [ ] T055 [P] [US12] Write unit tests verifying correct error codes are attached to every MappedError scenario in tests/unit/errorMapping.test.ts

### Implementation for User Story 12

- [ ] T056 [US12] Update ErrorAlert component to render the `error.code` field in small, low-contrast text in src/components/ui/ErrorAlert.tsx
- [ ] T057 [US12] Add diagnostic logs capturing raw error and corresponding mapped error code in src/utils/errorMapping.ts

**Checkpoint**: User Story 12 is functional and testable independently.

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: Verification, cleanup, type validation, documentation, and final review of Portuguese messages

- [ ] T058 [P] Document error mapping module architecture and integration examples in src/utils/README.md
- [ ] T059 Run full validation suite (npm run validate) to ensure zero lint/format/type errors
- [ ] T060 Run unit tests (npm run test) to verify 100% of scenarios are passing
- [ ] T061 [P] Perform native Brazilian Portuguese proofreading of all mapped messages in src/utils/errorMapping.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Stories 2 to 12**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Unit tests tasks for all User Stories can be developed in parallel by developers before implementation (T009, T014, T019, T024, T028, T032, T036, T040, T044, T048, T052, T055)
- Implementation tasks across different User Stories can proceed in parallel (e.g. Developer A works on US1, Developer B works on US2)

---

## Parallel Example: User Story 1

```bash
# Launch test task and mapping preparation in parallel:
Task: "Write unit tests for wrong password (401) login mapping in tests/unit/errorMapping.test.ts"
Task: "Add login wrong password (401) message mapping and AUTH_INVALID_CREDS code in src/utils/errorMapping.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently by entering wrong password in login screen
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
