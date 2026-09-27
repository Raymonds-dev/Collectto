# Technical Research & Architectural Decisions

## Feature: 019-architecture-refactoring

### 1. Social Feed & Post Service Strategy Separation

- **Decision**: Split `mockPostService.ts` into two separate implementations conforming to a shared `PostService` contract:
  - `apiPostService`: Located in `src/services/api/postService.ts` (or `crudServices.ts`). Implements HTTP API calls for `social/feed`, `items/like`, `items/comments`, and comment creation/deletion. Throws errors on failure without falling back to mock data.
  - `mockPostService`: Located in `src/services/debug/mockPostService.ts`. Implements purely in-memory data operations using `debugSession`. Contains no HTTP Axios imports or network try/catch blocks.
  - `PostContextProvider` (or direct resolution in hooks/providers): Resolves `isDebugModeEnabled() ? mockPostService : apiPostService`.
- **Rationale**: Clean Strategy Pattern prevents silent fallbacks to mock data when network failures occur in live production mode. Keeps debug code isolated from production bundle dependencies.
- **Alternatives Considered**:
  - *Keeping fallbacks in `mockPostService`*: Rejected because network errors in live mode were masked by mock data, hiding real backend bugs and breaking expected error feedback.

### 2. Modularizing AuthProvider into Utility Domains

- **Decision**: Extract non-React logic out of `AuthProvider.tsx` into modular utilities:
  - `src/utils/jwt.ts`: Encapsulates `isValidJwtFormat`, `isTokenExpired`, `decodeBase64Url`, `decodeJwtPayload`, `resolveUserIdFromToken`.
  - `src/utils/userMappers.ts`: Encapsulates `resolveProfileAssetUrl`, `isLocalAssetUrl`, `resolveRawProfilePictureUrl`, `resolveAuthUserFromProfile`, `resolveAuthUserFromToken`, `buildMockAuthUser`.
  - `src/utils/validation.ts`: Encapsulates sign-up field validations (`username` regex `/^[a-z0-9_]+$/`, `birthdayDate` format `/^\d{4}-\d{2}-\d{2}$/`).
  - Re-export helpers from `AuthProvider.tsx` if imported by other components/tests to ensure backward compatibility.
- **Rationale**: `AuthProvider.tsx` was 850+ lines long with 5 distinct responsibilities. Separating utility logic restores single responsibility, enables isolated unit testing of JWT and mapping functions, and reduces `AuthProvider` to ~300 lines.
- **Alternatives Considered**:
  - *Extracting custom hooks for each auth action inside `AuthProvider`*: Rejected as overly complex; standard helper functions in `src/utils/` are cleaner, side-effect free, and easier to test.

### 3. Unified Notification Service Strategy

- **Decision**: Unify notification API calls into `apiNotificationService` in `src/services/api/notificationService.ts`:
  - Implements `getNotifications`, `markAllAsRead`, `acceptFollowRequest`, and `declineFollowRequest`.
  - Align `mockNotificationService` in `src/services/debug/mockNotificationService.ts` to implement the same interface.
  - Simplify `NotificationProvider.tsx` to resolve `const service = isDebugModeEnabled() ? mockNotificationService : apiNotificationService` once during initialization.
- **Rationale**: Removes 4 redundant `if (isDebugModeEnabled())` branches inside `NotificationProvider.tsx` action handlers, centralizing network calls and state updates cleanly.
- **Alternatives Considered**:
  - *Keeping API calls in `NotificationProvider.tsx`*: Rejected because it mixed React state management with direct Axios network calls and scattered debug conditionals.

### 4. Codebase Impact Audit & Zero-Regression Strategy

- **Decision**: Perform global symbol searches (`grep_search`) for every exported symbol being moved or modified (`isValidJwtFormat`, `decodeJwtPayload`, `resolveProfileAssetUrl`, `updateUserPhoto`, `mockPostService`, `getNotifications`, `acceptFollowRequest`, `declineFollowRequest`) before making changes. Re-export moved symbols from their original locations if consumed externally. Run `npm run validate` to verify 0 lint, format, or type-check errors.
- **Rationale**: Guarantees no broken imports or broken contract assumptions across screens, hooks, and tests.
