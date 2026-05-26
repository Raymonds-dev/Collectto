# Research & Design Decisions: Session Storage and Restoration

## 1. Secure Storage Technology Choice

### Decision
Use `expo-secure-store` exclusively for storing the JWT token on the client.

### Rationale
- **Security**: Unlike `AsyncStorage` which stores data in cleartext on the filesystem, `expo-secure-store` encrypts values before writing to disk using standard OS encryption APIs:
  - **iOS**: Keychain services.
  - **Android**: `EncryptedSharedPreferences` (leveraging the Android Keystore system).
- **Compliance**: FR-006 explicitly forbids the use of `AsyncStorage` or memory-only storage for the persistent token.
- **Ecosystem**: `expo-secure-store` is standard in Expo SDK 54, which aligns with the project's dependency tree.

### Alternatives Considered
- **React Native Keychain (`react-native-keychain`)**: Rejected because the project is based on Expo and Expo Router. `expo-secure-store` provides native support with zero extra native configuration in the Expo managed workflow.
- **AsyncStorage with JS encryption**: Rejected because managing encryption keys on the JS side is insecure and complex compared to OS-native secure enclaves.

---

## 2. JWT Format Validation

### Decision
Validate the token on startup by verifying it conforms to the standard JWT format (three base64-encoded segments separated by dots) before decoding or using it.

### Rationale
- **Robustness**: Protects the app from crashing due to malformed, corrupted, or incomplete token data stored in the SecureStore (e.g. from an interrupted write or app update migration issue).
- **Compliance**: FR-011 and FR-003 require checking that the restored token is non-empty and follows the `header.payload.signature` format.
- **Implementation**:
  ```typescript
  export function isValidJwtFormat(token: string): boolean {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Verify each part is non-empty
    return parts.every(part => part.trim().length > 0);
  }
  ```

---

## 3. Local Token Expiration (TTL) Validation

### Decision
Extract the `exp` claim from the JWT payload using client-side base64url decoding and compare it against the current local system time before restoring the session.

### Rationale
- **Security**: Prevents presenting an authenticated screen to the user using an expired token. The expired token would just fail anyway on subsequent API requests, resulting in confusing layout jumps or error boundaries triggering.
- **Compliance**: FR-004 specifies checking token TTL before restoring the session.
- **Implementation**:
  - The JWT payload is the second segment (`parts[1]`).
  - Decode base64url to string, then parse as JSON.
  - Compare `Date.now() >= exp * 1000` (since `exp` is in seconds and `Date.now()` is in milliseconds).
  - If expired, delete the token and redirect to login.

### Alternatives Considered
- **Server validation on startup**: Rejected as the primary blocker. If the network is unavailable on startup, server-side validation will fail. We must allow offline startup using cached session state (as per assumptions and edge cases), which requires local expiration checks.

---

## 4. SecureStore Unavailability & Fallback

### Decision
Wrap all `expo-secure-store` read and write calls in try-catch blocks. If any exception is thrown (e.g. due to hardware security exceptions or lack of hardware enclave), degrade gracefully by storing the session token solely in-memory (in the `AuthProvider` state) and log a warning instead of crashing.

### Rationale
- **Robustness**: Some devices (especially simulators, rooted devices, or older Android devices) might fail during secure store operations. If they do, crashing is a bad user experience.
- **Compliance**: FR-008 and SC-005 require fallback to non-persistent session.
- **Implementation**:
  - Wrap `getSessionToken`, `setSessionToken`, and `clearSessionToken` in try-catch.
  - On error during write (`setSessionToken`), fallback to memory storage (which is already happening since the React state `user` is set). The next app restart will require logging in again.
  - On error during read (`getSessionToken`), return `null` so the app behaves as if no session was persisted.

---

## 5. Debug Mode and Mocking Persistence

### Decision
Allow session persistence testing in debug mode by returning a fully valid mock JWT token format from `mockAuthService.login` and persisting/restoring it normally.

### Rationale
- **Testability**: If debug mode doesn't support session persistence, developers cannot test the auto-login flows, logout clearing, or expiration behavior without pointing to a real staging backend.
- **Format**:
  - The mock token will be:
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJsb2NhbC11c2VyIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwibmFtZSI6IlVzZXIiLCJleHAiOjIyMDg5ODg4MDB9.signature`
  - This has 3 segments, decodes to `userId: "local-user"`, `email: "user@example.com"`, and `exp: 2208988800` (which is in the year 2040, preventing premature local expiration).
  - When `isDebugModeEnabled()` is true, the `AuthProvider` will call `setSessionToken` and `getSessionToken` exactly like in production.
