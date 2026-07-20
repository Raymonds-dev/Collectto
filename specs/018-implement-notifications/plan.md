# Implementation Plan: Implement Notifications

**Branch**: `feature/018-implement-notifications` | **Date**: 2026-06-12 | **Spec**: [spec.md](file:///C:/Users/garam/.projetos/Collectto/frontend/specs/018-implement-notifications/spec.md)
**Input**: Feature specification from `/specs/018-implement-notifications/spec.md`

## Summary

- **Primary Requirement**: Implement a dropdown notifications modal triggered by a new bell icon in the Feed Header. The notifications list will support follow requests (with accept/decline actions and navigation to the requester's profile) and standard notification types (with redirection to context objects).
- **Technical Approach**:
  1. Create the `NotificationProvider` to fetch notifications from the `GET /notifications` endpoint and manage the unread count/read state.
  2. Modify the Feed Header in `src/app/(tabs)/index.tsx` to replace the settings gear icon with a bell-shaped notifications icon.
  3. Implement `NotificationDropdown` to display a scrollable list of notifications with smooth entry and touch transitions.
  4. Create a dedicated screen at `src/app/users/[userId].tsx` using the `getUserById` API endpoint to view other users' profiles.
  5. Configure the collection screen at `src/app/collections/[collectionId].tsx` to parse navigation parameters (`itemId`) and open the item detail modal on demand.

## Technical Context

- **Language/Version**: TypeScript / Node 20+
- **Primary Dependencies**: React Native, Expo (SDK 54), Expo Router, NativeWind, Axios, React Native Reanimated
- **Storage**: In-memory store (for notifications list and read status session cache)
- **Testing**: Jest, React Native Testing Library (`npm run test`)
- **Target Platform**: iOS, Android, Web
- **Project Type**: Mobile App
- **Performance Goals**: Dropdown displays in <0.5s, accept/decline actions complete in <2.0s, smooth scrolling (60fps) up to 50 notifications
- **Constraints**: Zero linter/TypeScript warnings/errors (`npm run validate` quality gate)
- **Scale/Scope**: 20-50 notifications scrollable in dropdown

## Constitution Check

- **Arrow Functions**: Assistive/helpers/utility functions, global callbacks, hooks, and providers MUST be declared via arrow functions assigned to constants.
- **Strict Typing**: TypeScript declarations MUST avoid `any`, using explicit types/interfaces and strict return types.
- **Quality Gates**: The project MUST pass `npm run validate` cleanly.
- **Resilient Errors**: API communication failures must be formatted and translated to Portuguese using the centralized error mapper.
- **Safe Logging**: No personal identifiable information (PII) like emails, JWT tokens, or credentials will be logged.
- **Branch and Commit Pattern**: Development in branch `feature/018-implement-notifications` and short commit messages in Portuguese.

## Project Structure

### Documentation (this feature)

```text
specs/018-implement-notifications/
├── plan.md              # This file
├── research.md          # Technical decisions and context
├── data-model.md        # State definitions and mappings
├── quickstart.md        # Manual verification guides
├── contracts/           # API contracts for notifications
│   └── api.md
└── tasks.md             # Implementation tasks (Phase 2 output)
```

### Source Code

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx                 # Header changes & dropdown trigger
│   │   │   └── profile.tsx               # Personal profile
│   │   └── users/
│   │       └── [userId].tsx              # New screen for other user profiles
│   │   └── collections/
│   │       └── [collectionId].tsx        # Opens item detail if itemId param exists
│   ├── components/
│   │   ├── notifications/
│   │   │   ├── NotificationDropdown.tsx  # Scrollable dropdown modal list
│   │   │   └── NotificationCard.tsx      # Renders individual notification card
│   ├── services/
│   │   └── api/
│   │       ├── api.ts                    # API endpoints mappings
│   │       └── notificationService.ts    # Service wrapper for notifications
│   ├── types/
│   │   └── notifications.ts              # Type definitions matching schemas
│   ├── hooks/
│   │   └── useNotifications.ts           # Hook to consume notification context
│   ├── providers/
│   │   └── NotificationProvider.tsx      # Provider managing notifications state
```

**Structure Decision**: Adheres to the established Expo Router route conventions and components structure. The other-user profile screen will be placed at `/users/[userId]` to cleanly distinguish it from the personal profile screen tab.
