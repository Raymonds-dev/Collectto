# HTTP Client Centralization - Implementation Plan

**Spec:** feature/007-http-client-centralization
**Status:** Phase 1 Complete - Design Artifacts Ready
**Branch:** feature/007-http-client-centralization
**Created:** 2025-01-09

## Planning Summary

This plan synthesizes research and design artifacts from Phase 1 into a structured Phase 2+ roadmap. The HTTP Client Centralization feature standardizes all API communication through a single, typed, retry-aware client. Implementation will follow a 6-phase approach: core client, retry logic, provider integration, existing service migration, comprehensive testing, and documentation.

## Technical Context

The Collectto frontend currently uses direct Axios calls scattered across multiple services, resulting in inconsistent error handling, duplicated retry logic, and tight coupling between UI and HTTP concerns. Phase 2 will centralize all HTTP communication through a single `HttpClient` class with automatic token injection, normalized error handling, and exponential backoff retry logic. This refactoring improves maintainability, type safety, and error resilience across the application.

## Constitution Check

Alignment with Collectto Constitution 1.0.0:

- **Simple:** ✓ (2-interceptor pattern with clear, single-responsibility design; easy to understand and extend)
- **Explicit:** ✓ (All types documented; error contract guaranteed via ApiError interface; no implicit side effects)
- **Predictable:** ✓ (Deterministic retry logic with exponential backoff; consistent error normalization; idempotent by design where applicable)

## Phase 1: Design Artifacts ✅ COMPLETE

### Generated Artifacts

1. **research.md** - Consolidated research on 5 critical areas:
   - Client architecture patterns
   - Error handling and normalization strategies
   - Retry behavior and exponential backoff
   - TypeScript typing and generics
   - React Native specific considerations

2. **data-model.md** - Entity definitions and data structures:
   - ApiError interface with guaranteed fields
   - Request/Response type definitions
   - Configuration and environment structures

3. **contracts/http-client.contract.ts** - Public API contract:
   - Exported types and interfaces
   - Method signatures for all HTTP verbs
   - Provider interface

4. **quickstart.md** - Developer implementation guide:
   - Step-by-step migration instructions
   - Code examples for common patterns
   - Troubleshooting tips

### Design Decisions (from research.md)

- **2-Interceptor Pattern:** Request (auth/headers) + Response (error normalization), keeping concerns separated
- **Exponential Backoff:** 1s, 2s, 4s delays; network errors only; max 3 total attempts
- **TypeScript:** Generic request/response types; normalized ApiError across all methods
- **Environment:** Use `process.env.EXPO_PUBLIC_API_BASE_URL` with secure fallback
- **React Native:** Socket error handling; 15s timeout; battery impact considered
- **Idempotency:** Document POST/PUT/PATCH retry behavior; use request IDs where needed

## Phase 2: Implementation Roadmap

### Phase 2.1: Core HttpClient Implementation

**Deliverables:**
- `src/services/api/types.ts` - Type definitions and interfaces
- `src/services/api/client.ts` - HttpClient singleton class
- `src/services/api/env.ts` - Environment configuration loader
- `src/services/api/config.ts` - Configuration defaults and constants

**Key Responsibilities:**

- Define `ApiError` interface with guaranteed fields: `code`, `status`, `message`, `data`, `originalError`
- Implement `HttpClient` class with strongly-typed methods: `get`, `post`, `put`, `patch`, `delete`
- Setup request interceptor for automatic Bearer token injection from session storage
- Setup response interceptor for error normalization (convert Axios errors to ApiError)
- Configure timeout at 15 seconds by default with override capability
- Ensure type safety with generics for request/response payloads

**Success Criteria:**

- All HTTP methods (GET, POST, PUT, PATCH, DELETE) functional with strong typing
- Authorization header automatically attached from session storage for authenticated endpoints
- Errors normalized to ApiError consistently across all response types
- No `any` types in the implementation
- Timeout respected in all requests

### Phase 2.2: Retry Interceptor

**Deliverables:**
- `src/services/api/interceptors.ts` - RetryInterceptor and helper functions
- Retry configuration and calculation utilities

**Key Responsibilities:**

- Implement exponential backoff calculation (1s → 2s → 4s)
- Define `isRetryableError()` to detect network errors and specific status codes (408, 429, 5xx)
- Integrate retry logic into response interceptor pipeline
- Ensure max 3 retry attempts with delays between attempts
- Track attempt count and apply jitter to prevent thundering herd
- Handle timeout errors separately (treat as network errors)

**Success Criteria:**

- Network errors (socket, connection timeout) retry up to 3 times with exponential backoff
- Status 408 (Request Timeout) and 429 (Too Many Requests) retry with backoff
- 4xx errors (except 408, 429) fail immediately without retry
- 5xx errors not automatically retried (per spec Assumption 9; future implementation possible)
- Retry behavior verified in tests with mocked timeouts

### Phase 2.3: Integration & Initialization

**Deliverables:**
- `src/providers/HttpClientProvider.tsx` - Context provider for HttpClient initialization
- Integration with app root provider (App.tsx or existing provider structure)
- Environment variable configuration loading and validation

**Key Responsibilities:**

- Create `HttpClientProvider` that configures HttpClient at app startup
- Load environment variables (`EXPO_PUBLIC_API_BASE_URL`) with validation
- Initialize HttpClient with proper base URL, timeout, and retry configuration
- Ensure provider wraps all components that use HttpClient
- Export HttpClient instance through context for consumption via hooks
- Handle initialization errors gracefully (fallback to default values)

**Success Criteria:**

- HttpClient initialized once at app startup (singleton pattern)
- Base URL correctly loaded from environment with fallback
- All requests respect configured timeout and retry settings
- Provider accessible to all app components

### Phase 2.4: Existing API Call Migration

**Deliverables:**
- Refactored services in `src/services/api/` (users.ts, posts.ts, comments.ts, etc.)
- Updated components using HTTP calls to use HttpClient
- Removal of direct axios/fetch imports outside HttpClient

**Key Responsibilities:**

- Audit existing code for direct fetch() and standalone axios calls
- Refactor existing services to use HttpClient methods instead of direct HTTP calls
- Update error handling in components and services to use ApiError interface
- Ensure no instances of direct HTTP calls remain (except within HttpClient)
- Preserve backward compatibility where possible during migration
- Update type signatures to use ApiError in catch blocks

**Success Criteria:**

- 100% centralization: Zero direct fetch() or standalone axios.get/post calls outside HttpClient
- All existing services (getUserById, getAuthenticatedUser, updateProfile, etc.) use HttpClient
- All tests pass after refactoring
- Error handling updated to work with ApiError interface
- Code audit shows no regressions in functionality

### Phase 2.5: Testing & Validation

**Deliverables:**
- Unit tests for HttpClient methods
- Integration tests for auth token injection and interceptors
- Error handling tests (4xx, 5xx, network errors)
- Retry behavior tests (exponential backoff, max attempts)
- Mock setup and test utilities for component testing

**Key Responsibilities:**

- Write comprehensive test suite covering all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Test request interceptor (token attachment, header defaults, header overrides)
- Test response interceptor (error normalization, ApiError structure)
- Test retry behavior with mocked timeouts (verify 1s, 2s, 4s delays, max 3 attempts)
- Ensure all services have tests validating HttpClient usage
- Setup MSW (Mock Service Worker) for integration tests if needed
- Test timeout behavior and custom timeout overrides
- Test environment variable loading and fallbacks

**Success Criteria:**

- All HTTP methods have passing unit tests with >90% coverage
- Auth token injection verified in integration tests
- Retry logic verified (1s, 2s, 4s delays, max 3 attempts confirmed)
- Error mapping tested for all error codes (4xx, 5xx, network)
- >90% code coverage for `src/services/api/*` files
- All existing tests pass post-refactoring
- No type errors or warnings

### Phase 2.6: Documentation & Examples

**Deliverables:**
- README.md with overview and architectural decision explanations
- API contract documentation (contracts/http-client.contract.ts comments)
- Quickstart guide (quickstart.md) - already in design artifacts, may be updated
- Code examples for common patterns (authentication, error handling, retries)
- Troubleshooting guide for common issues
- Migration guide for developers moving to HttpClient

**Key Responsibilities:**

- Create comprehensive API documentation with method signatures and examples
- Provide copy-paste examples for developers (GET, POST, PUT, PATCH, DELETE)
- Document error codes, handling strategies, and retry behavior
- Create migration guide for moving existing code to HttpClient
- Document environment variable setup and configuration options
- Include examples of custom timeout overrides and error boundaries

**Success Criteria:**

- Documentation is clear, comprehensive, and tested
- Examples are runnable and cover all common scenarios
- Developers can quickly integrate HttpClient into new features
- Migration path from old code to new code is clear

## Phase 2 Timeline Estimate

1. **Phase 2.1: Core Implementation** - 2-3 days
2. **Phase 2.2: Retry Logic** - 1-2 days
3. **Phase 2.3: Integration & Initialization** - 1 day
4. **Phase 2.4: Migration & Refactoring** - 3-5 days
5. **Phase 2.5: Testing & Validation** - 2-3 days
6. **Phase 2.6: Documentation** - 1-2 days

**Total Estimated Duration: 10-16 days of development**

## Gates & Checks

### Pre-Phase 2.1 Gates
- [x] Design artifacts complete (research.md, data-model.md, contracts, quickstart.md)
- [x] Constitution check passed (simple, explicit, predictable)
- [ ] Team review and sign-off on design

### Pre-Phase 2.4 Gates (Migration)
- [ ] Core HttpClient implementation complete and tested
- [ ] Retry logic implemented and validated with mock tests
- [ ] Provider integration working end-to-end with real API calls

### Final Validation Gates
- [ ] Zero direct fetch() or standalone axios calls remain in codebase (code audit)
- [ ] All existing tests pass post-refactoring (npm run validate)
- [ ] Error handling works for all error types (network, 4xx, 5xx)
- [ ] Bearer token automatically attached for authenticated endpoints
- [ ] Retry behavior verified in integration tests (1s, 2s, 4s delays)
- [ ] >90% test coverage achieved for API services

## Risk Mitigation

**Risk:** Breaking existing API calls during migration
**Mitigation:** Migrate services incrementally, run tests after each service refactoring, maintain both old and new code in parallel during transition, create feature flag if needed

**Risk:** Timeout too short on slow networks or large payloads
**Mitigation:** Make timeout configurable per request; document how to override for specific endpoints; consider file upload/download special cases

**Risk:** Retry logic causes duplicate operations (e.g., creating same post twice)
**Mitigation:** Ensure idempotency keys are used where needed; document POST/PUT/PATCH retry behavior; design operations to be idempotent where possible

**Risk:** Auth token expired mid-request before retry
**Mitigation:** 401 response returns ApiError; app logic handles redirect to login; token refresh can be added in future phase; consider pre-refresh on expiration

**Risk:** Retry logic causes excessive battery drain on mobile
**Mitigation:** Limit retry attempts (3 max); use exponential backoff to reduce frequency; document behavior; monitor battery impact in testing

## Dependencies

- **Axios library** - Already present in project for HTTP requests
- **Session storage service** - `getSessionToken()`, `clearSessionToken()` functions needed
- **React/React Native** - Already present for provider pattern
- **Expo environment support** - `EXPO_PUBLIC_*` prefix for environment variables
- **TypeScript** - Already configured; ensure strict mode enabled

## Success Metrics

1. **Code Audit:** 0 direct fetch() or standalone axios calls outside HttpClient
2. **Test Coverage:** >90% coverage for `src/services/api/*` files
3. **Error Handling:** All error scenarios (network, 4xx, 5xx) handled consistently
4. **Type Safety:** No `any` types in HTTP client code; all responses strongly typed
5. **Performance:** No regression in response times; retries transparent to user experience
6. **Documentation:** Complete quickstart and API documentation with examples
7. **Stability:** All existing tests pass post-refactoring; no regressions introduced

## Next Steps (After Phase 1)

1. Get team sign-off on design and timeline
2. Begin Phase 2.1 implementation (core HttpClient)
3. Establish weekly check-ins on progress and blockers
4. Perform incremental code audits as Phase 2.4 progresses
5. Merge to main after all final validation gates pass
6. Plan Phase 3+ enhancements (token refresh, request queuing, analytics, etc.)

---

**Last Updated:** 2025-01-09
**Phase 1 Status:** ✅ Complete
**Phase 2 Status:** 🚀 Ready to Begin
