# Quickstart Guide: Session Storage and Restoration

This guide outlines how session persistence is implemented, how to configure it, and how to verify/test the auto-restoration flow.

## 1. Overview of the Flow

The session persistence system automatically runs during app startup (bootstrap phase). 

1. **Bootstrap**: `AuthProvider` runs its initialization hook (`useEffect`) on mount.
2. **Fetch**: It attempts to read the token from `expo-secure-store`.
3. **Format Check**: It ensures the token is a valid 3-part JWT.
4. **Expiration Check**: It decodes the payload locally and checks if the `exp` claim is in the future.
5. **Hydration**: 
   - If online: Fetches the user profile from the backend to refresh in-memory details.
   - If offline: Restores session immediately using cached token claims, allowing offline access.
6. **Graceful Degrade**: If secure storage throws an error, the app continues using an in-memory session (no persistence, but no crash).

---

## 2. Configuration & Integration

### Enabling Session Restoration
To enable the persistent session restoration, set `shouldRestorePersistentSession` to `true` in `src/providers/AuthProvider.tsx`:

```typescript
// src/providers/AuthProvider.tsx
const shouldRestorePersistentSession = true;
```

When this flag is `true`:
- Valid tokens will be read at startup.
- Tokens will be saved to `SecureStore` upon successful login.
- Tokens will be deleted from `SecureStore` upon logout.

---

## 3. Usage Example (Conceptual)

Below is the updated token validation and restoration logic running inside `AuthProvider`:

```typescript
// Format checking
export function isValidJwtFormat(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.trim().length > 0);
}

// Expiration checking
export function isTokenExpired(exp: number): boolean {
  return Date.now() >= exp * 1000;
}

// Bootstrap loop
async function bootstrapSession() {
  try {
    if (isDebugModeEnabled()) {
      startDebugSession();
    }

    if (shouldRestorePersistentSession) {
      const token = await getSessionToken(); // Safely wrapped in try-catch

      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        
        // 1. Format check
        if (!isValidJwtFormat(cleanToken)) {
          console.warn('[auth] Persisted token has invalid JWT format. Clearing.');
          await clearSessionToken();
          return;
        }

        // 2. Expiration check
        const claims = decodeJwtPayload(cleanToken);
        if (claims && claims.exp && isTokenExpired(claims.exp)) {
          console.warn('[auth] Persisted token has expired. Clearing.');
          await clearSessionToken();
          return;
        }

        // 3. Header setup
        api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
        const resolvedUserId = resolveUserIdFromToken(cleanToken);

        if (resolvedUserId) {
          try {
            // Online profile refresh
            const profile = await getUserById(resolvedUserId);
            setUser(resolveAuthUserFromProfile(profile, profile.email));
            return;
          } catch (error) {
            // Offline cached fallback: token claims
            console.warn('[auth] Profile hydration failed (probably offline). Using cached claims.');
          }
        }

        setUser(resolveAuthUserFromToken(cleanToken, 'user@example.com'));
        return;
      }
    }
  } catch (storageError) {
    console.error('[auth] SecureStore read failed. Fallback to memory session.', storageError);
  } finally {
    setIsLoading(false);
  }
}
```

---

## 4. How to Test and Verify

### Testing Successful Restoration (P1)
1. Set `EXPO_PUBLIC_DEBUG_MODE=true` (or configure a real backend).
2. Set `shouldRestorePersistentSession = true`.
3. Open the app and log in.
4. Verify that you are redirected to the Home/Profile page.
5. Close the app (terminate the process or reload via Expo CLI by pressing `r`).
6. Re-open the app. Verify that you are automatically logged in and see the Home/Profile page immediately without seeing the login prompt.

### Testing Expired Token Redirection (P1)
To verify that expired tokens do not grant access:
1. Log in.
2. Manually change the device's clock to 2 days in the future (or mock the `isTokenExpired` function to always return `true`).
3. Reload the app.
4. Verify that the app deletes the expired token, clears auth state, and redirects you back to the login screen.

### Testing Storage Unavailability Fallback (P2)
To simulate a device without a secure enclave:
1. Mock `SecureStore.getItemAsync` to throw an error (e.g. `throw new Error("Keychain unavailable")`).
2. Log in.
3. Verify that the login completes successfully and the app works for the current session (meaning the token remains in the React state/in-memory).
4. Reload the app.
5. Verify that the session is not restored (since storage was unavailable), but the app starts on the login page without crashing.
