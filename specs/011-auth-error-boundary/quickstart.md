# Quickstart Guide: Auth Error Boundary

This developer guide demonstrates how to integrate, trigger, and test the `AuthErrorBoundary` in Collectto.

## 1. Integration in root `_layout.tsx`

The `AuthErrorBoundary` must wrap the `AuthProvider` component to catch all rendering and propagated authentication errors.

```tsx
// File: src/app/_layout.tsx

import { AuthErrorBoundary } from '@/components/AuthErrorBoundary';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView edges={['top', 'right', 'left']} className="flex-1 bg-surface-base">
          {/* Wrap AuthProvider here */}
          <AuthErrorBoundary>
            <AuthProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </AuthProvider>
          </AuthErrorBoundary>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 2. Triggering Errors for Development Testing

You can simulate different auth failures to verify the fallback UI.

### Simulating a SecureStore Error (Storage Failure)
In `src/services/storage/authSession.ts`, mock `getSessionToken` to throw a security error:

```typescript
export async function getSessionToken(): Promise<string | null> {
  throw new Error("SecureStore error: OS keychain is locked.");
}
```

### Simulating a Corrupted Token (Parsing Failure)
In `src/services/storage/authSession.ts`, return a corrupted JWT string:

```typescript
export async function getSessionToken(): Promise<string | null> {
  return "corrupted.token.payload"; // Missing valid base64 JSON
}
```

### Simulating Network Offline (Network Error)
In `src/providers/AuthProvider.tsx`, mock the login fetch or getProfile calls to throw a network error:

```typescript
// Inside bootstrapSession or signIn
throw new Error("Network Error");
```

---

## 3. Fallback UI Component Structure

The boundary displays `src/components/AuthFallbackUI.tsx` when an error is caught.

### Fallback Layout Design
The fallback screen uses standard design system tokens:
- **Motion**: Wrapped in `MotionView` with `fade` and `slideUp` presets for premium feel.
- **Visuals**: Displays descriptive error messages with clear action buttons.
- **Actions**:
  - **Tentar Novamente (Retry)**: Restores the boundary state to attempt bootstrapping again. Uses `AnimatedPressable` for visual scale feedback.
  - **Limpar Dados (Clear Auth Data)**: Purges local tokens and forces redirect.
- **Accessibility**: Includes `accessibilityLabel` and `accessibilityRole` on all interaction nodes.
