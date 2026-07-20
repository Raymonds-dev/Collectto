# Feature Specification: Centralize HTTP Client with Interceptors

**Feature Branch**: `feature/007-http-client-centralization`  
**Created**: 2026-05-25  
**Status**: Draft  
**Input**: User description: "Centralize HTTP Client with Interceptors"

## Clarifications

### Session 2026-05-25

- Q: Should the Axios request interceptor retrieve the token asynchronously, or should we cache it in memory? → A: Use an asynchronous request interceptor in Axios to retrieve the token via `await getSessionToken()`.
- Q: Should the HTTP client retry on 5xx server errors? → A: Retry network-level errors and all 5xx server errors.
- Q: What should be the default API base URL if the BASE_URL environment variable is not defined? → A: Fallback to the current base URL http://89.167.89.185:8080.
- Q: When a request fails with a 401 Unauthorized status, how should the centralized HTTP client handle this? → A: Reject the Promise with the mapped error; let AuthProvider or calling code handle token clearing and redirection.
- Q: What should the shape of the ApiError object be? → A: Define it as { message: string; code?: string; status?: number; details?: any; }.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Automatic Authentication Header Injection (Priority: P1)

**Description**: As a developer, I want the HTTP client to automatically include the Authorization header on all authenticated API requests, so that I don't need to manually manage auth tokens in every API call.

**Why this priority**: This is the foundational requirement for the centralized client. Without automatic auth header injection, the client cannot securely handle authenticated requests, which impacts all protected endpoints (profile updates, collection management, etc.).

**Independent Test**: Create a test that mocks the session storage with a valid auth token, makes an API call, and verifies that the Authorization header is present with the correct bearer token value.

**Acceptance Scenarios**:
1. **Given** a valid auth token exists in session storage, **When** the client makes a request to an authenticated endpoint, **Then** the Authorization header is automatically included with the token
2. **Given** no auth token exists in session storage, **When** the client makes a request, **Then** no Authorization header is added
3. **Given** an auth token is refreshed in session storage, **When** the next request is made, **Then** the new token is used in the Authorization header

---

### User Story 2 - Network Error Retry with Exponential Backoff (Priority: P1)

**Description**: As an end user, I want temporary network failures to be automatically retried so that transient connectivity issues don't cause the app to fail unexpectedly.

**Why this priority**: Network timeouts and transient failures are common in mobile environments. Without retry logic, legitimate requests fail due to temporary network glitches, degrading app reliability and user experience.

**Independent Test**: Mock the API to fail with a timeout error on the first two attempts, then succeed on the third. Verify that the client retries and eventually returns the successful response without requiring the app to intervene.

**Acceptance Scenarios**:
1. **Given** a request times out, **When** the client automatically retries, **Then** the request is retried up to 3 times with exponential backoff before failing
2. **Given** a transient network error occurs (e.g., connection reset), **When** the client receives the error, **Then** the request is retried without waiting for manual intervention
3. **Given** a request fails on the first and second attempt, **When** the third attempt succeeds, **Then** the success response is returned to the caller
4. **Given** a 4xx client error occurs (e.g., 400 Bad Request), **When** the client receives the error, **Then** the request is NOT retried and the error is returned immediately

---

### User Story 3 - Unified Error Response Mapping (Priority: P1)

**Description**: As a UI developer, I want API errors to be mapped to user-friendly messages, so that error dialogs and feedback messages in the app are consistent and understandable.

**Why this priority**: Currently, inconsistent error handling between fetch and axios results in raw HTTP status codes and server messages being displayed to users. This degrades UX and creates technical debt in error presentation across features.

**Independent Test**: Make requests that trigger 4xx and 5xx errors, and verify that each error response is mapped to a meaningful error object with a user-friendly message, error code, and HTTP status.

**Acceptance Scenarios**:
1. **Given** the API returns a 401 Unauthorized error, **When** the client receives the error, **Then** the error is mapped to a readable message like "Session expired. Please log in again." for UI display
2. **Given** the API returns a 500 Internal Server Error, **When** the client receives the error, **Then** the error is mapped to "Server error. Please try again later."
3. **Given** the API returns a 404 Not Found error, **When** the client receives the error, **Then** the error object contains both the HTTP status and a user-friendly message
4. **Given** a network error occurs with no HTTP response, **When** the client receives the error, **Then** the error is mapped to "Network error. Please check your connection and try again."

---

### User Story 4 - Environment-Based Base URL Configuration (Priority: P2)

**Description**: As a DevOps engineer, I want the API base URL to be configurable via environment variables, so that the app can switch between dev, staging, and production environments without code changes.

**Why this priority**: Environment configuration is critical for deployment flexibility. Without this, every environment switch requires rebuilding and redeploying the app with hardcoded values, slowing down development and increasing deployment risk.

**Independent Test**: Create multiple environment configurations (.env.dev, .env.staging, .env.production), run the app in each environment, and verify that API calls are routed to the correct base URL.

**Acceptance Scenarios**:
1. **Given** the environment variable BASE_URL is set to a dev server URL, **When** the app initializes, **Then** all API requests are sent to the dev server
2. **Given** the environment variable BASE_URL is set to a production URL, **When** the app initializes, **Then** all API requests are sent to the production server
3. **Given** BASE_URL is not set, **When** the app initializes, **Then** a sensible default URL is used and logged as a warning
4. **Given** the app is running with different BASE_URLs, **When** comparing requests, **Then** the correct base URL is used for each request without code redeploy

---

### User Story 5 - Request Timeout Configuration (Priority: P2)

**Description**: As a developer, I want API requests to timeout after a configurable duration, so that the app doesn't hang waiting for unresponsive servers.

**Why this priority**: Without timeout configuration, requests to slow or unresponsive APIs can hang indefinitely, creating poor UX. A 15-second timeout is a reasonable default for mobile connectivity.

**Independent Test**: Mock the API to never respond (hang indefinitely), make a request, and verify that after 15 seconds the request fails with a timeout error.

**Acceptance Scenarios**:
1. **Given** an API request is made, **When** no response is received within 15 seconds, **Then** the request times out and fails with a timeout error
2. **Given** a slow API response that takes 12 seconds, **When** the response is received before the timeout, **Then** the response is successfully returned
3. **Given** the global timeout is set to 15 seconds, **When** requests are made, **Then** all requests use the same timeout consistently

---

### User Story 6 - 100% API Call Centralization (Priority: P1)

**Description**: As a code maintainer, I want all HTTP calls throughout the codebase to use the centralized client, so that we have a single source of truth for API communication and can maintain consistent behavior.

**Why this priority**: Scattered HTTP calls create technical debt and make it difficult to enforce consistent authentication, error handling, and monitoring. Centralization ensures all APIs respect the same interceptors and configuration.

**Independent Test**: Conduct a code audit and verify that no direct fetch() or axios instances are used for API calls outside the centralized client, with documented exceptions (if any) noted in code comments.

**Acceptance Scenarios**:
1. **Given** the codebase is audited for API calls, **When** no direct fetch() calls exist outside the centralized client, **Then** all API communication is centralized
2. **Given** existing services like getUserById, getAuthenticatedUser, and updateProfile, **When** they are refactored, **Then** they all use the centralized client
3. **Given** a developer needs to make a new API call, **When** they follow the API call pattern, **Then** they naturally use the centralized client without searching for examples

---

### Edge Cases

- **Network unavailable during initialization**: The client is initialized but the network is offline. Subsequent requests fail with a "Network unavailable" error, and the app gracefully handles this without crashing.
- **Auth token expires mid-request**: A request is in flight when the auth token expires. The request fails with 401, which is standardly mapped and rejected, allowing AuthProvider to handle the session invalidation and redirection.
- **Timeout occurs during retry**: A request times out on the first attempt and while retrying, another timeout occurs. The retry logic correctly backs off exponentially instead of immediately retrying.
- **Invalid JSON response**: The API returns an invalid JSON response (e.g., malformed HTML error page). The client fails gracefully with a mapped error instead of crashing.
- **CORS or network-level blocking**: A request is blocked by CORS or network policy (e.g., firewall). The client receives a network error and retries appropriately without exposing internal error details to the UI.
- **Very large response payload**: An API returns a very large JSON response. The client handles it without memory exhaustion, or fails gracefully with a timeout/size limit error.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The HTTP client must be a single, centralized instance created in `src/services/api/client.ts` that all API calls use for making HTTP requests.
- **FR-002**: A request interceptor must automatically add the Authorization header with the bearer token from session storage to all outgoing requests.
- **FR-003**: A response interceptor must catch HTTP errors (4xx, 5xx, and network errors) and map them to a standardized error response with user-friendly messages, error codes, and HTTP status.
- **FR-004**: Network-level errors (timeouts, connection resets) and 5xx server errors must trigger automatic retry logic that attempts up to 3 retries with exponential backoff (1s, 2s, 4s) before failing.
- **FR-005**: HTTP client errors (4xx status codes) must NOT be retried and must fail immediately with the mapped error response.
- **FR-006**: All API requests must have a default timeout of 15 seconds, after which the request is aborted and treated as a network error.
- **FR-007**: The API base URL must be configurable via environment variable `BASE_URL`, defaulting to `http://89.167.89.185:8080` if not provided.
- **FR-008**: All existing API calls in the codebase (getUserById, getAuthenticatedUser, updateProfile, etc.) must be refactored to use the centralized client.
- **FR-009**: The retry interceptor logic must be isolated in `src/services/api/interceptors.ts` for separation of concerns and testability.
- **FR-010**: Response errors must include a field for user-friendly error messages that can be directly displayed in UI without further processing.

### Key Entities _(if applicable)_

- **HttpClient**: The centralized axios instance configured with base URL, timeout, and interceptors.
- **AuthInterceptor**: Request interceptor that injects the Authorization header from session storage.
- **RetryInterceptor**: Response interceptor that implements exponential backoff retry logic for transient failures.
- **ErrorInterceptor**: Response interceptor that maps HTTP errors to standardized error responses with user-friendly messages.
- **ApiError**: Standardized error object containing HTTP status (`status`), error code (`code`), user-friendly message (`message`), and optional raw error details (`details`).
- **BaseURL**: Environment-configurable API endpoint root, supporting dev/staging/production switching.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero instances of raw fetch() or standalone axios calls are used for API communication outside the centralized client (code audit passes with 100% coverage).
- **SC-002**: Network-level errors automatically retry up to 3 times with exponential backoff before the request fails, verified by unit tests simulating transient failures.
- **SC-003**: Authorization header is automatically included on all authenticated API requests when a valid token is present in session storage, verified by integration tests.
- **SC-004**: All HTTP error responses (4xx, 5xx) are mapped to user-friendly error messages with no raw HTTP status codes exposed to the UI, verified by testing error scenarios.
- **SC-005**: The BASE_URL is configurable via environment variable without code modification, and switching between dev/staging/prod URLs works without rebuild.
- **SC-006**: All existing tests pass after refactoring to use the centralized client, with no regression in API call behavior or authentication flow.
- **SC-007**: Request timeout is enforced at 15 seconds globally, and requests exceeding this timeout are treated as transient network errors eligible for retry.
- **SC-008**: The centralized client is documented in a README with examples of how to use it, interceptor behavior, and how to add new API calls using the client.

## Assumptions

- The project uses axios as the HTTP client library (or will be standardized to axios).
- Session storage is the source of truth for storing authentication tokens, and the client retrieves the token asynchronously using the asynchronous getSessionToken service.
- Network errors are distinguished from HTTP errors, and only network errors (not 4xx/5xx) are retried.
- A default base URL exists or can be inferred if the environment variable is not set (e.g., production URL).
- All existing API services follow a consistent pattern and can be refactored to use the centralized client without architectural changes.
- The app uses TypeScript, so the HTTP client and interceptors can be strongly typed for better developer experience.
- Error messages will be stored in a centralized translations/localization system or constants file, so they can be reused across the app.
- The development, staging, and production environments have stable, known API base URLs that can be set via environment variables.
- Exponential backoff retry logic should not retry 4xx errors, only network-level errors and 5xx server errors.
