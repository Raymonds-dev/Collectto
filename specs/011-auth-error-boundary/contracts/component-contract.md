# Interface Contract: AuthErrorBoundary

This document defines the interface contract for the `AuthErrorBoundary` component, detailing its React props, state, public hooks/triggers, and error reporting format.

## 1. Component Interfaces

### `AuthErrorBoundary` Component Props

```typescript
import { ReactNode } from 'react';

export interface AuthErrorBoundaryProps {
  /**
   * The tree containing AuthProvider and other child components.
   */
  children: ReactNode;

  /**
   * Optional custom test ID for integration testing.
   */
  testID?: string;
}
```

### `AuthErrorBoundary` Component State

```typescript
import { AuthErrorInfo, RetryState } from '../data-model';

export interface AuthErrorBoundaryState {
  /**
   * The active error caught by the boundary, or null if no error exists.
   */
  error: AuthErrorInfo | null;

  /**
   * The state of the retry mechanism.
   */
  retry: RetryState;

  /**
   * Key used to force remount of the AuthProvider child.
   */
  remountKey: number;
}
```

---

## 2. Child-to-Parent Error Signaling Contract

Because asynchronous code (e.g. `useEffect`, promises, handlers) does not trigger native React class boundaries automatically, the `AuthProvider` must catch its own async errors and re-throw them in its render scope.

### Render Scope Throw Pattern

`AuthProvider` must implement a local state to capture async errors and throw them during its render phase.

```typescript
// Inside AuthProvider.tsx
const [bootstrapError, setBootstrapError] = useState<Error | null>(null);

if (bootstrapError) {
  // Bubbles directly to AuthErrorBoundary
  throw bootstrapError; 
}

// Inside useEffect / async bootstrap
try {
  await bootstrapSession();
} catch (err) {
  setBootstrapError(err instanceof Error ? err : new Error(String(err)));
}
```

---

## 3. Network Listener Contract

To support automatic retry on network reconnection (**FR-007**), the boundary (or fallback UI) subscribes to network updates.

### Subscription Lifecycle

```typescript
import NetInfo from '@react-native-community/netinfo';

// On mount (when in NETWORK error state)
const unsubscribe = NetInfo.addEventListener((state) => {
  if (state.isConnected && activeError?.type === 'NETWORK') {
    triggerAutoRetry();
  }
});

// On unmount / recovery
unsubscribe();
```
