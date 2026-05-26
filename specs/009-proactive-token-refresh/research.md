# Research & Design Decisions: Proactive Token Refresh

This document outlines the research, technical choices, and design rationales for implementing proactive token expiration handling (silent refresh + reactive logout) in the Collectto frontend.

## 1. JWT Expiration Extraction (FR-001)

### Decision
Extract the token expiration time by decoding the JWT access token client-side and parsing the standard `exp` claim.

* **Implementation Detail**: 
  We will enhance `decodeJwtPayload` in the authentication provider/utilities to parse the `exp` field and expose it in `AuthenticationSession`.
  ```typescript
  export interface JwtPayloadClaims {
    sub?: string;
    userId?: string;
    email?: string;
    username?: string;
    iat?: number;
    exp?: number; // Added for expiration parsing
  }
  ```
  The expiration timestamp will be converted to epoch seconds and handled timezone-awarely.

### Rationale
JWT is a stateless token format containing its own metadata. The `exp` claim represents the expiration time as the number of seconds since the Unix epoch (UTC). Decoding it client-side allows us to know exactly when the session will expire without invoking any network requests or API endpoints.

### Alternatives Considered
* **Querying Expiration Endpoint**: Invoking an endpoint to fetch token metadata.
  * *Rejected because*: It introduces unnecessary network traffic, latency, and potential points of failure.
* **Storing Expiration Separately**: Storing expiration time in local storage during login.
  * *Rejected because*: If the token is manually replaced, copied, or decoded during debugging, the stored expiration may get out of sync with the actual token validity. The token itself is the single source of truth.

---

## 2. Event-Driven Proactive Refresh Scheduling (FR-002, FR-003, FR-006, FR-010)

### Decision
Implement a timer-based manager (`SessionRefreshManager`) that schedules a background refresh task exactly 5 minutes before the token expires.

* **Implementation Detail**:
  When a session is established (app launch bootstrap, sign-in, sign-up), the manager:
  1. Decodes the token to find `exp`.
  2. Calculates the delay: `delay = (exp * 1000) - Date.now() - (5 * 60 * 1000)`.
  3. If `delay <= 0` (meaning token expires in less than 5 minutes), the refresh is executed immediately.
  4. Otherwise, it uses `setTimeout` to schedule the refresh.
  5. Upon successful validation, the timer is cleared and rescheduled for the next token.

### Rationale
Event-driven scheduling uses system timers to sleep until the exact moment refresh is needed, satisfying the core performance criteria: "zero polling, only event-driven refresh - no periodic wake-locks" (SC-006).

### Alternatives Considered
* **Periodic Polling (Interval)**: Checking token validity every 1 or 5 minutes.
  * *Rejected because*: Polling wakes the device CPU repeatedly, wasting battery and violating the constitution's performance guidelines.
* **On-Request Check**: Checking if the token is near expiration only when the user makes an API call.
  * *Rejected because*: If the user is idle but keeping the app open (e.g., reading a collection screen), the session could expire. When they finally take an action, it would fail or trigger a laggy reactive logout. The proactive refresh must happen silently in the background regardless of user interaction.

---

## 3. Foreground/Background Synchronization (FR-008, FR-009)

### Decision
Observe React Native `AppState` changes. When the app transitions from `background` to `active`, the refresh manager immediately evaluates the token state.

* **Implementation Detail**:
  ```typescript
  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      sessionRefreshManager.reconcileSessionState();
    }
  });
  ```
  If the token has expired during background state, it triggers immediate silent logout. If the token is within the 5-minute window, it triggers immediate proactive refresh.

### Rationale
Mobile operating systems throttle or completely suspend JavaScript timers (`setTimeout`) when the app is backgrounded. When the app returns to the foreground, the scheduled timer might fire late or never. Re-checking the state immediately on app foregrounding ensures the session is always valid and consistent.

### Alternatives Considered
* **Expo Background Tasks / Wake-locks**:
  * *Rejected because*: Operating systems restrict background execution, and registering persistent background workers consumes battery, violating SC-006.

---

## 4. Centralized 401 Interception (FR-004, FR-005)

### Decision
Configure a centralized Axios response interceptor on the `api` instance to capture all `401 Unauthorized` responses and route them to a single session-clearing callback.

* **Implementation Detail**:
  ```typescript
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await sessionRefreshManager.handleUnauthorized();
      }
      return Promise.reject(error);
    }
  );
  ```

### Rationale
A centralized interceptor guarantees that regardless of where an API request is made (components, services, hooks), a 401 response is handled immediately and uniformly. The user is logged out silently without any intrusive error alerts, satisfying the "Fluidez" principle.

### Alternatives Considered
* **Local Catch blocks**: Handling 401 in every service call.
  * *Rejected because*: Leads to massive code duplication, inconsistent behaviors, and multiple concurrent requests could trigger duplicate logout triggers or race conditions.

---

## 5. Offline and Network Error Resilience (FR-008)

### Decision
Verify network availability before sending the proactive refresh request. If a network request fails due to an offline state or network timeout, the failure is logged as a warning, and proactive refresh is skipped without triggering a logout.

* **Implementation Detail**:
  If a proactive refresh request fails with a network error (e.g. `ERR_NETWORK` or `ECONNABORTED`), the manager logs the attempt as `failed` with the network reason but does NOT clear the session. The user remains authenticated locally. Expiration will eventually be caught by the 401 interceptor on the next action after reconnection, or by the AppState/timer checks.

### Rationale
Offline behavior should not disrupt current local usage. If the device is offline, it cannot refresh, but the user should still be able to view cached screens until they reconnect and attempt an action that requires server communication.

### Alternatives Considered
* **Immediate logout on refresh network failure**:
  * *Rejected because*: A transient drop in cellular connectivity would trigger an annoying immediate logout, violating FR-008 and FR-009.
