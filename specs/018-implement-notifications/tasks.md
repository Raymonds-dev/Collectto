# Tasks: Implement Notifications

**Input**: Design documents from `/specs/018-implement-notifications/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and types setup

- [x] T001 Configure types for notifications in src/types/notifications.ts
- [x] T002 [P] Configure api endpoint helper functions in src/services/api/api.ts
- [x] T003 [P] Create notification API service client in src/services/api/notificationService.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state and layout provider initialization

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create NotificationProvider in src/providers/NotificationProvider.tsx
- [x] T005 [P] Create the hook useNotifications in src/hooks/useNotifications.ts
- [x] T006 Integrate NotificationProvider into root layout in src/app/_layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Viewing Notifications in Dropdown (Priority: P1) 🎯 MVP

**Goal**: As a user, I want to click a notifications icon in the feed header to open a dropdown modal containing my list of notifications so that I can see recent social updates.

**Independent Test**: Tap the Notifications icon in the header. Verify the dropdown opens smoothly displaying notifications list (or empty state if there are none).

### Implementation for User Story 1

- [x] T007 [US1] Create the notification card component in src/components/notifications/NotificationCard.tsx
- [x] T008 [US1] Create the dropdown list component in src/components/notifications/NotificationDropdown.tsx
- [x] T009 [US1] Modify Feed Header and integrate dropdown in src/app/(tabs)/index.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Handling Follow Requests (Priority: P1)

**Goal**: As a user, I want to see follow requests in my notifications list, click on the requester's avatar or name to view their profile, and accept or decline their request directly from the notification card.

**Independent Test**: Receive a follow request. Open dropdown. Click "Accept" and verify status changes to "Request accepted" and buttons get disabled. Navigate to profile and verify route works.

### Implementation for User Story 2

- [x] T010 [P] [US2] Update notification card UI actions in src/components/notifications/NotificationCard.tsx
- [x] T011 [US2] Implement follow request accept/decline action handlers in src/providers/NotificationProvider.tsx
- [x] T012 [US2] Create other user profile screen in src/app/users/[userId].tsx
- [x] T013 [US2] Integrate profile routing in src/components/notifications/NotificationCard.tsx

**Checkpoint**: User Story 1 and 2 are fully functional and work together.

---

## Phase 5: User Story 3 - Navigating to Context Objects (Priority: P2)

**Goal**: As a user, I want to click on standard notifications (Request Accepted, Collection Followed, Item Commented, Item Liked) and be redirected to the relevant object in the app so that I can easily engage with the activity.

**Independent Test**: Tap an item liked notification, verify redirection to collection view with the item detail modal opened.

### Implementation for User Story 3

- [x] T014 [US3] Implement context redirections in src/components/notifications/NotificationCard.tsx
- [x] T015 [US3] Update collection details screen to handle item parameters in src/app/collections/[collectionId].tsx

**Checkpoint**: All user stories are functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: General formatting, errors and quickstart validation

- [x] T016 [P] Verify error mapping and logs in src/components/notifications/NotificationCard.tsx
- [x] T017 Run quickstart.md validation to verify implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User Story 1 (P1): Can be implemented immediately after Foundation.
  - User Story 2 (P2): Depends on User Story 1 card layout.
  - User Story 3 (P3): Depends on User Story 1 and 2 card layouts.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Setup tasks `T002` and `T003` can run in parallel.
- Foundational task `T005` can run in parallel with `T004`.
- Under US2, `T010` (card actions UI) and `T012` (new screen layout) can run in parallel.

---

## Parallel Example: User Story 2

```bash
# Developer A starts creating the User profile screen:
Task: "Create other user profile screen in src/app/users/[userId].tsx"

# Developer B updates the Notification Card UI:
Task: "Update notification card UI actions in src/components/notifications/NotificationCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Blocks all stories)
3. Complete Phase 3: User Story 1 (Viewing notifications in dropdown)
4. **STOP and VALIDATE**: Verify dropdown and icon behavior in emulator.

### Incremental Delivery

1. Setup + Foundation -> Foundation Ready
2. Add US1 -> Test dropdown -> Deploy (MVP!)
3. Add US2 -> Test follow request actions + routing -> Deploy
4. Add US3 -> Test standard redirections -> Deploy
5. Polish and final validate.
