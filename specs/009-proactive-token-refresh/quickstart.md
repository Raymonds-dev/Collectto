# Developer Quickstart: Proactive Token Refresh

This guide demonstrates how to configure, use, and troubleshoot the proactive token refresh and reactive logout mechanisms in the Collectto frontend.

## 1. Setup & Initialization

### 1.1 Integration in AuthProvider
The `SessionRefreshManager` must be initialized when `AuthProvider` mounts. It requires binding callback handlers for when a session becomes unauthorized (401/expired) or when a token is refreshed.

Open `src/providers/AuthProvider.tsx` and integrate the manager:

```typescript
import { sessionRefreshManager } from '@/services/auth/sessionRefreshManager';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  // Define callback handlers
  const handleUnauthorized = useCallback(async () => {
    // 1. Clear secure store
    await clearSessionToken();
    // 2. Remove default common header
    delete api.defaults.headers.common['Authorization'];
    // 3. Clear react state
    setUser(null);
    // 4. Redirect silently to login
    router.replace('/(auth)/tela_inicial');
  }, [router]);

  const handleTokenRefreshed = useCallback(async (newToken: string) => {
    // 1. Save new token in secure store
    await setSessionToken(newToken);
    // 2. Update default common header
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }, []);

  useEffect(() => {
    // Initialize callbacks on mount
    sessionRefreshManager.initialize(handleUnauthorized, handleTokenRefreshed);

    return () => {
      // Clean up timers on unmount
      sessionRefreshManager.clearSession();
    };
  }, [handleUnauthorized, handleTokenRefreshed]);

  // When user successfully signs in
  const signIn = async (credentials: Credentials) => {
    // ... authentication request ...
    const token = response.accessToken;
    
    // Start proactive tracking
    sessionRefreshManager.startSession(token);
    
    // Set user state
    setUser(resolvedUser);
  };
  
  // When user signs out
  const signOut = async () => {
    // ... clear local session ...
    sessionRefreshManager.clearSession();
  };
}
```

---

## 2. Debugging & Mocking

### 2.1 Enabling Short Token Expirations for Testing
To test the proactive refresh cycle without waiting for 4 hours:
1. Turn on Mock Mode by setting the environment variable in `.env`:
   ```env
   EXPO_PUBLIC_DEBUG_MODE=true
   ```
2. The mock token generator in `src/services/debug/mockAuthService.ts` will generate tokens with custom `exp` claims (e.g., expiring in 6 minutes, triggering refresh in 1 minute).

### 2.2 Inspecting Refresh Attempt Logs
You can view the refresh attempts in real-time. In a developer console, or on a diagnostic screen, import the manager and read logs:

```typescript
import { sessionRefreshManager } from '@/services/auth/sessionRefreshManager';

const printDiagnosticLogs = () => {
  const attempts = sessionRefreshManager.getRefreshAttempts();
  console.table(attempts);
};
```

---

## 3. Troubleshooting & Edge Cases

### 3.1 App Background / Wake-up Delay
If the device goes to sleep and wakes up past the expiration time, the timer will not have executed. The manager handles this through `AppState` event handlers:
* Upon wake-up, the remaining validity is recalculated.
* If expired, `handleUnauthorized` is invoked immediately (within 100ms of app wake-up).

### 3.2 Offline Behavior
* If the user loses internet connection, the manager detects the state and defers the background network request.
* No `failed` network alerts are shown to the user.
* When the user reconnects and attempts an API call, if the token has expired, the Axios interceptor catches the `401 Unauthorized` and executes immediate silent redirection.
