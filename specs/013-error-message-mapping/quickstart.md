# Developer Quickstart: centralizing error message mapping

This guide helps you integrate and use the centralized error mapping module in API services and React Native screens.

## 1. Importing the mapper

Import the `mapErrorToMessage` function and types in your file:

```typescript
import { mapErrorToMessage } from '@/utils/errorMapping';
import type { MappedError } from '@/types/error';
```

---

## 2. Usage in API / Hook calls

### Example: Axios request in a screen / provider

When making a request (e.g. Login), capture the error and pass the context:

```typescript
import { useState } from 'react';
import { mapErrorToMessage } from '@/utils/errorMapping';
import type { MappedError } from '@/types/error';

export const useLogin = () => {
  const [error, setError] = useState<MappedError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/auth/login', credentials);
    } catch (err) {
      // Map the raw error using 'login' context
      const mapped = mapErrorToMessage(err, 'login');
      setError(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
};
```

---

## 3. Handling inline validation / field-level errors

For validations (like in the registration or profile update flow), use `fieldErrors` from `MappedError`:

```tsx
import { useState } from 'react';
import { TextInput, Text, View } from 'react-native';
import { mapErrorToMessage } from '@/utils/errorMapping';
import type { MappedError } from '@/types/error';

export default function ProfileScreen() {
  const [error, setError] = useState<MappedError | null>(null);

  const handleUpdate = async (profileData) => {
    try {
      setError(null);
      await updateProfile(profileData);
    } catch (err) {
      const mapped = mapErrorToMessage(err, 'profile_update');
      setError(mapped);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" />
      {/* Show field-level validation message if it exists */}
      {error?.fieldErrors?.email && (
        <Text className="text-red-500">{error.fieldErrors.email}</Text>
      )}

      {/* Show global error alert if it's not field specific */}
      {error && !error.fieldErrors && (
        <Text className="text-red-600 bg-red-100 p-3 rounded">
          {error.message}
        </Text>
      )}
    </View>
  );
}
```

---

## 4. Running Validation and Tests

Once you make changes, run the following verification scripts:

```bash
# Formats files
npm run format

# Run project lint checks
npm run lint

# Run TypeScript compilation checks
npm run type-check

# Run full project validation
npm run validate
```

Once the test suite configuration is added during Phase 2, you can also run unit tests:
```bash
# Run unit tests
npm run test
```
