# Research & Decisions: Improve Error Messages and HTTP Error Mapping

This document details the design decisions, rationale, and alternatives considered for the error message mapping feature in the Collectto frontend.

## 1. Testing Framework Resolution

* **Clarification**: The project does not currently have any test runner configured in `package.json`, yet the specification requires unit tests (`errorMapping.test.ts`) and integration validation.
* **Decision**: We will configure Jest as the testing framework. We will add `jest`, `jest-expo`, and `@types/jest` to `devDependencies`, and add a `test` script: `"test": "jest"`.
* **Rationale**: `jest-expo` is the standard unit testing framework for Expo applications. It supports TypeScript, React Native primitives, and allows fast, headless execution of tests for pure JS/TS modules (like our error mapper) and components.
* **Alternatives considered**: 
  - *No automated tests*: Rejected because testing error mapping scenarios manually (every HTTP status, context, and header combination) is slow and highly error-prone.
  - *Vitest*: Rejected because Jest-Expo is pre-optimized for Expo/React Native projects.

## 2. Network Connectivity and Timeout Detection

* **Decision**: Network and timeout errors will be detected through the Axios error instance:
  - **Timeout Error**: Check if the Axios error has `code === 'ECONNABORTED'` or `error.message` includes `"timeout"`. We will also set a default `timeout` threshold of 30 seconds on our Axios instance.
  - **Offline/Network Failure**: If the error is an `AxiosError`, but `error.response` is undefined and `error.request` is present (or `error.message === 'Network Error'`), it will be mapped to the `NETWORK` category. We will also check `navigator.onLine` on web.
* **Rationale**: Utilizing Axios's built-in error codes and state avoids pulling in heavy third-party libraries (like `@react-native-community/netinfo`) which require native linking and complex mock configurations for tests.
* **Alternatives considered**:
  - *Adding `@react-native-community/netinfo`*: Evaluated but deferred because it introduces native dependencies that might complicate Expo builds and requires extra mock setup. Using Axios error inspection is sufficient for API request failures.

## 3. Centralized Mapping & Context-Specific Messages

* **Decision**: Create a mapping dictionary in `src/utils/errorMapping.ts` structured by context (`login | signup | profile_update | generic`) and status code.
  - Mapping signatures:
    ```typescript
    export type ErrorContext = 'login' | 'signup' | 'profile_update' | 'generic';
    
    export type ErrorCategory = 'VALIDATION' | 'AUTH' | 'CONFLICT' | 'NOT_FOUND' | 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'UNKNOWN';
    
    export interface MappedError {
      message: string;
      category: ErrorCategory;
      fieldErrors?: Record<string, string>;
      retryable: boolean;
      retryAfter?: number;
      code: string;
    }
    ```
  - Mapping details per context:
    - **401 Unauthorized**:
      - `login`: "Email ou senha incorretos. Tente novamente ou redefina sua senha" (Code: `AUTH_INVALID_CREDS`)
      - `signup`: "Você não tem permissão para fazer isso. Verifique seu cadastro." (Code: `AUTH_UNAUTHORIZED`)
      - `profile_update` / `generic`: "Sua sessão expirou. Faça login novamente" (Code: `AUTH_SESSION_EXPIRED`)
    - **409 Conflict**:
      - `signup` (where `error.field === 'email'`): "Este email já está registrado. Faça login com sua conta existente" (Code: `CONFLICT_EMAIL_TAKEN`)
      - `signup` (where `error.field === 'username'`): "Este nome de usuário já está sendo usado. Tente outro" (Code: `CONFLICT_USERNAME_TAKEN`)
      - `generic`: "Conflito de dados. Verifique as informações e tente novamente" (Code: `CONFLICT_GENERIC`)
* **Rationale**: Splitting mapping logic by context first ensures that identical HTTP status codes map to highly specific, actionable guidance appropriate for that specific stage of the user journey.
* **Alternatives considered**:
  - *Flat mapping*: Mapping status codes directly without context (e.g. 401 always maps to "Sua sessão expirou"). Rejected because it provides bad UX during login (where a 401 means invalid credentials, not an expired session).

## 4. Security and Data Leak Prevention

* **Decision**: We will enforce strict data sanitization in the mapper:
  - Error messages will be static templates containing no dynamic input fields (e.g., we will show `"Este email já está registrado."` instead of echoing the user's input email).
  - Stack traces, internal server logs, and raw exception messages from the server will be logged to console/diagnostics internally, but replaced by generic fallback messages for the user.
  - Login failure error codes (like `AUTH_INVALID_CREDS`) will be returned, but the user message will combine email and password errors to prevent email enumeration.
* **Rationale**: Echoing input or server exceptions can lead to sensitive PII exposure (e.g. JWTs or emails in queries) or server vulnerability leaks. Combining auth messages is a standard security best practice.
