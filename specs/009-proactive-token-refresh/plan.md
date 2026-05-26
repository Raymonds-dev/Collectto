# Implementation Plan: Proactive Token Expiration Handling (Silent Refresh + Logout)

**Branch**: `feature/009-proactive-token-refresh` | **Date**: 2026-05-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-proactive-token-refresh/spec.md`

## Summary
Implement a secure, background session validation and silent token refresh cycle, alongside centralized interception of 401 errors. This proactive approach prevents user session expiration during active use, while the reactive 401 interception ensures the user is logged out silently without intrusive error messages if the session does expire.

## Technical Context

**Language/Version**: TypeScript ~5.9.2, React 19.1.0, React Native 0.81.5, Expo 54.0.34  
**Primary Dependencies**: `axios`, `expo-router`, `expo-secure-store`, `react-native-reanimated`  
**Storage**: `expo-secure-store` (for access tokens)  
**Testing**: Manual test runs, mock-based verification via debug mode (`EXPO_PUBLIC_DEBUG_MODE=true`), and custom token expiration testing.  
**Target Platform**: iOS 15+, Android 12+, Web (Expo cross-platform compatibility)  
**Project Type**: Mobile Application (React Native / Expo Client)  
**Performance Goals**: Token refresh triggered 5 minutes ± 10 seconds before expiration; 401 detection and redirect occurring within 1 second of response; 100ms startup check redirect for expired tokens.  
**Constraints**: Silent operation (zero UI loading indicator during background refresh), event-driven scheduler with no periodic background wake-locks (zero CPU polling), timezone-aware expiration matching UTC, thread-safe session de-authorization.  
**Scale/Scope**: Reusable globally in `AuthProvider` and `api` client layers.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Consistência > Criatividade Isolada**: 
   * The new refresh flow MUST build directly on the existing `AuthProvider` state and `api.ts` Axios instance instead of creating a secondary token/auth storage mechanism.
   * `expo-secure-store` is used as the single source of truth for token persistence.
2. **Performance (SC-006 / SC-009)**:
   * Timers MUST be event-driven via `setTimeout` instead of periodic polling intervals.
   * Internal attempt logs are capped to the last 50 entries to guarantee zero memory growth after repeated cycles.
   * All timers MUST be cleaned up on logout/unmount to prevent memory leaks.
3. **Fluidez Acima de Complexidade**:
   * The proactive validation MUST happen completely silently, without showing any blocking loading spinners, modals, or toasts.
   * Redirection to the login screen on unauthorized detection must happen silently (no technical 401 error alerts or dialogs).
4. **Engineering Guidelines**:
   * Shared business logic (time decoding, scheduler, connection checkers) is extracted into the dedicated helper class `SessionRefreshManager`.
   * Public APIs and callbacks have strict TypeScript interfaces.

## Project Structure

### Documentation (this feature)

```text
specs/009-proactive-token-refresh/
├── plan.md              # This plan
├── research.md          # Research choices and rationale
├── data-model.md        # Entities, validation, and storage strategies
├── quickstart.md        # Developer guide
└── contracts/           # API and hook interface contracts
    ├── refresh-manager.md
    └── api-interceptor.md
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/collectto/api_collectto/
│   ├── infrastructure/
│   │   └── security/
│   │       └── SecurityFilter.java
│   └── presentation/
│       └── controllers/
│           └── UserController.java

frontend/
├── src/
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── providers/
│   │   └── AuthProvider.tsx
│   ├── services/
│   │   ├── api/
│   │   │   └── api.ts
│   │   ├── auth/
│   │   │   └── sessionRefreshManager.ts
│   │   └── storage/
│   │       └── authSession.ts
│   └── types/
│       └── auth-refresh.d.ts
```

**Structure Decision**: 
The frontend follows a clean separation of concerns. Local session storage helpers reside in `src/services/storage`, the refresh timers and connection synchronization logic are encapsulated in `src/services/auth/sessionRefreshManager.ts`, and the React context state is handled in `src/providers/AuthProvider.tsx`. The API client resides in `src/services/api/api.ts`. The backend Spring Boot code is referenced to ensure alignment on authorization filters and UserController contracts.

## Complexity Tracking

> **No constitution violations are present. All designs conform to established core principles.**
