# Data Model: Improve Error Messages and HTTP Error Mapping

This document details the TypeScript definitions, structures, and validation rules for the error mapping system.

## 1. Type Definitions

The centralized mapping system works with the following domain models.

### `ErrorContext`
Determines which context-specific user guidance to provide.
```typescript
export type ErrorContext = 'login' | 'signup' | 'profile_update' | 'generic';
```

### `ErrorCategory`
Enables the UI to render conditional blocks (e.g. disable fields, show inline alerts, show retry button).
```typescript
export type ErrorCategory = 
  | 'VALIDATION' 
  | 'AUTH' 
  | 'CONFLICT' 
  | 'NOT_FOUND' 
  | 'NETWORK' 
  | 'TIMEOUT' 
  | 'SERVER' 
  | 'UNKNOWN';
```

### `MappedError`
The output shape returned by the mapper and consumed by UI components.
```typescript
export interface MappedError {
  /** User-friendly Brazilian Portuguese error message */
  message: string;
  
  /** Category of the error for programatic handling in UI */
  category: ErrorCategory;
  
  /** Field-level errors mapping field names to specific messages (for form validation) */
  fieldErrors?: Record<string, string>;
  
  /** Flag showing if user can retry the operation */
  retryable: boolean;
  
  /** Duration in seconds to wait before retrying (parsed from Retry-After header) */
  retryAfter?: number;
  
  /** A unique diagnostic code for support tracking */
  code: string;
}
```

---

## 2. API Response Formats

We expect the backend API to return structured errors. Below are the shapes parsed by the mapper.

### Standard Backend Error Response
```typescript
export interface ApiErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  field?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
```

### Validation Error Body (e.g. 400 Bad Request)
NestJS validation libraries often return details in either of these formats:
1. Flat fields:
   ```json
   {
     "statusCode": 400,
     "error": "Bad Request",
     "message": ["email must be an email", "password must be longer than or equal to 6 characters"]
   }
   ```
2. Structured fields:
   ```json
   {
     "statusCode": 400,
     "error": "Bad Request",
     "details": [
       { "field": "email", "message": "Formato de email inválido" },
       { "field": "password", "message": "A senha deve ter no mínimo 6 caracteres" }
     ]
   }
   ```

The mapper must be robust enough to parse both formats and transform them into `fieldErrors`.

---

## 3. Data Transformations & Validation Rules

When mapping raw errors to `MappedError`, the following validation rules apply:

1. **Email Enumeration Prevention**:
   - If context is `'login'` and status code is `401` or `404`, the output MUST be `"Email ou senha incorretos. Tente novamente ou redefina sua senha"`. Under no circumstance should the message indicate whether the email exists.
2. **Conciseness limit**:
   - Every mapped message MUST be constrained to 2 sentences and less than 150 characters.
3. **Wait duration range validation**:
   - The `retryAfter` value parsed from `Retry-After` header must be a positive integer. If it is negative or non-numeric, it must be ignored.
4. **Sanitization rule**:
   - We strip any user-submitted strings (like the actual typed email address or password) from the output messages to avoid reflecting PII.
