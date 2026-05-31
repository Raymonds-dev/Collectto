```markdown
# HTTP Client Centralization - Data Model

**Spec:** feature/007-http-client-centralization  
**Phase:** 0 (Data Model Definition)  
**Status:** Complete  
**Date:** 2025

## Overview

This document defines all key entities, data structures, and relationships for the HTTP client centralization feature.

---

## Entity: HttpClient Configuration

### Description
Configuration object passed to `HttpClient` at initialization. Defines base URL, timeout, and retry behavior.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| baseURL | `string` | Yes | — | Base URL for all requests (e.g., `http://89.167.89.185:8080`) |
| timeout | `number` | No | `15000` | Request timeout in milliseconds |
| retryConfig | `RetryConfig` | No | See RetryConfig | Retry behavior for transient failures |
| logLevel | `'debug' \| 'info' \| 'warn' \| 'error'` | No | `'warn'` | Logging verbosity |

### Validation Rules
- `baseURL` must be a valid URL (starts with `http://` or `https://`).
- `timeout` must be positive (> 0).
- `retryConfig` fields must be non-negative.

### Relationships
- Used by: `HttpClient` constructor
- References: `RetryConfig`

---

## Entity: RetryConfig

### Description
Configuration for exponential backoff retry strategy.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| maxRetries | `number` | No | `3` | Maximum number of retry attempts |
| initialDelayMs | `number` | No | `1000` | Initial delay in milliseconds (1 second) |
| baseMultiplier | `number` | No | `2` | Multiplier for each retry (1s → 2s → 4s) |

### Validation Rules
- `maxRetries` must be >= 0.
- `initialDelayMs` must be > 0.
- `baseMultiplier` must be > 1.

### Calculated Values
- Retry delays (computed from config):
  - Attempt 1: `initialDelayMs` (1000 ms)
  - Attempt 2: `initialDelayMs * baseMultiplier` (2000 ms)
  - Attempt 3: `initialDelayMs * baseMultiplier^2` (4000 ms)
  - Total wait: 7 seconds across 3 attempts

### Relationships
- Used by: `HttpClient` for retry logic
- Used in: `HttpClientConfiguration`

---

## Entity: EnvironmentConfig

### Description
Environment-specific configuration, populated from Expo environment variables and app constants.

### Fields

| Field | Type | Source | Value (Dev/Prod) |
|-------|------|--------|------------------|
| baseUrl | `string` | `process.env.EXPO_PUBLIC_API_BASE_URL` | `http://localhost:3000` / `http://89.167.89.185:8080` |
| timeout | `number` | Constant | `15000` |
| logLevel | `'debug' \| 'info' \| 'warn' \| 'error'` | Constant | `'warn'` (prod), `'debug'` (dev) |

### Validation Rules
- `baseUrl` must be a valid URL; fallback to `http://89.167.89.185:8080` if not set.
- `timeout` must be > 0.

### Relationships
- Consumed by: `HttpClient.configure()`
- Initialized at: App startup in `src/providers/HttpClientProvider.tsx`

---

## Interface: RequestInterceptor

### Description
Intercepts outgoing HTTP requests to inject headers, attach auth tokens, or modify request data.

### Signature

```typescript
interface RequestInterceptor {
  onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRejected?: (error: unknown) => Promise<never>;
}
```

### Responsibilities
- **Auth Token Injection**: Attach Bearer token from session storage to `Authorization` header.
- **Default Headers**: Set `Content-Type: application/json`, `Accept: application/json`.
- **User-Agent**: Optional: include app version and platform.

### Idempotency
Must be **idempotent**: running twice on the same request should produce identical results. No side effects outside the request object.

### Error Handling
- If auth token is missing, should proceed (caller will get 401 on response).
- If session storage is unavailable, should proceed (graceful degradation).

### Relationships
- Registered with: `HttpClient.addRequestInterceptor()`
- Called by: Axios request interceptor pipeline
- Provides input to: Response interceptor

---

## Interface: ResponseInterceptor

### Description
Intercepts HTTP responses to normalize errors, handle retries, and transform success data.

### Signature

```typescript
interface ResponseInterceptor {
  onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onRejected?: (error: AxiosError) => Promise<never>;
}
```

### Responsibilities
- **Error Normalization**: Transform all errors (HTTP, socket, timeout) into `ApiError`.
- **Status Code Handling**: 
  - 2xx: Pass through
  - 4xx/5xx: Create `ApiError` with normalized structure
- **Retry Decision**: Determine if error is retryable and return retry promise if needed.
- **Logging**: Log request/response for debugging (respects log level).

### Retry Logic
- Retryable: Network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND), 408, 429.
- Non-retryable: 4xx (except 408/429), 5xx.

### Relationships
- Registered with: `HttpClient.addResponseInterceptor()`
- Called by: Axios response interceptor pipeline
- Produces: `ApiError` on failure

---

## Type: ApiError

### Description
Normalized error structure returned by all HTTP methods on failure. Guarantees consistent error shape across the app.

### Fields

| Field | Type | Presence | Description |
|-------|------|----------|-------------|
| code | `string` | Always | Machine-readable error code (e.g., `'NETWORK_ERROR'`, `'UNAUTHORIZED'`, `'VALIDATION_ERROR'`) |
| status | `number \| null` | Always | HTTP status code (e.g., 401, 422) or `null` if socket error |
| message | `string` | Always | Human-readable error message (e.g., "Invalid credentials") |
| data | `unknown` | Always (may be `undefined`) | Backend error details or validation errors from response body |
| originalError | `Error \| null` | Always | Original error object (for debugging) |

### Code Mapping

| HTTP Status | Code | message |
|-------------|------|---------|
| No response (socket) | `NETWORK_ERROR` | "Network error. Please check your connection." |
| 401 | `UNAUTHORIZED` | "Your session has expired. Please log in again." |
| 403 | `FORBIDDEN` | "You don't have permission to access this resource." |
| 404 | `NOT_FOUND` | "The requested resource was not found." |
| 408 | `REQUEST_TIMEOUT` | "Request timed out. Please try again." |
| 429 | `RATE_LIMITED` | "Too many requests. Please wait and try again." |
| 422 | `VALIDATION_ERROR` | "Request validation failed." |
| 500-599 | `SERVER_ERROR` | "Server error. Please try again later." |

### Validation Rules
- `code` must be a non-empty string.
- `status` must be null or a valid HTTP status code (100-599).
- `message` must be non-empty.
- `data` is optional but should contain error details if present.

### Usage Example

```typescript
try {
  const user = await HttpClient.get<User>('/users/me');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.code === 'UNAUTHORIZED') {
      // Redirect to login
    } else if (error.code === 'NETWORK_ERROR') {
      // Show offline message
    }
    console.error(`${error.code}: ${error.message}`, error.data);
  }
}
```

### Relationships
- Thrown by: All `HttpClient` methods on error
- Caught by: Error handlers in components and services
- Contains: Original Axios error for debugging

---

## State Transitions / Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Component calls HttpClient.get<T>(url)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Request Interceptor                                             │
│ ├─ Attach Bearer token from session storage                     │
│ ├─ Set default headers (Content-Type, Accept)                   │
│ └─ Return modified AxiosRequestConfig                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Axios Network Layer                                             │
│ ├─ Send HTTP request with timeout (15s)                         │
│ └─ Receive response or error                                    │
└──┬──────────────────────────────────────────────────────────────┘
   │
   ├─ Success (2xx) ──────┐
   │                       │
   └─ Error (other) ──┬───┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Response Interceptor                                            │
│ ├─ If 2xx: Pass through (resolve with T)                        │
│ ├─ If retryable error:                                          │
│ │  ├─ Calculate exponential backoff delay                       │
│ │  ├─ Wait (1s, 2s, 4s)                                         │
│ │  └─ Retry (up to 3 attempts)                                  │
│ └─ If non-retryable error:                                      │
│    ├─ Normalize to ApiError                                     │
│    └─ Reject promise with ApiError                              │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Component catches ApiError                                      │
│ └─ Handle error (show toast, redirect, retry, etc.)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session/Auth Integration Points

### 1. Token Storage
- **Location**: Session storage (via `getSessionToken()` utility)
- **Lifecycle**: Attached at auth login, cleared on logout
- **Format**: Bearer token (JWT or opaque string)

### 2. Request Interceptor Integration
- **When**: Runs before every HTTP request
- **Action**: Reads token from session storage, injects into `Authorization: Bearer <token>` header
- **Error**: If token unavailable, proceeds without it (server will return 401)

### 3. 401 Response Handling
- **Scenario**: Server returns 401 (Unauthorized)
- **Current Behavior**: Wrapped in `ApiError` with code `'UNAUTHORIZED'`
- **Future Extension**: May trigger token refresh or logout flow (not in Phase 1 scope)

### 4. Session Expiry
- **Scenario**: User's token expires while app is running
- **Detection**: Server returns 401 on next request
- **User Experience**: Error toast "Your session has expired. Please log in again." + redirect to login

---

## Summary Table

| Entity | Purpose | Location | Scope |
|--------|---------|----------|-------|
| HttpClientConfiguration | Initialize HttpClient with URL, timeout, retry config | `src/services/api/config.ts` | Global |
| RequestInterceptor | Inject auth, headers | Axios pipeline | Per-request |
| ResponseInterceptor | Normalize errors, retry logic | Axios pipeline | Per-response |
| ApiError | Consistent error contract | `src/types/http.ts` | All HTTP methods |
| RetryConfig | Exponential backoff settings | `src/services/api/config.ts` | Global |
| EnvironmentConfig | Env-specific settings | `src/services/api/env.ts` | Initialized at startup |

---
```

---

