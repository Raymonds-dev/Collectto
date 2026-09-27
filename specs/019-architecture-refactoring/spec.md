# Feature Specification: Architecture Refactoring and Service Decoupling

**Feature Branch**: `019-architecture-refactoring`  
**Created**: 2026-09-07  
**Status**: Draft  
**Input**: User description: "Com base no que conversamos quero ajustar os erros de arquitetura e estratégia encontrados, para manter o código mais limpo e organizado"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clean Social Feed & Post Strategy Separation (Priority: P1)

As a developer and user, I want the social feed, likes, and comments service layer to strictly separate live backend API calls from local debug mock data, so that network failures produce clear error feedback instead of silent mock fallbacks and mock files stay free of production API logic.

**Why this priority**: The social feed is a core feature of Collectto, and mixing HTTP API calls with fallback mock logic inside `mockPostService.ts` leads to unpredictable behavior, false positives during API outages, and architectural confusion.

**Independent Test**: Can be tested by switching `EXPO_PUBLIC_DEBUG_MODE` between `true` and `false`. In debug mode, posts and comments are served purely from memory. In live mode, all feed actions hit backend endpoints without falling back to mock data on network errors.

**Acceptance Scenarios**:

1. **Given** `EXPO_PUBLIC_DEBUG_MODE` is disabled (`false`), **When** viewing the feed or interacting with posts/comments, **Then** all requests MUST go through `apiPostService` hitting live endpoints (`social/feed`, `items/like`, `items/comments`) and network errors MUST trigger standard error handling instead of falling back to mock data.
2. **Given** `EXPO_PUBLIC_DEBUG_MODE` is enabled (`true`), **When** viewing the feed or interacting with posts/comments, **Then** all requests MUST be handled exclusively by `mockPostService` without performing any HTTP network calls.

---

### User Story 2 - Modular Authentication Provider & Utilities (Priority: P2)

As a developer, I want `AuthProvider` to be focused solely on managing React state and providing auth context actions, with JWT parsing, user profile payload mapping, form validations, and mock building extracted into dedicated utility modules.

**Why this priority**: `AuthProvider.tsx` grew into an 850+ line "God Component" containing inline JWT decoding, regex string validations, asset URL resolution, and inline mock user construction. Modularizing it improves maintainability, testability, and readability.

**Independent Test**: Can be tested by performing user registration, login, session restoration, and profile updates. All user state transitions work seamlessly while `AuthProvider` delegates token validation, profile mapping, and field validation to specialized modules.

**Acceptance Scenarios**:

1. **Given** a user logging in or restoring a session, **When** validating or decoding the JWT token, **Then** `AuthProvider` MUST delegate token validation and claim extraction to a dedicated `jwt.ts` utility.
2. **Given** user profile payloads received from API or debug mode, **When** normalizing user attributes and photo URLs, **Then** normalization MUST be handled by dedicated user mapper utilities (`userMappers.ts`) instead of inline provider code.
3. **Given** the `AuthProvider` context interface, **When** updating user profiles or photos, **Then** `updateUserProfile` MUST be the single clean entry point for partial user state updates, eliminating redundant/dead code like `updateUserPhoto`.

---

### User Story 3 - Unified Notification Service Strategy (Priority: P3)

As a developer, I want `NotificationProvider` to consume a unified notification service strategy (`apiNotificationService` or `mockNotificationService`) rather than evaluating `if (isDebugModeEnabled())` conditionals inside every action handler.

**Why this priority**: Scatterings of `if (isDebugModeEnabled())` checks and direct calls to `api.ts` within `NotificationProvider.tsx` create maintenance friction and duplicate state update logic.

**Independent Test**: Can be tested by fetching notifications and acting on follow requests (accept/decline/mark all as read) in both debug and live API modes, verifying consistent state updates and clean service delegation.

**Acceptance Scenarios**:

1. **Given** `NotificationProvider` initialization, **When** selecting the notification service, **Then** it MUST resolve the strategy once (`isDebugModeEnabled() ? mockNotificationService : apiNotificationService`).
2. **Given** follow request actions (accept/decline) or mark-all-as-read, **When** triggered by the user, **Then** `apiNotificationService` MUST encapsulate all backend API interactions (`notifications`, `acceptFollowRequest`, `declineFollowRequest`).

---

### User Story 4 - Impact Audit & Zero-Regression Safety (Priority: P1)

As a developer and stakeholder, I want a complete impact audit performed across the codebase before refactoring shared providers, services, and utilities, so that no external components, screens, or hooks break due to moved exports or altered signatures.

**Why this priority**: Shared providers like `AuthProvider` and services like `mockPostService` are imported across multiple screens and hooks. Moving or refactoring functions without auditing all usage sites risks breaking app features in subtle ways.

**Independent Test**: Verified by performing global symbol search across the codebase before refactoring, updating consumer imports/calls cleanly, and running full static validation (`npm run validate`).

**Acceptance Scenarios**:

1. **Given** any utility, service, or helper being moved (e.g. JWT helpers, photo resolvers, mock post services), **When** refactoring, **Then** all consumer import paths across the codebase MUST be identified via global search and updated without breaking existing invocations.
2. **Given** exported provider contexts (`AuthProvider`, `NotificationProvider`), **When** refactoring internal logic, **Then** public context types and function signatures MUST maintain backward compatibility for all consuming screens.

---

### Edge Cases

- What happens when a JWT token is malformed or expired during session bootstrap? The application MUST gracefully clear the session and redirect to the unauthenticated state without crashing.
- How does the system handle social feed API errors in live mode? Network and server errors MUST throw structured errors mapped to user-friendly Portuguese messages instead of falling back to mock data.
- What happens if partial profile update payload contains empty or invalid asset URLs? The user mapper utility MUST fall back to existing user values or valid defaults cleanly.
- What if an exported helper (e.g., `isValidJwtFormat` or `resolveProfileAssetUrl`) is imported directly in tests or secondary screens? The helper MUST be exported from its new utility module and re-exported from the provider if needed to avoid breaking existing imports.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST decouple live API post/feed operations from mock debug operations by creating a dedicated `apiPostService` and removing all HTTP logic and API fallback code from `mockPostService`.
- **FR-002**: System MUST extract JWT token format verification, expiration checking, payload decoding, and user ID claim resolution from `AuthProvider.tsx` into a dedicated `jwt.ts` utility module under `src/utils/`.
- **FR-003**: System MUST extract user profile normalization, asset URL resolution, and fallback mock user construction from `AuthProvider.tsx` into a dedicated `userMappers.ts` utility module under `src/utils/`.
- **FR-004**: System MUST extract sign-up field validations (such as username format and birthday date validation) from `AuthProvider.tsx` into a dedicated `validation.ts` utility module under `src/utils/`.
- **FR-005**: System MUST streamline `AuthProvider.tsx` state update methods by consolidating profile photo updates into `updateUserProfile` and removing redundant unused methods.
- **FR-006**: System MUST create a unified `apiNotificationService` interface in `src/services/api/notificationService.ts` that implements all notification actions (`getNotifications`, `markAllAsRead`, `acceptFollowRequest`, `declineFollowRequest`).
- **FR-007**: `NotificationProvider.tsx` MUST select the notification service strategy once upon initialization rather than branching with `if (isDebugModeEnabled())` inside individual action handlers.
- **FR-008**: System MUST perform a full codebase impact audit (using symbol search) before moving or refactoring exported helpers, types, services, or provider methods to verify all consumer import paths and invocation sites are preserved or cleanly updated.
- **FR-009**: System MUST preserve complete backward compatibility for public context interfaces and shared services consumed across app screens and hooks.

### Key Entities

- **PostService Strategy**: Interface contract for feed retrieval, liking/unliking posts, fetching comments, creating comments, and deleting comments. Implemented by `apiPostService` (production HTTP) and `mockPostService` (in-memory debug).
- **NotificationService Strategy**: Interface contract for notification listing, marking read, and responding to follow requests. Implemented by `apiNotificationService` and `mockNotificationService`.
- **JWT Utilities**: Module offering token structure validation, expiration check, and claim decoding for session bootstrapping.
- **User Mappers**: Utility functions normalizing API or token payload data into strong `AuthUser` domain models.
- **Impact Audit Mapping**: Registry of all files importing or using refactored symbols to guarantee zero broken references.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of social feed operations in live mode execute through `apiPostService` without triggering any mock data fallback on network failure.
- **SC-002**: `AuthProvider.tsx` code size is reduced from 850+ lines to under 350 lines by delegating non-React responsibilities to specialized utility modules.
- **SC-003**: 0% inline `if (isDebugModeEnabled())` branches inside `NotificationProvider` action handlers.
- **SC-004**: `npm run validate` (lint, type-check, format) passes with 0 errors and 0 warnings.
- **SC-005**: 0 broken imports or regression issues across all consuming screens, components, and hooks.

## Assumptions

- Existing API endpoints for social feed (`social/feed`, `items/like`, `items/comments`) and notifications (`notifications`, follow request endpoints) remain compatible with frontend data structures.
- TypeScript interfaces (`CollectionService`, `ItemService`, `NotificationSummary`, `AuthUser`) will serve as the source of truth for service contracts.
- Refactoring will preserve all existing user-facing UX, design system tokens, and motion standards.

