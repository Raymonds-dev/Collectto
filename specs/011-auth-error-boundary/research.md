# Research and Design Decisions: Auth Error Boundary

This document records the research, design decisions, and rationale for the implementation of the Error Boundary for the `AuthProvider` in Collectto.

## 1. Async Error Capture in React Provider

- **Decision**: Catch async errors inside `AuthProvider`'s `useEffect` and event handlers, update a local `errorToThrow` React state, and throw the error during the render phase to trigger the React Error Boundary.
- **Rationale**: Standard React Error Boundaries (implemented via class components using `componentDidCatch` or `getDerivedStateFromError`) only catch synchronous rendering errors. Asynchronous errors, such as token retrieval from `SecureStore` or HTTP requests during bootstrapping, do not bubble up to the Error Boundary. Throwing the error during rendering forces React to propagate it to the nearest boundary.
- **Alternatives considered**:
  - *Direct UI rendering in AuthProvider*: Implementing the error fallback UI directly within `AuthProvider`. Rejected because it violates the separation of concerns: `AuthProvider` should focus on managing authentication state, not rendering fallback screens. An independent `AuthErrorBoundary` is cleaner and reusable.
  - *React Query / RTK Query*: Not currently used in the bootstrap flow, and introducing them for just this feature would add unnecessary complexity.

---

## 2. Network Connectivity & Offline Detection

- **Decision**: Use `@react-native-community/netinfo` to monitor network connectivity, with event listeners to automatically trigger a retry when connection is restored.
- **Rationale**: It is the React Native community standard for network state. It handles both iOS and Android platforms natively and provides an active subscription to connection changes (`NetInfo.addEventListener`), which is essential for auto-retry on reconnection.
- **Alternatives considered**:
  - *Custom fetch-based ping loop*: Periodically pinging the backend. Rejected because it drains battery, increases cellular data usage, and is less reliable than native network state detection.
  - *expo-network*: Requires installing another package and lacks the robust connection-change listeners that `@react-native-community/netinfo` provides.

---

## 3. Timeout vs. Network/Backend Error Differentiation

- **Decision**: Configure a 15-second timeout on auth API calls (using Axios config) and inspect the error structure to classify the error type:
  - **Network Error**: Detected when `error.message === 'Network Error'` or Axios fails without a response status, and NetInfo reports offline. Message: "Sem conexão com a internet. Verifique sua rede."
  - **Timeout Error**: Detected when Axios returns `code === 'ECONNABORTED'` or the error message indicates timeout. Message: "O servidor demorou muito para responder. Tente novamente."
  - **Storage Error**: Caught when `expo-secure-store` throws an error. Message: "Falha ao acessar o armazenamento seguro do dispositivo."
  - **Parsing Error**: Caught when base64 decoding or `JSON.parse` fails on the token. Message: "Dados de autenticação corrompidos."
  - **Unknown/General Error**: All other caught errors. Message: "Ocorreu um erro inesperado."
- **Rationale**: User-friendly messages are required by **FR-012**. Distinguishing between "No Network" and "Backend Unavailable" (timeout) ensures the user knows whether the issue is local or server-side.
- **Alternatives considered**:
  - *Generic error screen*: Displaying a single generic error screen. Rejected because it violates **FR-003** (identify error type and display appropriate message) and lowers UX quality.

---

## 4. Auto-Retry & Exponential Backoff Logic

- **Decision**: Track retry attempts (0 to 3) in the state of `AuthErrorBoundary`. When a retry is initiated, wait for an exponential backoff delay (`1s`, `2s`, `4s`) using a promise-based delay helper, and then reset the boundary state (which remounts `AuthProvider`).
- **Rationale**: Prevents overloading the backend or lockups on transient failures. Re-mounting `AuthProvider` ensures a clean bootstrap flow from scratch.
- **Alternatives considered**:
  - *Linear backoff*: Retrying with a constant 2-second delay. Rejected because exponential backoff is standard for resilient mobile clients (reduces load on recovering backends).
  - *Infinite retries*: Auto-retrying indefinitely. Rejected because it creates battery-draining loops on persistent failures and violates **FR-008**.

---

## 5. Storage & State Clearance (Recovery)

- **Decision**: Provide a "Clear Auth Data" button that executes `clearSessionToken()` and deletes authorization headers, resets the local state in `AuthProvider` (if mounted), and forces a redirect to the login screen (`/(auth)/tela_inicial`).
- **Rationale**: If a token is corrupted, clearing it is the only way to allow the user to log in again. Wiping the token ensures the next startup does not attempt to parse or validate invalid data.
- **Alternatives considered**:
  - *Manual app reinstall*: Forcing users to delete and reinstall the app. Rejected as it is a terrible user experience.
