# Implementation Plan: Centralize Input Validation for Auth & User

**Branch**: `feature/010-centralize-auth-validation` | **Date**: 2026-05-25 | **Spec**: [specs/010-centralized-validation/spec.md](spec.md)
**Input**: Feature specification from `/specs/010-centralized-validation/spec.md`

## Summary

This feature centralizes input validation logic for all Authentication (signup, login) and User Profile screens in the Collectto application. All validators will be written as synchronous, pure functions in a single utility file (`src/utils/validation.ts`). UI screens will delegate 100% of their field validation concerns to these functions, ensuring unified error messages, consistent validation behavior, and robust edge-case handling (such as Unicode-enabled email domain validation and UTC-based age calculation).

## Technical Context

**Language/Version**: TypeScript ~5.9.2  
**Primary Dependencies**: React 19.1.0, React Native 0.81.5, Expo 54.0.34  
**Storage**: N/A  
**Testing**: Jest / ts-jest (to be added/configured for utility unit tests)  
**Target Platform**: iOS, Android (React Native / Expo)  
**Project Type**: mobile-app  
**Performance Goals**: <100ms response time (execution of pure validation functions is synchronous and instant)  
**Constraints**: All validators must be pure functions with zero side effects, returning a `[isValid, errorMessage]` tuple.  
**Scale/Scope**: 3 core screens affected: `LoginScreen`, `UserCreateScreen`, `AccountScreen`.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Alignment with Collectto Constitution 1.0.0:

- **Visual First**: N/A (logic-only refactoring; visual representation of error messages in UI remains unchanged)
- **Fluidez Acima de Complexidade**: ✓ (real-time validation validation without network lag improves user flow and interaction responsiveness)
- **Consistência > Criatividade Isolada**: ✓ (ensures the exact same validation criteria and error text apply to the same fields across all screens)
- **Coleção É Identidade**: N/A
- **Microinterações, Performance e Motion Oficial**: ✓ (pure, highly-optimized validators execute in <1ms, avoiding blockages or unnecessary rendering overhead)

## Project Structure

### Documentation (this feature)

```text
specs/010-centralized-validation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── validation.contract.ts
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx          # Refactored: delegates validation to utils
│   │   └── user_create.tsx    # Refactored: delegates validation to utils
│   └── (tabs)/
│       └── settings/
│           └── account.tsx    # Refactored: delegates validation to utils
├── utils/
│   └── validation.ts          # New: centralized validation pure functions
```

**Structure Decision**: Mobile App structure. Added `src/utils/validation.ts` to hold all validators, while updating the route screen files under `src/app/` to utilize the new centralized rules.

## Complexity Tracking

_No violations detected. Standard utility centralization aligning with Diretrizes de Engenharia e Arquitetura._

---

## Phase 2: Implementation Roadmap

### Phase 2.1: Core Validators Implementation

**Deliverables:**
- `src/utils/validation.ts` containing the following functions:
  - `validateEmail(email: string): ValidationResult`
  - `validateUsername(username: string): ValidationResult`
  - `validatePassword(password: string): ValidationResult`
  - `validateDate(dateStr: string): ValidationResult`
  - `validateBirthday(birthdayStr: string): ValidationResult`

**Key Responsibilities:**
- Export `ValidationResult` type definition.
- Build regex-based validation for Email (with Unicode property `\p{L}`) and Username (3-20 length check, regex `/^[a-z0-9_]+$/`).
- Build Password length and whitespace verification.
- Build Date structure parsing (`yyyy-MM-dd`) and calendar sanity checks.
- Build UTC-based age math for birthday (at least 13 years old).
- Write extensive JSDoc headers for all functions.

**Success Criteria:**
- Functions match the defined validation contracts exactly.
- Execution time is well within the 100ms threshold.

### Phase 2.2: Unit Test Suite & Validation

**Deliverables:**
- `src/utils/__tests__/validation.test.ts`
- Jest command execution setup in `package.json` if needed, or a validation script.

**Key Responsibilities:**
- Write test cases for each validator checking:
  - Valid and invalid email structures (including international domains like `.中国`).
  - Username length boundaries (2, 3, 20, 21 chars) and invalid characters (uppercase, spaces).
  - Password whitespace-only checks, short passwords, and valid passwords.
  - Leap years, invalid calendar dates (e.g. `2026-02-30`), and incorrect patterns.
  - Birthday boundary ages (exactly 13, 12, 14 years old) in UTC.
- Enforce 100% statement and branch coverage on `src/utils/validation.ts`.

**Success Criteria:**
- All tests pass successfully.
- 100% coverage achieved.

### Phase 2.3: User Signup Screen Refactoring

**Deliverables:**
- Updated `src/app/(auth)/user_create.tsx`

**Key Responsibilities:**
- Clean up custom regex and length checks on email, username, password, birthday, and confirmPassword fields.
- Integrate the centralized validators.
- Map the validation errors to the error display states in the form components.
- Ensure same workflow steps (Step 1 and Step 2) behave identically with no regressions.

**Success Criteria:**
- Signup form successfully rejects invalid data with correct error messages.
- Form submits valid data to the backend correctly.

### Phase 2.4: Login Screen Refactoring

**Deliverables:**
- Updated `src/app/(auth)/login.tsx`

**Key Responsibilities:**
- Replace manual `email.trim()` and empty password checks.
- Use `validateEmail` and `validatePassword`.
- Maintain the debug mode bypass logic: if `isDebugModeEnabled()` is true, bypass validation.

**Success Criteria:**
- Login validation runs instantly on submit.
- Normal and debug login flows function correctly.

### Phase 2.5: Account Settings Screen Refactoring

**Deliverables:**
- Updated `src/app/(tabs)/settings/account.tsx`

**Key Responsibilities:**
- Replace manual username validation regex check in `handleEditProfile`.
- Use `validateUsername`.
- Integrate validation for birthday if the user edits or updates it, using `validateBirthday`.

**Success Criteria:**
- Profile update validations match signup validations exactly.
- Validation failures trigger correct `Alert.alert` dialogs in the UI.

### Phase 2.6: Compliance Verification & Code Audit

**Deliverables:**
- Code audit results showing zero manual validations in the UI layer.

**Key Responsibilities:**
- Scan project directories to ensure no local validation regexes or local validation logic remains in components.
- Run `npm run validate` to ensure TypeScript compilation, ESLint, and Prettier checks pass cleanly.
