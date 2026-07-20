```markdown
# HTTP Client Centralization - Research & Design Decisions

**Spec:** feature/007-http-client-centralization  
**Phase:** 0 (Research Consolidation)  
**Status:** Complete  
**Date:** 2025

## Overview

This document consolidates research and design decisions across 5 critical areas for implementing a centralized HTTP client in Collectto. Each section follows the Decision/Rationale/Alternatives format.

---

## 1. Axios Interceptor Best Practices

### Decision
Use a **2-interceptor pattern**: one request interceptor (auth/headers) and one response interceptor (error normalization/retry). Keep interceptors focused and idempotent for mobile reliability.

### Rationale
- **Separation of Concerns**: Request interceptor handles authentication and outgoing state; response interceptor handles success/error normalization.
- **Mobile Reliability**: Interceptors must be idempotent because in poor network conditions, the same request may be processed multiple times. Side effects in interceptors (like multiple auth refreshes) can corrupt state.
- **Error Normalization**: A single response interceptor transforms all HTTP errors into a consistent `ApiError` contract, reducing error-handling boilerplate in components.
- **Performance**: Two focused interceptors are faster to execute than one bloated interceptor with multiple concerns.

### Alternatives Considered
1. **Single monolithic interceptor**: Higher coupling and harder to test; violates SRP.
2. **No interceptors (manual error handling in each call)**: Leads to code duplication and inconsistency.
3. **Three or more interceptors**: Adds unnecessary complexity; 2 is sufficient for this use case.

### Implementation Notes
- Request interceptor runs first: attaches Bearer token and headers.
- Response interceptor runs on both success (2xx) and error (non-2xx).
- Both interceptors must be idempotent: running them twice should produce the same result.

---

## 2. Exponential Backoff Retry Strategies

### Decision
Implement a **custom retry interceptor** with exponential backoff delays: 1 second, 2 seconds, 4 seconds (3 total attempts). Retry only network errors and specific HTTP status codes (408 Request Timeout, 429 Too Many Requests). Do NOT retry 4xx errors (except 408/429) or 5xx errors that indicate client faults.

### Rationale
- **Network Resilience**: Mobile networks are unpredictable. Temporary connection drops (no HTTP response) should be retried; permanent failures (4xx, 5xx) should not.
- **Exponential Backoff**: Avoids hammering the server or saturating the network. 1s → 2s → 4s = 7 seconds total, reasonable for mobile.
- **Rate Limiting Compliance**: 408 and 429 are explicit "try again" signals; retrying them respects rate limits.
- **Battery Impact**: Aggressive retries drain battery on mobile. Exponential backoff reduces this by spacing retry attempts.
- **No 4xx Retries (except 408/429)**: Client errors (400, 401, 403, 404, 422) indicate bugs or missing auth. Retrying won't fix them.

### Alternatives Considered
1. **Linear backoff** (1s, 2s, 3s): Simpler but less effective under load.
2. **No retries**: Degrades UX on poor networks.
3. **Infinite retries with backoff**: Risk of infinite loops if server is down.
4. **Retry all 5xx errors**: May mask server bugs; better to alert user and let backend logs show real issues.

### Implementation Notes
- Retry config: `maxRetries: 3, initialDelayMs: 1000, baseMultiplier: 2`
- Retryable errors: Network errors (no HTTP response), 408, 429.
- Non-retryable: 4xx (except 408/429), 5xx.
- Implement jitter (optional): Add ±10% random variation to delay to prevent thundering herd.

---

## 3. TypeScript HTTP Client Typing

### Decision
Use **generic request/response types** with strict typing throughout. Define a normalized `ApiError` interface that all HTTP errors conform to. Never use `any`; prefer `unknown` with type narrowing where necessary.

### Rationale
- **Type Safety**: Generics allow `get<T>()` to return `T`, eliminating unsafe type assertions in components.
- **Error Contract**: A unified `ApiError` interface (code, status, message, data, originalError) makes error handling predictable and testable.
- **Developer Experience**: IDE autocomplete works seamlessly; catching type errors before runtime.
- **Maintainability**: Future changes to error structure are caught at compile time, not in tests.

### Alternatives Considered
1. **Untyped responses**: Fast initially but leads to `as any` casts and runtime errors.
2. **Per-endpoint types without generics**: Requires duplicating method signatures for GET, POST, etc.
3. **Loose error typing**: Components don't know if `error.status` exists; leads to defensive checks everywhere.

### Implementation Notes
- Define `HttpResponse<T>` and `ApiError` in shared types.
- All HTTP methods (`get<T>()`, `post<T>()`, etc.) return a Promise that resolves to `T` or rejects with `ApiError`.
- Error-handling code should narrow `ApiError` if needed (e.g., `if (error.code === 'NETWORK_ERROR')`).

---

## 4. Environment Configuration Patterns (React Native/Expo)

### Decision
Use **Expo's environment variable convention**: `process.env.EXPO_PUBLIC_API_BASE_URL`. Fallback to a sensible production default (`http://89.167.89.185:8080`) if env var is not set. Store timeout and other config in a centralized `EnvironmentConfig` object.

### Rationale
- **Expo Convention**: `EXPO_PUBLIC_*` prefix is recognized by Expo CLI and properly injected at build time, not runtime. This is safer than trying to read from `.env` at runtime (which doesn't work on native platforms).
- **No Secrets in Code**: Base URL is not secret (clients need to know it to make requests), so it's safe to embed in the app. Auth token is stored in session storage, not the base URL.
- **Fallback**: Hardcoded fallback ensures the app doesn't crash if the env var is missing; it just uses production.
- **Centralized**: `EnvironmentConfig` object in one place makes it easy to add other env-based settings (log level, feature flags, timeout).

### Alternatives Considered
1. **Read from `.env` file at runtime**: Doesn't work reliably on React Native; the file isn't bundled.
2. **Hardcode base URL**: Works but makes local development harder; can't easily point to localhost.
3. **Use `app.json` extra field**: Possible but less idiomatic in Expo ecosystem.

### Implementation Notes
- In `.env.local` or `.env`: `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000` (development)
- In production/EAS: Set via `eas.json` or EAS build environment variables.
- Define `EnvironmentConfig` interface with `baseUrl: string`, `timeout: number`, `logLevel: 'debug' | 'info' | 'warn' | 'error'`.

---

## 5. React Native Axios Usage Specifics

### Decision
Use Axios in React Native with awareness that:
- **Socket errors** (connection refused, ECONNRESET) do not have HTTP response status; handle separately in error interceptor.
- **Timeouts** must be set appropriately (15 seconds is reasonable; on very slow networks, consider 20-30 seconds).
- **Battery impact**: Minimize timeout wait time and aggressive retries; use exponential backoff to spread load.

### Rationale
- **Socket vs HTTP Errors**: In native environments, network errors don't always result in HTTP status codes. A socket connection timeout (ECONNREFUSED) is different from HTTP 500. The retry logic must account for this.
- **Mobile Networks**: LTE and 5G can have variable latency. 15-second timeout accommodates most real-world scenarios without being overly generous.
- **Battery**: Long waits for responses drain battery, especially on poor networks. Exponential backoff and reasonable timeouts reduce this.

### Alternatives Considered
1. **Use React Native Fetch API**: Works but lacks built-in interceptor support; would require manual wrapping.
2. **Use native HTTP libraries** (e.g., OkHttp on Android): Overkill for this use case and breaks cross-platform compatibility.
3. **Set very high timeouts** (60+ seconds): Leads to poor UX; users can't tell if the app is hung.

### Implementation Notes
- Axios detects socket errors and wraps them in its error object; check `error.code` (e.g., `'ECONNREFUSED'`, `'ETIMEDOUT'`) and `error.response` (only present if HTTP response was received).
- Example error structure on socket error:
  ```
  {
    code: 'ECONNREFUSED',
    message: 'connect ECONNREFUSED ...',
    response: undefined
  }
  ```
- On HTTP error:
  ```
  {
    response: {
      status: 500,
      data: { ... }
    }
  }
  ```
- Always check both `error.code` and `error.response` in error handling.

---

## Design Principles Alignment

All decisions above align with Collectto's Constitution (1.0.0):

- **Simple**: 2-interceptor pattern is straightforward; 3 retry attempts with fixed delays.
- **Explicit**: All types documented; error contract is clear; no hidden behavior in interceptors.
- **Predictable**: Same retry logic applies to all requests; error structure is consistent everywhere.

---

## Next Steps (Phase 1)

1. Define `ApiError` interface in `src/types/http.ts`.
2. Implement `HttpClient` class in `src/services/api/client.ts`.
3. Set up request interceptor (auth token injection).
4. Set up response interceptor (error normalization).
5. Implement retry interceptor with exponential backoff.
6. Document public API in `contracts/http-client.contract.ts`.
7. Create quickstart guide for developers.
8. Run validation and integration tests.

---
```

---

