# Research & Design Decisions: Structured Logging for Authentication Events

This document details the research, technical choices, and alternatives evaluated for implementing the structured auth logging system.

## 1. Redaction and Sanitization Strategy

### Decision
Implement regex-based redaction patterns for common sensitive values (tokens, credentials, email addresses) combined with a recursive object-traversal sanitizer that replaces matching keys with `"[REDACTED]"`.

### Rationale
Authentication logs must guarantee zero leakage of sensitive data (PII or credentials) while preserving technical metadata. A hybrid approach ensures maximum safety:
1. **Key-based Redaction**: Explicitly check object keys for known sensitive names (e.g., `password`, `token`, `accessToken`, `refreshToken`, `email`, `authorization`).
2. **Regex-based Redaction**: Pre-compile patterns to sanitize raw strings and error messages from third-party libraries (e.g., Axios error response text).

Pre-compiled regexes to be used:
- **JWT / Auth Token Pattern**: `/(?:Bearer\s+)?eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi`
- **Email Pattern**: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi`
- **Base64 / Credentials**: `/(?:Basic\s+)?[A-Za-z0-9+/=]{20,}/gi`

### Alternatives Considered
- **Third-party sanitization packages (e.g., `fast-safe-stringify` / `redact-secrets`)**: Rejected to keep the application bundle small, avoid external dependency audits, and align with the project guidelines of using simple, native TypeScript utility implementations where possible.
- **Strict Allow-listing of logged fields**: While allow-listing is safer, it prevents capturing arbitrary error structures from API calls. The hybrid recursive blacklist/regex approach allows logs to capture rich context while preventing credential leakage.

---

## 2. In-Memory Circular Buffer

### Decision
Use a standard JavaScript array wrapped in a singleton class (`AuthLogger`), utilizing `push` and `shift` for FIFO (first-in-first-out) eviction when length exceeds 100.

### Rationale
With a fixed maximum capacity of exactly 100 log entries, the overhead of standard array insertions and shifts is negligible (taking < 0.01ms in JavaScript). This approach is highly readable, robust, and performs flawlessly in React Native's single-threaded JavaScript runtime.

### Alternatives Considered
- **Pre-allocated arrays with write-index pointers**: Reusing index pointers (e.g., `buffer[index % 100] = newLog`) is highly performant for primitive arrays, but since we are storing object references and need to retrieve the logs in chronological order, sorting or slicing a pointer-wrapped array adds unnecessary logic and complexity for a buffer size of only 100.
- **Persistent storage (AsyncStorage/SecureStore)**: Rejected because the specification requires logs to be in-memory only, not persisted to disk, and cleared entirely on app restart to minimize data footprint and exposure risk.

---

## 3. Performance and Duration Tracking

### Decision
Use `Date.now()` (or `performance.now()` if available) to measure operation durations. The caller can initiate a log with `status: 'pending'`, record the start timestamp, and then log completion using the duration difference.

### Rationale
Measuring milliseconds is natively supported across all JS engines. Wrapping the timing logic inside helper methods (e.g., `logOperation`) simplifies caller code and ensures consistent warnings for any auth operation taking longer than 1000ms.

### Alternatives Considered
- **`console.time()` / `console.timeEnd()`**: These tools write output directly to the system console, preventing the application from capturing the numeric duration programmatically for storing in the `AuthLog` history.
- **External performance tracing libraries**: Overkill for this utility, introducing unnecessary package bloat.
