# Specification: Improve Error Messages and HTTP Error Mapping

**Feature Name**: Improve Error Messages and HTTP Error Mapping  
**Feature Branch**: `feature/013-error-message-mapping`  
**Created**: 2024  
**Status**: In Planning  
**Priority**: P0 - Critical (Foundational for UX)

---

## 1. Overview

### Problem Statement

Currently, the Collectto application displays generic or technical error messages to users when operations fail:

- **Raw HTTP status codes**: "401 Unauthorized", "409 Conflict"
- **Generic messages**: "Falha ao fazer login" (Login failed) without context
- **Lack of actionable guidance**: Users don't know if the server is down, their input is wrong, or their network is offline
- **Support burden**: Support team receives vague "it doesn't work" tickets with no diagnostic information

This creates a poor user experience, especially for:
- First-time users attempting signup
- Users with weak or incorrect credentials
- Users with network connectivity issues
- Users trying to use already-registered emails or usernames

### Solution Overview

Implement a centralized error mapping system that:

1. **Maps all HTTP status codes to user-friendly messages** in Portuguese
2. **Provides context-specific messages** that differ based on the operation (login, signup, profile update)
3. **Includes actionable recovery suggestions** where applicable
4. **Categorizes errors** (validation, network, server, unknown) for frontend decision-making
5. **Excludes technical details and sensitive data** from all user-facing messages
6. **Enables support diagnostics** by preserving error codes for backend logging

### Success Definition

Users see clear, actionable Portuguese error messages instead of technical codes. They understand what went wrong and how to recover. Support team can diagnose issues from error descriptions.

---

## 2. User Stories

### User Story 1 - Wrong Password During Login (Priority: P1)

**As a** user logging in  
**I want to** see a specific message when I enter the wrong password  
**So that** I know I should try again with a different password or reset my password

**Why this priority**: Fundamental security and UX - most common auth failure, must not leak information about whether email exists

**Independent Test**: Can be fully tested by attempting login with known email and wrong password, verifying user-friendly message appears instead of "401 Unauthorized"

**Acceptance Scenarios**:

1. **Given** I am on the login screen, **When** I submit wrong password for a registered email, **Then** I see "Email ou senha incorretos. Tente novamente ou redefina sua senha" (Email or password is incorrect. Try again or reset your password)
2. **Given** I see the wrong-password error, **When** I click "Forgot Password?", **Then** I am taken to the password reset flow
3. **Given** I see the error message, **When** I re-examine the message, **Then** it does not reveal whether the email or password was wrong (prevents email enumeration)

---

### User Story 2 - Email Already Registered During Signup (Priority: P1)

**As a** user signing up  
**I want to** see that the email is already registered  
**So that** I can choose to log in instead or use a different email

**Why this priority**: Core signup flow - users need clear path to recover when email conflict occurs

**Independent Test**: Can be fully tested by attempting signup with an already-registered email, verifying specific message and login link appear

**Acceptance Scenarios**:

1. **Given** I am on the signup screen, **When** I submit a form with an already-registered email, **Then** I see "Este email já está registrado. Faça login com sua conta existente" (This email is already registered. Log in with your existing account)
2. **Given** I see the email-taken message, **When** I click the login link, **Then** I am taken to the login screen
3. **Given** I see the error, **When** I change the email field, **Then** the error clears or updates as I type

---

### User Story 3 - No Internet Connection (Priority: P1)

**As a** user with no network connectivity  
**I want to** see a clear message that my internet is disconnected  
**So that** I can reconnect and try again

**Why this priority**: Critical for users on unstable connections - must differentiate from server errors

**Independent Test**: Can be fully tested by simulating network offline (kill wifi, dev tools offline mode), verifying immediate "no connection" message appears

**Acceptance Scenarios**:

1. **Given** my device is offline, **When** I attempt to submit a form (login/signup/profile update), **Then** I see "Sem conexão de internet. Verifique sua conexão e tente novamente" (No internet connection. Check your connection and try again)
2. **Given** I see the offline message, **When** I reconnect to internet and click retry, **Then** the request succeeds (or shows next error if other issue exists)
3. **Given** I am offline, **When** I navigate between screens, **Then** offline message is shown consistently (not repeated aggressively)

---

### User Story 4 - Server Down or Overloaded (Priority: P1)

**As a** user during a service outage  
**I want to** see that it's a server issue, not my fault  
**So that** I don't waste time troubleshooting my account or connection

**Why this priority**: Service reliability communication - users must trust the app will recover, not assume they did something wrong

**Independent Test**: Can be fully tested by mocking HTTP 500/503 response, verifying server-error message appears with retry affordance

**Acceptance Scenarios**:

1. **Given** the backend is returning 500/503 errors, **When** I attempt to submit, **Then** I see "Serviço temporariamente indisponível. Tente novamente em alguns minutos" (Service temporarily unavailable. Try again in a few minutes)
2. **Given** I see the server-error message, **When** I click retry, **Then** the request is attempted again (with exponential backoff)
3. **Given** I retry 3 times without success, **When** no additional retries are triggered, **Then** a "Contact Support" option appears instead of infinite retries

---

### User Story 5 - Invalid Email Format During Signup (Priority: P1)

**As a** user signing up  
**I want to** see specific guidance when my email format is invalid  
**So that** I know exactly what to fix

**Why this priority**: Common validation error - users need clear formatting guidance

**Independent Test**: Can be fully tested by submitting signup form with invalid email (e.g., missing @), verifying field-level error with example appears

**Acceptance Scenarios**:

1. **Given** I submit signup with invalid email (no @, no domain), **When** the backend validates, **Then** I see field error "Insira um email válido (exemplo: voce@dominio.com)" (Enter a valid email address (example: you@domain.com))
2. **Given** the error is shown, **When** I correct the email, **Then** the error clears immediately (client-side validation)
3. **Given** multiple validation errors exist (email + password), **When** form is submitted, **Then** all errors are shown simultaneously (not one at a time)

---

### User Story 6 - Username Already Taken During Signup (Priority: P1)

**As a** user signing up  
**I want to** see that my chosen username is taken  
**So that** I can pick a different one immediately

**Why this priority**: Common conflict in signup - must be handled gracefully without losing form data

**Independent Test**: Can be fully tested by submitting signup with taken username, verifying field-level error and ability to retry with new username

**Acceptance Scenarios**:

1. **Given** I submit signup with a username that already exists, **When** the backend returns 409 conflict, **Then** I see field error "Este nome de usuário já está sendo usado. Tente outro" (This username is already taken. Try a different one)
2. **Given** I see the username-taken error, **When** I edit only the username field, **Then** the form does not require me to re-enter email or password
3. **Given** the error appears, **When** I retry with a new username, **Then** the request succeeds (assuming other fields are valid)

---

### User Story 7 - Request Timeout (Priority: P2)

**As a** user on a slow network  
**I want to** see that the request timed out, not that I did something wrong  
**So that** I can retry without panic

**Why this priority**: Secondary network error - important for slow connectivity but less common than full offline

**Independent Test**: Can be fully tested by simulating request that exceeds 30s timeout, verifying timeout message appears instead of connection error

**Acceptance Scenarios**:

1. **Given** a request exceeds the timeout threshold (30s), **When** the request aborts, **Then** I see "A solicitação levou muito tempo. Verifique sua conexão e tente novamente" (The request took too long. Check your connection and try again)
2. **Given** I see the timeout message, **When** I click retry, **Then** the request is attempted again with a fresh timeout
3. **Given** multiple timeouts occur, **When** retries continue failing, **Then** a fallback "Contact Support" message appears after 3 attempts

---

### User Story 8 - Invalid Profile Data During Update (Priority: P2)

**As a** user updating my profile  
**I want to** see what field is invalid and how to fix it  
**So that** I can correct it and save

**Why this priority**: Post-signup operations - users must be able to edit profiles without losing partial changes

**Independent Test**: Can be fully tested by submitting profile update with invalid data (bad phone, invalid birth date), verifying field-level errors with format examples

**Acceptance Scenarios**:

1. **Given** I update my profile with invalid phone number, **When** the backend validates, **Then** I see field error with format example (e.g., "(XX) XXXXX-XXXX")
2. **Given** multiple fields have validation errors, **When** I submit, **Then** all errors are shown simultaneously (not sequentially)
3. **Given** I see field errors, **When** I correct them and resubmit, **Then** the profile updates successfully

---

### User Story 9 - Ambiguous 400 Error (Priority: P2)

**As a** user encountering an ambiguous 400 error  
**I want to** see a helpful fallback message  
**So that** I don't think the app is broken

**Why this priority**: Edge case handling - important for robustness but less common with good API design

**Independent Test**: Can be fully tested by mocking 400 response with no error details, verifying fallback message appears

**Acceptance Scenarios**:

1. **Given** the API returns HTTP 400 with no specific error details, **When** I attempt a request, **Then** I see "Dados inválidos. Verifique suas informações e tente novamente" (Invalid data. Check your information and try again)
2. **Given** the fallback message appears, **When** I review my input, **Then** I can usually identify the issue (even though message is generic)
3. **Given** I receive this error multiple times, **When** no other information is available, **Then** a "Contact Support" link is visible in the UI

---

### User Story 10 - Rate Limiting (Too Many Requests) (Priority: P2)

**As a** user or system hitting rate limits  
**I want to** see how long to wait  
**So that** I understand I need to pause before retrying

**Why this priority**: API protection - important for security and UX but less common for legitimate users

**Independent Test**: Can be fully tested by hitting rate limit threshold and verifying 429 message with wait suggestion appears

**Acceptance Scenarios**:

1. **Given** I exceed the rate limit (too many requests in short time), **When** the API returns 429, **Then** I see "Muitas tentativas. Aguarde alguns minutos e tente novamente" (Too many attempts. Wait a few minutes and try again)
2. **Given** the API includes Retry-After header, **When** the message is shown, **Then** it includes the wait duration (e.g., "Tente novamente em 60 segundos" - Try again in 60 seconds)
3. **Given** the rate limit is active, **When** I click retry before the wait expires, **Then** the retry button is disabled or shows countdown timer

---

### User Story 11 - Session Expired During Form Submission (Priority: P3)

**As a** user whose session expires while editing  
**I want to** be asked to log in again, not lose my data  
**So that** I don't have to restart

**Why this priority**: Post-auth operations - nice-to-have but requires form state preservation

**Independent Test**: Can be fully tested by expiring session mid-form-edit, verifying session-expired message and form-state preservation

**Acceptance Scenarios**:

1. **Given** I am editing a profile form, **When** my session expires and I submit, **Then** I see "Sua sessão expirou. Faça login novamente" (Your session expired. Log in again)
2. **Given** I see the session-expired message, **When** I log back in, **Then** I am returned to the profile form (not home screen)
3. **Given** I am on the profile form, **When** I log back in, **Then** my form data is pre-filled from local state (if possible)

---

### User Story 12 - Error Code for Support Diagnostics (Priority: P3)

**As a** support agent  
**I want to** the user to describe their error in a way I can diagnose  
**So that** I can resolve tickets faster

**Why this priority**: Operations and support - valuable for post-launch but not required for MVP

**Independent Test**: Can be fully tested by capturing error codes and verifying they are searchable in backend logs for correlation

**Acceptance Scenarios**:

1. **Given** a user experiences an error, **When** they contact support, **Then** they can provide an error code (e.g., "AUTH_INVALID_CREDS") that support can search in logs
2. **Given** support has an error code, **When** they search the logs, **Then** they can correlate to the exact request and user session
3. **Given** an error message is shown to user, **When** error code is visible (small, gray text), **Then** it is not prominent but accessible if user chooses to share

---

### Edge Cases

- **Offline behavior**: App detects offline before API call; "No connection" message appears immediately without timeout
- **Intermittent connectivity**: Slow network that eventually times out shows timeout message, not connection message
- **Network change mid-request**: If network drops during request, show "connection lost" not original error
- **Retry after reconnection**: Auto-retry should not be intrusive; manual retry button is safer
- **Missing error detail from API**: If 400 returned with no error field, use generic fallback message
- **Unexpected response format**: If error response is malformed, log it and show generic "Something went wrong" message
- **Duplicate requests**: If user clicks button twice, show error only once; debounce submissions
- **Partial errors**: If multiple fields fail validation, show all errors simultaneously; don't stop at first
- **Rapid retry clicks**: Debounce/disable retry button during request to prevent duplicate submissions
- **Navigating away**: If user navigates during pending request, clean up pending errors (don't show stale errors on next screen)
- **Background requests**: For background sync, error should not disrupt UX; log and retry silently
- **Email enumeration prevention**: Never confirm whether email exists; generic message only
- **Password details**: Never mention password in error message (too specific)
- **Token/session exposure**: Never expose auth tokens, session IDs, or internal identifiers
- **User PII leakage**: Do not repeat user input in error messages (e.g., "That email" not "john@example.com was rejected")

---

## 3. Requirements

### Functional Requirements

**FR-013-001: Centralized Error Mapping Module**
- System MUST provide a centralized error mapping capability that:
  - Accepts HTTP status code, operation context, and optional API error details
  - Returns a user-friendly Portuguese error message
  - Provides consistent behavior (no side effects)
  - Supports error contexts: login, signup, profile_update, and generic fallback
  - Provides a fallback message for unmapped status codes

**FR-013-002: HTTP Status Code Mapping**
- System MUST map HTTP 400 (Bad Request) to validation error category
- System MUST map HTTP 401 (Unauthorized) to auth error; message varies by context (login vs. session expired)
- System MUST map HTTP 403 (Forbidden) to permission error: "Você não tem permissão para fazer isso" (You don't have permission to do this)
- System MUST map HTTP 404 (Not Found) to resource error: "Recurso não encontrado" (Resource not found)
- System MUST map HTTP 409 (Conflict) to conflict error; message varies by conflict type (email, username)
- System MUST map HTTP 429 (Too Many Requests) to rate limit error: "Muitas tentativas. Aguarde alguns minutos e tente novamente"
- System MUST map HTTP 5xx (Server Error) to server error: "Serviço temporariamente indisponível. Tente novamente em alguns minutos"

**FR-013-003: Context-Specific Messages**
- System MUST provide different error messages for login vs. signup vs. profile_update contexts
- Login context: "Email ou senha incorretos..." (for 401), "Sua conta foi bloqueada" (for 403), etc.
- Signup context: "Este email já está registrado..." (for 409 email conflict), "Este nome de usuário já está sendo usado..." (for 409 username conflict)
- Profile update context: Field-level errors, e.g., "Insira um email válido"
- Same HTTP status code returns different messages for different contexts

**FR-013-004: Error Detail Parsing**
- System MUST extract `error.field` and `error.message` from API response body
- System MUST use field information to customize message (e.g., email conflict vs. username conflict)
- System MUST fall back to default message if no field is specified
- System MUST not expose API error message verbatim; must translate to user-friendly message

**FR-013-005: Network Error Detection and Mapping**
- System MUST detect network connectivity issues including:
  - Complete loss of internet connectivity (offline)
  - Request timeout exceeding the configured threshold
  - Network request failures
- System MUST map these to appropriate messages ("Sem conexão de internet" for offline, "A solicitação levou muito tempo" for timeout)
- All network errors MUST be flagged as retryable

**FR-013-006: Error Categorization**
- System MUST categorize all errors as one of: VALIDATION, AUTH, CONFLICT, NOT_FOUND, NETWORK, TIMEOUT, SERVER, UNKNOWN
- System MUST return category alongside message (or as separate field)
- Frontend uses category to decide: show retry, show form error, show recovery link, etc.

**FR-013-007: No Sensitive Data**
- System MUST NOT include email addresses in error messages
- System MUST NOT include passwords in error messages
- System MUST NOT include tokens or session IDs in error messages
- System MUST NOT include user IDs or internal identifiers
- System MUST NOT include stack traces
- System MUST NOT distinguish between "email not found" and "password wrong" for login (prevents email enumeration)

**FR-013-008: Portuguese Language Support**
- System MUST provide all user-facing messages in Portuguese (Brazilian Portuguese, pt-BR)
- Messages MUST follow correct grammar and punctuation
- Tone MUST match Collectto brand voice (professional, warm, human)
- Messages MUST avoid slang or idioms that may not translate
- Messages MUST be translatable (not hardcoded; strings can be moved to i18n later)

**FR-013-009: Recovery Suggestions**
- Network error messages MUST include "Verifique sua conexão e tente novamente" (Check your connection and try again)
- Server error messages MUST include "Tente novamente em alguns minutos" (Try again in a few minutes)
- Email conflict messages MUST include "Faça login com sua conta existente" (Log in with your existing account)
- Session expired messages MUST include "Faça login novamente" (Log in again)
- Each message MUST be max 2 sentences (~150 characters per line)
- Suggestions MUST be actionable (user knows what to do next)

**FR-013-010: Integration with Existing Error Handlers**
- HTTP client MUST call error mapping on all error responses
- Auth module MUST pass context ("login", "signup") to error mapping
- Form handlers MUST pass context ("profile_update") to error mapping
- Error messages MUST be displayed in UI error components (alerts, toasts, inline field errors)
- Logging MUST capture full error details (statusCode, full API response, context, mapped message)

**FR-013-011: Timeout Configuration**
- System MUST support configurable timeout threshold (default 30 seconds)
- Timeout errors MUST trigger different message than offline errors
- Timeout errors MUST be retryable

**FR-013-012: Retry-After Header Support**
- System MUST parse HTTP Retry-After header for rate limit (429) and server (5xx) responses
- If Retry-After is present, message MUST include suggested wait duration
- Retry button MUST be disabled until Retry-After duration expires (if present)

---

## 4. Success Criteria

**SC-013-001: 100% of HTTP Errors Mapped**
- All HTTP status codes returned by the API (4xx, 5xx, network errors, timeouts) map to user-friendly messages
- Zero raw HTTP codes are shown to the user
- Validation: Manual testing (wrong password → message, not 401); code review (all API response types covered)

**SC-013-002: Context-Specific Messages Accurate**
- The same HTTP error code displays different messages depending on operation context
- Validation: Unit tests verify context-specific behavior; manual testing shows same HTTP 401 displays different messages when logged in to signup vs. login operations

**SC-013-003: Messages Are Actionable**
- Each error message tells the user what to do next (retry, check connection, try different email, etc.)
- Validation: Clarity test with non-technical users; each message includes recovery suggestion; code review

**SC-013-004: No Sensitive Data Exposed**
- No error message contains passwords, emails, tokens, internal IDs, or stack traces
- Validation: Code review (grep for sensitive patterns); unit tests (error mapping does not repeat user input); manual testing (enter real email, error must not echo it)

**SC-013-005: Portuguese Accuracy**
- All user-facing messages are grammatically correct Portuguese, understandable to native speakers
- Tone matches Collectto brand voice
- Validation: Native Portuguese speaker reviews all messages; grammar and tone align with brand

**SC-013-006: Messages Are Concise**
- Each error message is max 2 sentences (~150 characters per line)
- Message fits on mobile screens without excessive wrapping
- Validation: Code review (each message measured and trimmed); UI test (fits on small screens)

**SC-013-007: Error Categorization Accurate**
- Each error is assigned the correct category (VALIDATION, AUTH, CONFLICT, NETWORK, SERVER, UNKNOWN)
- Validation: Unit tests (correct category for each status code); integration test (category used correctly in UI)

**SC-013-008: Recovery Paths Work**
- Users can recover from errors without app crashes or infinite loops
- Validation: Manual test (retry after network error succeeds); fix input after validation error and resubmit succeeds; retry 5 times on server error without crash

**SC-013-009: Support Diagnostic Capability**
- Support can identify root cause from error message or code
- Error codes are logged server-side; support can search logs by code
- Validation: Error code is logged with user session; support team can search logs and correlate to user issues

**SC-013-010: Zero Regression**
- Existing error flows (auth, signup, profile update) continue to work
- All existing tests pass
- Validation: Run existing test suite; manual testing of login, signup, profile update

---

## 5. Testing Strategy

### Unit Tests
- `errorMapping.test.ts`: Test each status code mapping, context variation, edge cases
  - Test missing context (fallback to generic)
  - Test missing error details (use default message)
  - Test null/undefined inputs (no crash)
  - Test all Portuguese messages for completeness

### Integration Tests
- Error mapping in HTTP client: error response triggers correct mapping
- Error mapping in auth flow: login error, signup error, session expired
- Error mapping in form: validation error shown on correct field

### Manual Tests
- Test on real devices: message fits on small screens
- Test with screen reader: message is read correctly
- Test with non-technical users: understand message and next action
- Test network conditions: offline, slow network, timeout

### Accessibility Tests
- Error messages read by screen readers
- Error alerts have proper ARIA labels
- Error field highlights have sufficient color contrast

---

## 6. Key Assumptions

**A1: API Returns Structured Error Responses**
Assumption: The backend API returns errors in a consistent format (e.g., `{ statusCode, error: { field?, message? } }`). If unstructured, error mapping uses fallback messages.
Mitigation: Work with backend to standardize error response format before implementation.

**A2: Portuguese is Primary Language**
Assumption: App's primary language is Portuguese (Brazilian Portuguese, pt-BR). Error messages are Portuguese; future localization is out of scope.
Mitigation: If other languages needed, move error strings to translation file (e.g., `i18n/pt-BR.json`).

**A3: Retry Logic Exists Elsewhere**
Assumption: HTTP client or API module already has retry logic (exponential backoff, max retry count). Error mapping only maps errors for display.
Mitigation: If retry logic missing, implement in HTTP client before/alongside error mapping.

**A4: Auth Context Available at Error Time**
Assumption: When error is caught, application context (login, signup, profile_update) is known. Error mapping can determine which message to show.
Mitigation: If context unavailable, use "generic" context and provide fallback message.

**A5: No Third-Party Error Libraries**
Assumption: Error mapping uses vanilla TypeScript; no additional dependencies (Sentry, error tracking). Structured logging handled separately per spec 012.
Mitigation: If error tracking needed, add in separate feature (e.g., spec 013-error-logging).

**A6: Client-Side Validation Exists**
Assumption: Client-side form validation (email format, required fields) implemented before submission. Error mapping handles server-side validation errors.
Mitigation: If client-side validation missing, implement alongside error mapping.

**A7: Error Display UI Components Exist**
Assumption: UI components for displaying errors (alerts, inline field errors, toasts) exist or will be created separately. Error mapping provides message text only.
Mitigation: If error UI components don't exist, create them in `src/components/ui/Error*.tsx` before/alongside error mapping.

---

## 7. Scope and Exclusions

### In Scope
- HTTP status code mapping (400, 401, 403, 404, 409, 429, 5xx)
- Network error detection (offline, timeout, fetch failure)
- Context-specific messages (login, signup, profile_update, generic)
- Portuguese error messages
- Error categorization (VALIDATION, AUTH, CONFLICT, NETWORK, SERVER, UNKNOWN)
- Recovery suggestions in messages
- No sensitive data in messages
- Integration with HTTP client and auth flow

### Out of Scope
- **Localization beyond Portuguese**: Future feature if app expands to other languages
- **Error tracking or analytics**: Out of scope; see spec 012 (structured logging)
- **UI component design**: Error display components assumed to exist; spec covers message content only
- **Advanced troubleshooting flows**: Nice-to-have (P3); detailed step-by-step recovery is future enhancement
- **Retry logic**: Retry button behavior is UI concern; retry scheduling is HTTP client concern
- **Backend error standardization**: Assumes backend already returns structured errors; API design out of scope

---

## 8. Dependencies and Related Features

### Depends On
- **Spec 007: HTTP Client Centralization** - Error mapping integrates with centralized HTTP client
- **Spec 011: Auth Error Boundary** - Error boundary catches errors and passes context to error mapping
- **Spec 006: Auth System Refactor** - Auth module provides context (login vs. signup) to error mapping

### Feeds Into
- **Spec 012: Auth Structured Logging** - Logs include mapped error messages
- **Spec 014+ (Future)**: A/B testing error messages, error analytics, advanced recovery flows

---

## 9. Acceptance Criteria Checklist

- [ ] `src/utils/errorMapping.ts` created with `mapErrorToMessage()` function
- [ ] All HTTP 4xx/5xx status codes mapped to Portuguese messages
- [ ] Network errors (offline, timeout) detected and mapped
- [ ] Context-specific messages for login, signup, profile_update contexts
- [ ] Error categories assigned (VALIDATION, AUTH, CONFLICT, NETWORK, SERVER, UNKNOWN)
- [ ] No sensitive data in any error message (code review + unit tests)
- [ ] All messages max 2 sentences, fit on mobile screens
- [ ] Recovery suggestions included in applicable messages
- [ ] Unit tests cover all status codes, contexts, edge cases
- [ ] Integration tests verify error mapping in auth flow and HTTP client
- [ ] Manual testing: wrong password, email taken, no internet, server down scenarios
- [ ] Native Portuguese speaker reviews all messages for accuracy and tone
- [ ] Error mapping called in HTTP client error handler (integration verified)
- [ ] All existing tests pass; no regression
- [ ] `npm run validate` passes (lint, format, type-check, tests)

---

## 10. Definition of Done

1. Code is complete, tested, and merged to feature branch `feature/013-error-message-mapping`
2. All acceptance criteria are met and verified
3. Code passes linting, formatting, and type checking (`npm run validate`)
4. Test coverage for error mapping is ≥ 90%
5. Integration with HTTP client and auth flow verified via manual testing
6. Documentation updated (error mapping README in `src/utils/`)
7. Code review complete and approved
8. Feature ready for QA testing and user acceptance testing

---

**End of Specification**
