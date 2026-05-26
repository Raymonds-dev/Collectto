# Interface Contract: Error Mapping Module

This document defines the interface contract for the centralized error mapping module.

## 1. Module Export Schema

The module `src/utils/errorMapping.ts` exposes a single, strongly-typed mapping function:

```typescript
/**
 * Centralized error mapping function. Matches any caught error (AxiosError, Network offline, etc.)
 * against the provided context and returns a user-friendly MappedError object.
 *
 * @param error - The raw error caught in a try/catch block.
 * @param context - The context in which the error occurred.
 * @returns MappedError object containing pt-BR user message and category.
 */
export const mapErrorToMessage = (
  error: unknown,
  context?: ErrorContext
): MappedError;
```

---

## 2. Input/Output Models

The module is integrated using the following type contracts:

```typescript
export type ErrorContext = 'login' | 'signup' | 'profile_update' | 'generic';

export type ErrorCategory = 
  | 'VALIDATION' 
  | 'AUTH' 
  | 'CONFLICT' 
  | 'NOT_FOUND' 
  | 'NETWORK' 
  | 'TIMEOUT' 
  | 'SERVER' 
  | 'UNKNOWN';

export interface MappedError {
  message: string;
  category: ErrorCategory;
  fieldErrors?: Record<string, string>;
  retryable: boolean;
  retryAfter?: number; // In seconds
  code: string;
}
```

---

## 3. UI Component Contracts

UI components that display error alerts (e.g. `ErrorAlert` or form fields) consume the contract as follows:

```typescript
export interface ErrorAlertProps {
  /** The mapped error object */
  error: MappedError | null;
  /** Callback triggered when retryable action is clicked */
  onRetry?: () => void;
}
```

---

## 4. Contract Scenarios & Expected Mapping Outputs

### Scenario A: HTTP 401 Unauthorized during login
* **Input Error**: AxiosError with status 401
* **Input Context**: `'login'`
* **Output `MappedError`**:
  ```json
  {
    "message": "Email ou senha incorretos. Tente novamente ou redefina sua senha.",
    "category": "AUTH",
    "retryable": false,
    "code": "AUTH_INVALID_CREDS"
  }
  ```

### Scenario B: HTTP 401 Unauthorized post-auth (e.g. session token expired)
* **Input Error**: AxiosError with status 401
* **Input Context**: `'profile_update'`
* **Output `MappedError`**:
  ```json
  {
    "message": "Sua sessão expirou. Faça login novamente.",
    "category": "AUTH",
    "retryable": false,
    "code": "AUTH_SESSION_EXPIRED"
  }
  ```

### Scenario C: HTTP 409 Email conflict during signup
* **Input Error**: AxiosError with status 409 and response body `{ "field": "email" }`
* **Input Context**: `'signup'`
* **Output `MappedError`**:
  ```json
  {
    "message": "Este email já está registrado. Faça login com sua conta existente.",
    "category": "CONFLICT",
    "fieldErrors": {
      "email": "Este email já está registrado. Faça login com sua conta existente."
    },
    "retryable": false,
    "code": "CONFLICT_EMAIL_TAKEN"
  }
  ```

### Scenario D: Timeout error during request
* **Input Error**: AxiosError with code `'ECONNABORTED'` or status `408`
* **Input Context**: `'generic'`
* **Output `MappedError`**:
  ```json
  {
    "message": "A solicitação levou muito tempo. Verifique sua conexão e tente novamente.",
    "category": "TIMEOUT",
    "retryable": true,
    "code": "NETWORK_TIMEOUT"
  }
  ```

### Scenario E: HTTP 429 Too Many Requests with Retry-After header
* **Input Error**: AxiosError with status 429 and response headers `{ "retry-after": "45" }`
* **Input Context**: `'generic'`
* **Output `MappedError`**:
  ```json
  {
    "message": "Muitas tentativas. Aguarde alguns minutos e tente novamente. Tente novamente em 45 segundos.",
    "category": "SERVER",
    "retryable": true,
    "retryAfter": 45,
    "code": "RATE_LIMITED"
  }
  ```
