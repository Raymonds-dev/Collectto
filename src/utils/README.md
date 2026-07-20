# Centralized Error Mapping Module

This module provides a unified interface to map any network, client, validation, or server error into a user-friendly, localized Brazilian Portuguese (`pt-BR`) message.

## Directory Structure

- `src/types/error.ts`: Types, interfaces, and API response structures.
- `src/utils/errorMapping.ts`: central error-mapper implementing `mapErrorToMessage()`.
- `src/utils/__tests__/errorMapping.test.ts`: Jest unit tests validating 100% of mapping contract scenarios.
- `src/components/ui/ErrorAlert.tsx`: Reusable React Native UI component consuming `MappedError`.

## Quickstart

### 1. Import and Call the Mapper

Import `mapErrorToMessage` and type `MappedError` in your hooks, screens, or providers:

```typescript
import { mapErrorToMessage } from '@/utils/errorMapping';
import type { MappedError } from '@/types/error';
```

When handling exceptions, pass the raw caught error and context (`'login' | 'signup' | 'profile_update' | 'generic'`):

```typescript
try {
  await api.post('auth/login', credentials);
} catch (error) {
  const mapped: MappedError = mapErrorToMessage(error, 'login');
  setError(mapped); // store in react state
}
```

### 2. Render Error Feedback

Use the `<ErrorAlert />` component for general or server-level errors:

```tsx
import { ErrorAlert } from '@/components/ui/ErrorAlert';

// Inside JSX
<ErrorAlert error={error} onRetry={handleRetry} />;
```

For form validations, display field-specific messages next to each input from `fieldErrors`:

```tsx
<TextInput onChangeText={setEmail} />;
{
  error?.fieldErrors?.email && <Text style={{ color: 'red' }}>{error.fieldErrors.email}</Text>;
}
```
