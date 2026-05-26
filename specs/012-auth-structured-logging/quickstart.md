# Developer Quickstart: Auth Structured Logging

This quickstart guide demonstrates how to use the Auth Logger utility to log authentication operations, retrieve logs, and understand data redaction in the Collectto application.

## 1. Importing the Logger

The logger is exported as a singleton instance from `src/utils/authLogging.ts`.

```typescript
import { authLogger } from '@/utils/authLogging';
```

---

## 2. Timing and Logging Operations

There are two primary ways to log operations: using the wrapper method `track` or manually using `startOperation` and `completeOperation`.

### Method A: Using the `track` Helper (Recommended)

The `track` helper automatically starts the operation, measures the duration, handles success/failure, registers exceptions, and completes the log entry.

```typescript
import { authLogger } from '@/utils/authLogging';

async function performLogin(credentials: Credentials) {
  return authLogger.track(
    { module: 'AuthProvider', action: 'signIn' },
    async () => {
      // 1. Send the login request
      const response = await api.post('/auth/login', credentials);
      
      // 2. Return the result
      return response.data;
    }
  );
}
```

### Method B: Manual Operation Tracing

If your operation involves custom flows (e.g., retries or conditional error mapping), you can log step-by-step.

```typescript
import { authLogger } from '@/utils/authLogging';

async function performTokenRefresh(attempt: number) {
  const logId = authLogger.startOperation({
    module: 'TokenManager',
    action: 'tokenRefresh',
    retryCount: attempt,
  });

  try {
    const refreshed = await api.post('/auth/refresh');
    
    // Complete with success
    authLogger.completeOperation({
      id: logId,
      status: 'success',
    });
    
    return refreshed;
  } catch (error) {
    // Complete with failure and attach the raw error
    authLogger.completeOperation({
      id: logId,
      status: 'failed',
      errorType: 'network_timeout', // optional code
      error: error, // will be recursively redacted
    });
    
    throw error;
  }
}
```

---

## 3. Reviewing and Cleaning Session Logs

Logs are stored entirely in an in-memory buffer capped at 100 entries.

```typescript
// Retrieve all logs in chronological order
const currentLogs = authLogger.getLogs();
console.log(JSON.stringify(currentLogs, null, 2));

// Clear the buffer
authLogger.clearLogs();
```

---

## 4. Redaction Behavior

The logger automatically sanitizes parameters and error messages.

### Example: Axios Error with Sensitive JWT

If an error message contains:
`"Failed to refresh session: Expired token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.signature"`

The `AuthLogger` sanitizes it to:
`"Failed to refresh session: Expired token: [REDACTED_JWT]"`

If an error object is logged:
```json
{
  "config": {
    "headers": {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Request failed with status code 401"
}
```

It is redacted recursively to:
```json
{
  "config": {
    "headers": {
      "Authorization": "[REDACTED]"
    }
  },
  "message": "Request failed with status code 401"
}
```
