# Data Model: Proactive Token Refresh

This document outlines the data types, validation constraints, and storage specifications for the session and refresh attempt tracking entities.

## 1. Data Structures

### 1.1 AuthenticationSession
Represents the current authenticated session state, including token metadata and timer references.

```typescript
export interface AuthenticationSession {
  /** The JWT access token used in request Authorization headers */
  accessToken: string;

  /** Epoch timestamp (in seconds) representing when the token expires */
  expirationTimestamp: number;

  /** Epoch timestamp (in seconds) representing when the token was issued */
  issuedAt: number;

  /** Reference to the scheduled active refresh timer */
  refreshTimerId: NodeJS.Timeout | null;
}
```

### 1.2 RefreshAttempt
Represents a recorded attempt to validate/refresh the active session. This is used for troubleshooting, monitoring, and debugging.

```typescript
export interface RefreshAttempt {
  /** ISO-8601 string of when the refresh attempt occurred */
  timestamp: string;

  /** Result of the refresh attempt */
  status: 'success' | 'failed' | 'cancelled';

  /** The new expiration timestamp (epoch seconds) if the attempt was successful */
  nextExpirationTime: number | null;

  /** Description of the failure (e.g. Network Error, HTTP 500, Timeout) */
  errorReason: string | null;
}
```

---

## 2. Validation & Parsing Rules

### 2.1 JWT Claims Parsing (FR-001)
To construct an `AuthenticationSession` from a JWT string, the following validations must pass:
1. **Format Validation**: The token must consist of exactly three dot-separated segments (header, payload, signature).
2. **Payload Parsing**: The second segment must be successfully decoded from Base64Url format into a JSON object.
3. **Claim Validation**:
   - The decoded object MUST contain a numeric `exp` (expiration) claim.
   - The `exp` value must represent a valid future timestamp (in seconds).
   - If `exp` is missing or invalid, the token is rejected as unparseable.

### 2.2 Date/Time Arithmetic
- **Clock Skew Cushion**: A safety cushion of 10 seconds is applied when calculating remaining time to account for minor clock discrepancies between the client and server.
- **Timezone Awareness**: All calculations are performed relative to UTC epoch seconds to ensure timezone changes on the device do not affect the expiration calculation.

---

## 3. Storage & Lifecycle Strategy

| Data Type | Storage medium | Lifetime | Notes |
| :--- | :--- | :--- | :--- |
| **accessToken** | `expo-secure-store` | Persistent | Secured at the platform level (Keychain/Keystore). Cleared immediately on logout/expiration. |
| **expirationTimestamp** | In-Memory (State) | Session | Re-evaluated on app bootstrap by decoding the stored token. |
| **refreshTimerId** | In-Memory (Reference) | Session | Cleared and recreated dynamically. Must be explicitly cancelled on logout to prevent leaks. |
| **RefreshAttempt Logs** | In-Memory (Array) | Session / Console | Capped at 50 entries to prevent memory growth (SC-009). Accessible via debugging interfaces. |

### 3.1 Timer Lifecycle
1. **Creation**: Triggered when `api.defaults.headers.common['Authorization']` is set.
2. **Rescheduling**: Cancel the current `refreshTimerId` (via `clearTimeout`) and set a new one when a new token is stored.
3. **Cancellation**: Cancel the current `refreshTimerId` on user logout or when a 401 response is intercepted.
